import { expoDb } from './client';

type SyncIngredient = {
  id: number;
  formal_name: string;
  common_name: string | null;
  last_updated: string;
};

type SyncTag = {
  id: number;
  name: string;
  color: string | null;
};

type SyncResearch = {
  id: number;
  is_link: boolean;
  last_checked: string | null;
  link: string | null;
  document: unknown | null;
  summary: string | null;
};

type SyncSnapshot = {
  schemaVersion: number;
  generatedAt: string;
  ingredients: SyncIngredient[];
  tags: SyncTag[];
  ingredientTags: { id: number; ingredient_id: number; tag_id: number }[];
  descriptions: {
    id: number;
    ingredient_id: number;
    description_short: string | null;
    description_long: string | null;
  }[];
  research: SyncResearch[];
  determinations: { id: number; ingredient_id: number; confidence: string; text: string }[];
  ingredientResearch: { id: number; ingredient_id: number; research_id: number }[];
};

export async function applyReferenceSnapshot(snapshot: SyncSnapshot) {
  if (snapshot.schemaVersion !== 1) {
    throw new Error(`Unsupported sync schema version: ${snapshot.schemaVersion}`);
  }

  const requiredTables = [
    'ingredients',
    'tags',
    'ingredientTags',
    'descriptions',
    'research',
    'determinations',
    'ingredientResearch',
  ] as const;

  for (const table of requiredTables) {
    if (!Array.isArray(snapshot[table])) {
      throw new Error(`Invalid sync snapshot: ${table} must be an array`);
    }
  }

  if (requiredTables.every((table) => snapshot[table].length === 0)) {
    throw new Error('The remote database is empty. Local data was not changed.');
  }

  await expoDb.withTransactionAsync(async () => {
    const transaction = expoDb;

    await transaction.execAsync(`
      CREATE TEMP TABLE IF NOT EXISTS _sync_snapshot_ids (
        table_name TEXT NOT NULL,
        id INTEGER NOT NULL,
        PRIMARY KEY (table_name, id)
      );
      DELETE FROM _sync_snapshot_ids;
    `);

    for (const row of snapshot.ingredients) {
      await transaction.runAsync(
        `INSERT INTO ingredients (id, formal_name, common_name, last_updated)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           formal_name = excluded.formal_name,
           common_name = excluded.common_name,
           last_updated = excluded.last_updated`,
        [row.id, row.formal_name, row.common_name, row.last_updated],
      );
      await transaction.runAsync('INSERT INTO _sync_snapshot_ids (table_name, id) VALUES (?, ?)', [
        'ingredients',
        row.id,
      ]);
    }

    for (const row of snapshot.tags) {
      await transaction.runAsync(
        `INSERT INTO tags (id, name, color) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET name = excluded.name, color = excluded.color`,
        [row.id, row.name, row.color],
      );
      await transaction.runAsync('INSERT INTO _sync_snapshot_ids (table_name, id) VALUES (?, ?)', [
        'tags',
        row.id,
      ]);
    }

    for (const row of snapshot.research) {
      await transaction.runAsync(
        `INSERT INTO research (id, is_link, last_checked, link, document, summary)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           is_link = excluded.is_link,
           last_checked = excluded.last_checked,
           link = excluded.link,
           document = excluded.document,
           summary = excluded.summary`,
        [
          row.id,
          row.is_link ? 1 : 0,
          row.last_checked,
          row.link,
          row.document === null ? null : JSON.stringify(row.document),
          row.summary,
        ],
      );
      await transaction.runAsync('INSERT INTO _sync_snapshot_ids (table_name, id) VALUES (?, ?)', [
        'research',
        row.id,
      ]);
    }

    await transaction.execAsync(`
      DELETE FROM ingredient_tags;
      DELETE FROM descriptions;
      DELETE FROM determinations;
      DELETE FROM ingredient_research;
    `);

    await transaction.runAsync(
      `DELETE FROM ingredients
       WHERE NOT EXISTS (
         SELECT 1 FROM _sync_snapshot_ids WHERE table_name = 'ingredients' AND id = ingredients.id
       )`,
    );
    await transaction.runAsync(
      `DELETE FROM tags
       WHERE NOT EXISTS (
         SELECT 1 FROM _sync_snapshot_ids WHERE table_name = 'tags' AND id = tags.id
       )`,
    );
    await transaction.runAsync(
      `DELETE FROM research
       WHERE NOT EXISTS (
         SELECT 1 FROM _sync_snapshot_ids WHERE table_name = 'research' AND id = research.id
       )`,
    );

    for (const row of snapshot.ingredientTags) {
      await transaction.runAsync(
        'INSERT INTO ingredient_tags (id, ingredient_id, tag_id) VALUES (?, ?, ?)',
        [row.id, row.ingredient_id, row.tag_id],
      );
    }

    for (const row of snapshot.descriptions) {
      await transaction.runAsync(
        `INSERT INTO descriptions (id, ingredient_id, description_short, description_long)
         VALUES (?, ?, ?, ?)`,
        [row.id, row.ingredient_id, row.description_short, row.description_long],
      );
    }

    for (const row of snapshot.determinations) {
      await transaction.runAsync(
        'INSERT INTO determinations (id, ingredient_id, confidence, text) VALUES (?, ?, ?, ?)',
        [row.id, row.ingredient_id, row.confidence, row.text],
      );
    }

    for (const row of snapshot.ingredientResearch) {
      await transaction.runAsync(
        'INSERT INTO ingredient_research (id, ingredient_id, research_id) VALUES (?, ?, ?)',
        [row.id, row.ingredient_id, row.research_id],
      );
    }
  });
}

export type { SyncSnapshot };

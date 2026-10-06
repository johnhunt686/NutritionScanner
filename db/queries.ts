import { sql, eq, or, and } from 'drizzle-orm';
import { db } from './client';
import {
  ingredients,
  tags,
  descriptions,
  research,
  determinations,
  preferences,
  ingredientResearch,
  userSettings,
  Ingredient,
} from './schema';

// ==========================================
// 1. Search by Ingredient Name (FTS)
// ==========================================
export async function searchIngredientsByName(searchTerm: string): Promise<Ingredient[]> {
  if (!searchTerm.trim()) return [];
  const formattedQuery = `${searchTerm.trim()}*`;

  // Raw SQL is best here to leverage SQLite's FTS virtual tables and rank scoring
  return await db.all<Ingredient>(
    sql`
      SELECT i.* 
      FROM ingredients i
      JOIN ingredients_fts fts ON i.id = fts.rowid
      WHERE ingredients_fts MATCH ${formattedQuery}
      ORDER BY rank;
    `,
  );
}

// ==========================================
// 2. Search by Ingredient Name and/or Tag
// ==========================================
export async function searchIngredientsWithTags(searchTerm?: string, tagName?: string) {
  let query = db
    .selectDistinct({
      id: ingredients.id,
      formalName: ingredients.formalName,
      commonName: ingredients.commonName,
      lastUpdated: ingredients.lastUpdated,
    })
    .from(ingredients)
    .$dynamic();

  // Conditionally join tags if a tag search is requested
  if (tagName) {
    query = query.innerJoin(tags, eq(tags.ingredientId, ingredients.id));
  }

  const conditions = [];

  // Add tag filter
  if (tagName) {
    conditions.push(eq(tags.name, tagName));
  }

  // Add name filter (Using standard LIKE here for combined dynamic queries,
  // though you could swap this for an FTS join if full-text is strictly needed)
  if (searchTerm) {
    const term = `%${searchTerm}%`;
    conditions.push(
      or(sql`${ingredients.formalName} LIKE ${term}`, sql`${ingredients.commonName} LIKE ${term}`),
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}

// ==========================================
// 3. Ingredients with Attached Data (Full Profile)
// ==========================================
// Note: Since `relations()` aren't defined in schema.ts, executing concurrent
// reads is the most performant way to assemble a 1-to-many object graph.
export async function getIngredientProfile(ingredientId: number) {
  const [ingredient] = await db.select().from(ingredients).where(eq(ingredients.id, ingredientId));

  if (!ingredient) return null;

  // Run dependent queries concurrently for maximum speed
  const [ingTags, ingDescriptions, ingDeterminations, ingResearch] = await Promise.all([
    db.select().from(tags).where(eq(tags.ingredientId, ingredientId)),
    db.select().from(descriptions).where(eq(descriptions.ingredientId, ingredientId)),
    db.select().from(determinations).where(eq(determinations.ingredientId, ingredientId)),

    // Join the junction table to get the actual research documents
    db
      .select({
        id: research.id,
        isLink: research.isLink,
        summary: research.summary,
        link: research.link,
      })
      .from(ingredientResearch)
      .innerJoin(research, eq(ingredientResearch.researchId, research.id))
      .where(eq(ingredientResearch.ingredientId, ingredientId)),
  ]);

  return {
    ...ingredient,
    tags: ingTags,
    descriptions: ingDescriptions,
    determinations: ingDeterminations,
    research: ingResearch,
  };
}

// ==========================================
// 4. Search through Research by Ingredient or Tag
// ==========================================
export async function searchResearch(options: {
  searchTerm?: string;
  ingredientId?: number;
  tagId?: number;
}) {
  let query = db
    .selectDistinct({
      id: research.id,
      summary: research.summary,
      link: research.link,
      lastChecked: research.lastChecked,
    })
    .from(research)
    .leftJoin(ingredientResearch, eq(ingredientResearch.researchId, research.id))
    .leftJoin(tags, eq(tags.ingredientId, ingredientResearch.ingredientId))
    .$dynamic();

  const conditions = [];

  if (options.ingredientId) {
    conditions.push(eq(ingredientResearch.ingredientId, options.ingredientId));
  }

  if (options.tagId) {
    conditions.push(eq(tags.id, options.tagId));
  }

  if (options.searchTerm) {
    // Utilize the FTS virtual table for research summaries
    const term = `${options.searchTerm.trim()}*`;
    query = query.innerJoin(
      sql`research_fts`,
      sql`research.id = research_fts.rowid AND research_fts MATCH ${term}`,
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query;
}

// ==========================================
// 5. Add or Update Preferences
// ==========================================
export async function upsertPreference(alert: boolean, ingredientId?: number, tagId?: number) {
  if (!ingredientId && !tagId) throw new Error('Must provide either ingredientId or tagId');

  // Assumes you added the unique indexes mentioned above to schema.ts
  return await db
    .insert(preferences)
    .values({
      alert,
      ingredientId: ingredientId ?? null,
      tagId: tagId ?? null,
    })
    .onConflictDoUpdate({
      // SQLite requires knowing exactly which constraint triggered the conflict
      target: ingredientId ? preferences.ingredientId : preferences.tagId,
      set: { alert },
    })
    .returning();
}

// ==========================================
// 6. View Preferences (With joined context)
// ==========================================
export async function getPreferences() {
  return await db
    .select({
      preferenceId: preferences.id,
      alert: preferences.alert,

      // Ingredient Context
      ingredientId: ingredients.id,
      formalName: ingredients.formalName,

      // Tag Context
      tagId: tags.id,
      tagName: tags.name,
      tagColor: tags.color,
    })
    .from(preferences)
    .leftJoin(ingredients, eq(preferences.ingredientId, ingredients.id))
    .leftJoin(tags, eq(preferences.tagId, tags.id));
}

// ==========================================
// 7. User Settings
// ==========================================
function serializeSettingValue(value: unknown): string {
  return JSON.stringify(value);
}

function parseStoredSettingValue(value: string | null | undefined): unknown {
  if (value === null || value === undefined) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export async function getUserSettings() {
  const rows = await db
    .select({
      key: userSettings.settingKey,
      value: userSettings.settingValue,
      updatedAt: userSettings.updatedAt,
    })
    .from(userSettings)
    .orderBy(userSettings.settingKey);

  return rows.map((row) => ({
    key: row.key,
    value: parseStoredSettingValue(row.value),
    updatedAt: row.updatedAt,
  }));
}

export async function updateUserSetting(settingKey: string, value: unknown) {
  const trimmedKey = settingKey.trim();

  if (!trimmedKey) {
    throw new Error('Setting key is required');
  }

  const serializedValue = serializeSettingValue(value);
  const now = new Date().toISOString();

  const [row] = await db
    .insert(userSettings)
    .values({
      settingKey: trimmedKey,
      settingValue: serializedValue,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userSettings.settingKey,
      set: {
        settingValue: serializedValue,
        updatedAt: now,
      },
    })
    .returning({
      id: userSettings.id,
      key: userSettings.settingKey,
      value: userSettings.settingValue,
      updatedAt: userSettings.updatedAt,
    });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    key: row.key,
    value: parseStoredSettingValue(row.value),
    updatedAt: row.updatedAt,
  };
}

export async function upsertUserSetting(settingKey: string, value: unknown) {
  return updateUserSetting(settingKey, value);
}

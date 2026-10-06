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
  ingredientTags,
  Ingredient,
} from './schema';

// ==========================================
// 1. Search by Ingredient Name (FTS)
// ==========================================
export async function searchIngredientsByName(
  searchTerm: string,
): Promise<Ingredient[]> {
  const trimmedTerm = searchTerm.trim();

  if (!trimmedTerm) return [];

  const escapedTerm = trimmedTerm.replace(/"/g, '""');
  const formattedQuery = `"${escapedTerm}"*`;

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

  if (tagName) {
    query = query
      .innerJoin(ingredientTags, eq(ingredientTags.ingredientId, ingredients.id))
      .innerJoin(tags, eq(tags.id, ingredientTags.tagId));
  }

  const conditions = [];

  if (tagName) {
    conditions.push(eq(tags.name, tagName));
  }

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
    db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
      })
      .from(ingredientTags)
      .innerJoin(tags, eq(ingredientTags.tagId, tags.id))
      .where(eq(ingredientTags.ingredientId, ingredientId)),
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
    .leftJoin(ingredientTags, eq(ingredientTags.ingredientId, ingredientResearch.ingredientId))
    .leftJoin(tags, eq(tags.id, ingredientTags.tagId))
    .$dynamic();

  const conditions = [];

  if (options.ingredientId) {
    conditions.push(eq(ingredientResearch.ingredientId, options.ingredientId));
  }

  if (options.tagId) {
    conditions.push(eq(tags.id, options.tagId));
  }

  if (options.searchTerm) {
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

export async function getAllIngredients() {
  return await db
    .select({
      id: ingredients.id,
      formalName: ingredients.formalName,
      commonName: ingredients.commonName,
    })
    .from(ingredients)
    .orderBy(ingredients.formalName);
}

export async function getAllTags() {
  return await db
    .select({
      id: tags.id,
      name: tags.name,
      color: tags.color,
    })
    .from(tags)
    .orderBy(tags.name);
}

export async function deletePreference(ingredientId?: number, tagId?: number) {
  if (!ingredientId && !tagId) throw new Error('Must provide either ingredientId or tagId');

  let query = db.delete(preferences).where(eq(preferences.ingredientId, ingredientId ?? -1));

  if (tagId) {
    query = db.delete(preferences).where(eq(preferences.tagId, tagId));
  }

  return await query;
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

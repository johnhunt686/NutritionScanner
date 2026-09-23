import { sql } from 'drizzle-orm';
import { db } from './client';
import { ingredients, tags, Ingredient } from './schema';

// 1. Debug Query: Sub-millisecond FTS search across Ingredient Formal & Common names
export async function searchIngredients(searchTerm: string): Promise<Ingredient[]> {
  if (!searchTerm.trim()) return [];

  const formattedQuery = `${searchTerm.trim()}*`;

  const results = await db.all<Ingredient>(
    sql`
      SELECT 
        i.id, 
        i.formal_name AS formalName, 
        i.common_name AS commonName, 
        i.last_updated AS lastUpdated
      FROM ingredients i
      JOIN ingredients_fts fts ON i.id = fts.rowid
      WHERE ingredients_fts MATCH ${formattedQuery}
      ORDER BY rank;
    `
  );

  return results;
}

// 2. Debug Query: Seed test record inside a transaction to verify Foreign Keys & FTS triggers
export async function insertDebugIngredient(
  formalName: string,
  commonName: string,
  tagName: string
) {
  return await db.transaction(async (tx) => {
    // Inserts ingredient (triggers FTS insert trigger automatically)
    const [newIngredient] = await tx
      .insert(ingredients)
      .values({
        formalName,
        commonName,
      })
      .returning();

    // Inserts tag tied to foreign key
    await tx.insert(tags).values({
      ingredientId: newIngredient.id,
      name: tagName,
      color: '#FF4500',
    });

    return newIngredient;
  });
}
import { sql } from 'drizzle-orm';
import { db } from './client';
import { products, NewProduct, Product } from './schema';

// Sub-millisecond Full-Text Search across Name & Long Description
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  if (!searchTerm.trim()) return [];

  const formattedQuery = `${searchTerm.trim()}*`;

  // `db.all` returns the array of result rows directly
  const results = await db.all<Product>(
    sql`
      SELECT p.id, p.barcode, p.name, p.long_description AS longDescription, p.updated_at AS updatedAt
      FROM products p
      JOIN products_fts fts ON p.id = fts.rowid
      WHERE products_fts MATCH ${formattedQuery}
      ORDER BY rank;
    `
  );

  return results;
}

// Transactional Batch Upsert for Remote Sync Payload
export async function upsertSyncedProducts(items: NewProduct[]) {
  if (items.length === 0) return;

  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx
        .insert(products)
        .values(item)
        .onConflictDoUpdate({
          target: products.barcode,
          set: {
            name: item.name,
            longDescription: item.longDescription,
            updatedAt: item.updatedAt,
          },
        });
    }
  });
}
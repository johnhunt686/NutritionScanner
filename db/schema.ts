import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    barcode: text('barcode').notNull().unique(),
    name: text('name').notNull(),
    longDescription: text('long_description').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    barcodeIdx: index('products_barcode_idx').on(table.barcode),
  })
);

// Crucial: Export these types so queries.ts can import them
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
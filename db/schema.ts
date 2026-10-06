import { sqliteTable, text, integer, index, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ==========================================
// INGREDIENTS
// ==========================================
export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  formalName: text('formal_name').notNull(),
  commonName: text('common_name'),
  lastUpdated: text('last_updated')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export type Ingredient = typeof ingredients.$inferSelect;
export type NewIngredient = typeof ingredients.$inferInsert;

// ==========================================
// TAGS
// ==========================================
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color'),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

// ==========================================
// INGREDIENT TAGS (Junction Table)
// ==========================================
export const ingredientTags = sqliteTable(
  'ingredient_tags',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    ingredientIdx: index('ingredient_tags_ingredient_id_idx').on(table.ingredientId),
    tagIdx: index('ingredient_tags_tag_id_idx').on(table.tagId),
    uniquePair: uniqueIndex('ingredient_tags_unique_idx').on(table.ingredientId, table.tagId),
  }),
);

export type IngredientTag = typeof ingredientTags.$inferSelect;
export type NewIngredientTag = typeof ingredientTags.$inferInsert;

// ==========================================
// DESCRIPTIONS
// ==========================================
export const descriptions = sqliteTable(
  'descriptions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    descriptionShort: text('description_short'),
    descriptionLong: text('description_long'),
  },
  (table) => ({
    ingredientIdx: index('descriptions_ingredient_id_idx').on(table.ingredientId),
  }),
);

export type Description = typeof descriptions.$inferSelect;
export type NewDescription = typeof descriptions.$inferInsert;

// ==========================================
// RESEARCH
// ==========================================
export const research = sqliteTable('research', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isLink: integer('is_link', { mode: 'boolean' }).notNull().default(false),
  lastChecked: text('last_checked'),
  link: text('link'),
  document: text('document', { mode: 'json' }), // Automatically serializes/deserializes JSON objects
  summary: text('summary'),
});

export type Research = typeof research.$inferSelect;
export type NewResearch = typeof research.$inferInsert;

// ==========================================
// DETERMINATIONS
// ==========================================
export const determinations = sqliteTable(
  'determinations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    confidence: text('confidence').notNull(),
    text: text('text').notNull(),
  },
  (table) => ({
    ingredientIdx: index('determinations_ingredient_id_idx').on(table.ingredientId),
  }),
);

export type Determination = typeof determinations.$inferSelect;
export type NewDetermination = typeof determinations.$inferInsert;

// ==========================================
// PREFERENCES
// ==========================================
export const preferences = sqliteTable(
  'preferences',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
    ingredientId: integer('ingredient_id').references(() => ingredients.id, {
      onDelete: 'cascade',
    }),
    alert: integer('alert', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => ({
    // Replaced standard index with uniqueIndex to support upserts
    uniqueTag: uniqueIndex('pref_unique_tag_idx').on(table.tagId),
    uniqueIngredient: uniqueIndex('pref_unique_ingredient_idx').on(table.ingredientId),

    // Kept your excellent mutex check
    mutexCheck: check(
      'preferences_mutex_check',
      sql`(tag_id IS NOT NULL AND ingredient_id IS NULL) OR (tag_id IS NULL AND ingredient_id IS NOT NULL)`,
    ),
  }),
);

export type Preference = typeof preferences.$inferSelect;
export type NewPreference = typeof preferences.$inferInsert;

// ==========================================
// INGREDIENT RESEARCH (Junction Table)
// ==========================================
export const ingredientResearch = sqliteTable(
  'ingredient_research',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ingredientId: integer('ingredient_id')
      .notNull()
      .references(() => ingredients.id, { onDelete: 'cascade' }),
    researchId: integer('research_id')
      .notNull()
      .references(() => research.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    ingredientIdx: index('ing_res_ingredient_id_idx').on(table.ingredientId),
    researchIdx: index('ing_res_research_id_idx').on(table.researchId),
    uniquePair: uniqueIndex('ing_res_unique_idx').on(table.ingredientId, table.researchId),
  }),
);

export type IngredientResearch = typeof ingredientResearch.$inferSelect;
export type NewIngredientResearch = typeof ingredientResearch.$inferInsert;

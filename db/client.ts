import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('nutrition.db', { enableChangeListener: true });

//For somereason the db doesnt work if there isnt a log here if you know why you should fix.
console.log('[DB] nutrition.db opened');

// Enable PRAGMAs
expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = ON;');

// ==========================================
// BASE TABLES
// ==========================================
expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formal_name TEXT NOT NULL,
    common_name TEXT,
    last_updated TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT
  );
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS ingredient_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE (ingredient_id, tag_id)
  );
`);

expoDb.execSync(`
  CREATE INDEX IF NOT EXISTS ingredient_tags_ingredient_id_idx ON ingredient_tags (ingredient_id);
  CREATE INDEX IF NOT EXISTS ingredient_tags_tag_id_idx ON ingredient_tags (tag_id);
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS descriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    description_short TEXT,
    description_long TEXT,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
  );
`);

expoDb.execSync(`
  CREATE INDEX IF NOT EXISTS descriptions_ingredient_id_idx ON descriptions (ingredient_id);
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS research (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_link INTEGER NOT NULL DEFAULT 0,
    last_checked TEXT,
    link TEXT,
    document TEXT,
    summary TEXT
  );
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS determinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    confidence TEXT NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
  );
`);

expoDb.execSync(`
  CREATE INDEX IF NOT EXISTS determinations_ingredient_id_idx ON determinations (ingredient_id);
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_id INTEGER,
    ingredient_id INTEGER,
    alert INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    CHECK ((tag_id IS NOT NULL AND ingredient_id IS NULL) OR (tag_id IS NULL AND ingredient_id IS NOT NULL))
  );
`);

expoDb.execSync(`
  CREATE UNIQUE INDEX IF NOT EXISTS pref_unique_tag_idx ON preferences (tag_id);
  CREATE UNIQUE INDEX IF NOT EXISTS pref_unique_ingredient_idx ON preferences (ingredient_id);
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS ingredient_research (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    research_id INTEGER NOT NULL,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (research_id) REFERENCES research(id) ON DELETE CASCADE
  );
`);

expoDb.execSync(`
  CREATE INDEX IF NOT EXISTS ing_res_ingredient_id_idx ON ingredient_research (ingredient_id);
  CREATE INDEX IF NOT EXISTS ing_res_research_id_idx ON ingredient_research (research_id);
  CREATE UNIQUE INDEX IF NOT EXISTS ing_res_unique_idx ON ingredient_research (ingredient_id, research_id);
`);

// ==========================================
// FULL-TEXT SEARCH (FTS5) - Ingredients
// ==========================================
expoDb.execSync(`
  CREATE VIRTUAL TABLE IF NOT EXISTS ingredients_fts USING fts5(
    formal_name,
    common_name,
    content='ingredients',
    content_rowid='id'
  );
`);

expoDb.execSync(`
  CREATE TRIGGER IF NOT EXISTS ingredients_ai AFTER INSERT ON ingredients BEGIN
    INSERT INTO ingredients_fts(rowid, formal_name, common_name)
    VALUES (new.id, new.formal_name, new.common_name);
  END;

  CREATE TRIGGER IF NOT EXISTS ingredients_ad AFTER DELETE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, formal_name, common_name)
    VALUES('delete', old.id, old.formal_name, old.common_name);
  END;

  CREATE TRIGGER IF NOT EXISTS ingredients_au AFTER UPDATE ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredients_fts, rowid, formal_name, common_name)
    VALUES('delete', old.id, old.formal_name, old.common_name);
    INSERT INTO ingredients_fts(rowid, formal_name, common_name)
    VALUES (new.id, new.formal_name, new.common_name);
  END;
`);

// ==========================================
// FULL-TEXT SEARCH (FTS5) - Research Summaries
// ==========================================
expoDb.execSync(`
  CREATE VIRTUAL TABLE IF NOT EXISTS research_fts USING fts5(
    summary,
    content='research',
    content_rowid='id'
  );
`);

expoDb.execSync(`
  CREATE TRIGGER IF NOT EXISTS research_ai AFTER INSERT ON research BEGIN
    INSERT INTO research_fts(rowid, summary)
    VALUES (new.id, new.summary);
  END;

  CREATE TRIGGER IF NOT EXISTS research_ad AFTER DELETE ON research BEGIN
    INSERT INTO research_fts(research_fts, rowid, summary)
    VALUES('delete', old.id, old.summary);
  END;

  CREATE TRIGGER IF NOT EXISTS research_au AFTER UPDATE ON research BEGIN
    INSERT INTO research_fts(research_fts, rowid, summary)
    VALUES('delete', old.id, old.summary);
    INSERT INTO research_fts(rowid, summary)
    VALUES (new.id, new.summary);
  END;
`);

expoDb.execSync(`
  CREATE TABLE IF NOT EXISTS userSettings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export const db = drizzle(expoDb, { schema });

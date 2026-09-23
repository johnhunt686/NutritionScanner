import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('nutrition.db', { enableChangeListener: true });

// Enable PRAGMAs
expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = ON;');

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

export const db = drizzle(expoDb, { schema });
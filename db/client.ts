import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('nutrition.db', { enableChangeListener: true });

expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = ON;');

expoDb.execSync(`
  CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
    name,
    long_description,
    content='products',
    content_rowid='id'
  );
`);

expoDb.execSync(`
  CREATE TRIGGER IF NOT EXISTS products_ai AFTER INSERT ON products BEGIN
    INSERT INTO products_fts(rowid, name, long_description)
    VALUES (new.id, new.name, new.long_description);
  END;

  CREATE TRIGGER IF NOT EXISTS products_ad AFTER DELETE ON products BEGIN
    INSERT INTO products_fts(products_fts, rowid, name, long_description)
    VALUES('delete', old.id, old.name, old.long_description);
  END;

  CREATE TRIGGER IF NOT EXISTS products_au AFTER UPDATE ON products BEGIN
    INSERT INTO products_fts(products_fts, rowid, name, long_description)
    VALUES('delete', old.id, old.name, old.long_description);
    INSERT INTO products_fts(rowid, name, long_description)
    VALUES (new.id, new.name, new.long_description);
  END;
`);

export const db = drizzle(expoDb, { schema });
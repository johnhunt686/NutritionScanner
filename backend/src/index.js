import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { startAdminServer } from './admin.js';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

const syncTables = [
  ['ingredients', 'ingredients'],
  ['tags', 'tags'],
  ['ingredientTags', 'ingredient_tags'],
  ['descriptions', 'descriptions'],
  ['research', 'research'],
  ['determinations', 'determinations'],
  ['ingredientResearch', 'ingredient_research'],
];

app.get('/sync', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');

    const snapshot = {};
    for (const [responseKey, tableName] of syncTables) {
      const { rows } = await client.query(`SELECT * FROM ${tableName} ORDER BY id`);
      snapshot[responseKey] = rows;
    }

    await client.query('COMMIT');
    res.json({
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      ...snapshot,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(503).json({ error: 'Unable to read database snapshot' });
  } finally {
    client.release();
  }
});

app.listen(3000, '0.0.0.0', () => console.log('API on :3000'));
startAdminServer(pool);

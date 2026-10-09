import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = process.env.RESEARCH_UPLOAD_DIR ?? '/data/research';
const supportedExtensions = new Set(['.pdf', '.txt', '.md', '.markdown']);

function badRequest(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseIds(value, fieldName) {
  if (!Array.isArray(value)) {
    throw badRequest(`${fieldName} must be an array.`);
  }

  const ids = [...new Set(value.map(Number))];
  if (ids.some((id) => !Number.isSafeInteger(id) || id < 1)) {
    throw badRequest(`${fieldName} contains an invalid ID.`);
  }

  return ids;
}

function parseRecordId(value, recordName) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw badRequest(`Invalid ${recordName} ID.`);
  return id;
}

function parseIngredientIds(value) {
  let ids;
  try {
    ids = JSON.parse(value || '[]');
  } catch {
    throw badRequest('Ingredient links are invalid.');
  }

  return parseIds(ids, 'Ingredient links');
}

function validateHttpUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw badRequest('Enter a valid HTTP or HTTPS research link.');
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadDirectory),
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!supportedExtensions.has(extension)) {
      callback(badRequest('Upload a PDF, TXT, or Markdown file.'));
      return;
    }
    callback(null, true);
  },
});

export async function startAdminServer(pool) {
  await mkdir(uploadDirectory, { recursive: true });

  const admin = express();
  admin.use(express.json({ limit: '1mb' }));
  admin.get('/', (_request, response) => {
    response.sendFile(path.resolve(currentDirectory, '../public/admin.html'));
  });
  admin.use(express.static(path.resolve(currentDirectory, '../public')));

  admin.get('/api/catalog', async (_request, response) => {
    const [ingredients, tags, research] = await Promise.all([
      pool.query(`
        SELECT i.id, i.formal_name, i.common_name,
          COALESCE(array_agg(t.name ORDER BY t.name)
            FILTER (WHERE t.id IS NOT NULL), '{}') AS tag_names
        FROM ingredients i
        LEFT JOIN ingredient_tags it ON it.ingredient_id = i.id
        LEFT JOIN tags t ON t.id = it.tag_id
        GROUP BY i.id
        ORDER BY i.formal_name
      `),
      pool.query(`
        SELECT t.id, t.name, t.color, COUNT(it.ingredient_id)::int AS ingredient_count
        FROM tags t
        LEFT JOIN ingredient_tags it ON it.tag_id = t.id
        GROUP BY t.id
        ORDER BY t.name
      `),
      pool.query(`
        SELECT
          r.id,
          r.summary,
          r.link,
          r.document->>'type' AS document_type,
          r.document->>'name' AS document_name,
          r.document->>'storageKey' AS storage_key,
          COALESCE(array_agg(i.formal_name ORDER BY i.formal_name)
            FILTER (WHERE i.id IS NOT NULL), '{}') AS ingredient_names
        FROM research r
        LEFT JOIN ingredient_research ir ON ir.research_id = r.id
        LEFT JOIN ingredients i ON i.id = ir.ingredient_id
        GROUP BY r.id
        ORDER BY r.id DESC
        LIMIT 30
      `),
    ]);

    response.json({
      ingredients: ingredients.rows,
      tags: tags.rows,
      research: research.rows,
    });
  });

  admin.post('/api/tags', async (request, response) => {
    const name = String(request.body.name ?? '').trim();
    const color = request.body.color || null;
    if (!name || name.length > 80) throw badRequest('Tag name is required (80 characters max).');
    if (color !== null && !/^#[0-9a-f]{6}$/i.test(color)) {
      throw badRequest('Choose a valid tag color.');
    }

    const existing = await pool.query(
      'SELECT id, name, color FROM tags WHERE lower(name) = lower($1) LIMIT 1',
      [name],
    );
    if (existing.rowCount) {
      response.json({ tag: existing.rows[0], created: false });
      return;
    }

    const result = await pool.query(
      'INSERT INTO tags (name, color) VALUES ($1, $2) RETURNING id, name, color',
      [name, color],
    );
    response.status(201).json({ tag: result.rows[0], created: true });
  });

  admin.delete('/api/tags/:id', async (request, response) => {
    const id = parseRecordId(request.params.id, 'tag');
    const result = await pool.query('DELETE FROM tags WHERE id = $1 RETURNING id, name', [id]);
    if (!result.rowCount) throw badRequest('Tag not found.', 404);
    response.json({ deleted: result.rows[0] });
  });

  admin.post('/api/ingredients', async (request, response) => {
    const formalName = String(request.body.formalName ?? '').trim();
    const commonName = String(request.body.commonName ?? '').trim() || null;
    const tagIds = parseIds(request.body.tagIds ?? [], 'Tags');
    if (!formalName || formalName.length > 250) {
      throw badRequest('Formal name is required (250 characters max).');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (tagIds.length) {
        const { rowCount } = await client.query('SELECT id FROM tags WHERE id = ANY($1::int[])', [
          tagIds,
        ]);
        if (rowCount !== tagIds.length)
          throw badRequest('One or more selected tags no longer exist.');
      }

      const inserted = await client.query(
        `INSERT INTO ingredients (formal_name, common_name)
         VALUES ($1, $2)
         RETURNING id, formal_name, common_name`,
        [formalName, commonName],
      );
      const ingredient = inserted.rows[0];

      for (const tagId of tagIds) {
        await client.query('INSERT INTO ingredient_tags (ingredient_id, tag_id) VALUES ($1, $2)', [
          ingredient.id,
          tagId,
        ]);
      }

      await client.query('COMMIT');
      response.status(201).json({ ingredient });
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  });

  admin.delete('/api/ingredients/:id', async (request, response) => {
    const id = parseRecordId(request.params.id, 'ingredient');
    const result = await pool.query(
      'DELETE FROM ingredients WHERE id = $1 RETURNING id, formal_name',
      [id],
    );
    if (!result.rowCount) throw badRequest('Ingredient not found.', 404);
    response.json({ deleted: result.rows[0] });
  });

  admin.post('/api/research', upload.single('document'), async (request, response) => {
    let client;
    let keepUploadedFile = false;

    try {
      const summary = String(request.body.summary ?? '').trim();
      const link = validateHttpUrl(String(request.body.link ?? '').trim());
      const ingredientIds = parseIngredientIds(request.body.ingredientIds);
      if (!summary || summary.length > 5000) {
        throw badRequest('Summary is required (5000 characters max).');
      }
      if (!link && !request.file) throw badRequest('Add a research link or upload a document.');

      let document = null;
      if (request.file) {
        const extension = path.extname(request.file.originalname).toLowerCase();
        if (extension === '.pdf') {
          document = {
            type: 'pdf',
            name: request.file.originalname,
            storageKey: request.file.filename,
            size: request.file.size,
          };
        } else {
          if (request.file.size > 1024 * 1024) {
            throw badRequest('Text and Markdown uploads are limited to 1 MB.', 413);
          }
          const content = await readFile(request.file.path, 'utf8');
          document = {
            type: extension === '.txt' ? 'text' : 'markdown',
            name: request.file.originalname,
            content,
          };
          await unlink(request.file.path);
        }
      }

      client = await pool.connect();
      await client.query('BEGIN');
      if (ingredientIds.length) {
        const { rowCount } = await client.query(
          'SELECT id FROM ingredients WHERE id = ANY($1::int[])',
          [ingredientIds],
        );
        if (rowCount !== ingredientIds.length) {
          throw badRequest('One or more selected ingredients no longer exist.');
        }
      }

      const inserted = await client.query(
        `INSERT INTO research (is_link, last_checked, link, document, summary)
         VALUES ($1, $2, $3, $4::jsonb, $5)
         RETURNING id, summary, link`,
        [Boolean(link), new Date().toISOString(), link, JSON.stringify(document), summary],
      );
      const researchId = inserted.rows[0].id;

      for (const ingredientId of ingredientIds) {
        await client.query(
          'INSERT INTO ingredient_research (ingredient_id, research_id) VALUES ($1, $2)',
          [ingredientId, researchId],
        );
      }

      await client.query('COMMIT');
      keepUploadedFile = Boolean(request.file && document?.type === 'pdf');
      response
        .status(201)
        .json({ research: inserted.rows[0], linkedIngredients: ingredientIds.length });
    } catch (error) {
      if (client) await client.query('ROLLBACK').catch(() => {});
      if (request.file && !keepUploadedFile) await unlink(request.file.path).catch(() => {});
      throw error;
    } finally {
      client?.release();
    }
  });

  admin.get('/api/files/:storageKey', (request, response, next) => {
    const { storageKey } = request.params;
    if (!/^[0-9a-f-]{36}\.pdf$/i.test(storageKey)) {
      response.sendStatus(404);
      return;
    }

    response.download(path.join(uploadDirectory, storageKey), (error) => {
      if (error && !response.headersSent) next(error);
    });
  });

  admin.use((error, _request, response) => {
    const statusCode = error.statusCode ?? (error instanceof multer.MulterError ? 413 : 500);
    if (statusCode >= 500) console.error(error);
    response.status(statusCode).json({ error: error.message || 'Admin request failed.' });
  });

  admin.listen(3001, '0.0.0.0', () => console.log('Local data admin on :3001'));
}

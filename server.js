import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveFile } from './src/utils/file-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const API_KEY = process.env.CATALOG_API_KEY || 'dev-key-123';

app.use(cors());
app.use(express.json());

// Middleware simple de API KEY
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * Actualiza el índice de la categoría de forma incremental y eficiente.
 */
function updateCategoryIndex(subDir, item, slug) {
  const categoryDir = path.join(__dirname, 'data', subDir);
  const indexPath = path.join(categoryDir, 'index.json');

  try {
    let index = [];
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
    }

    const identifier =
      item.isbn || item.upc || item.id || item.imdbID || slug;
    const existingIdx = index.findIndex(
      (entry) => entry.slug === slug || entry.identifier === identifier,
    );

    const entry = {
      title: item.title,
      slug,
      identifier,
    };

    if (existingIdx >= 0) {
      index[existingIdx] = entry;
    } else {
      index.push(entry);
    }

    // Guardar index minificado
    fs.writeFileSync(indexPath, JSON.stringify(index));
    console.log(`Incremental index updated for ${subDir} (${index.length} items)`);
  } catch (err) {
    console.error(`Error updating incremental index for ${subDir}:`, err.message);
  }
}

app.post('/items', authMiddleware, (req, res) => {
  const item = req.body;
  const type = req.query.type; // BOOK, COMIC, MOVIE

  if (!item || !type) {
    return res.status(400).json({ error: 'Missing item or type' });
  }

  let subDir;
  let filename;

  if (type === 'BOOK' || type === 'COMIC') {
    subDir = type === 'BOOK' ? 'books' : 'comics';
    filename =
      item.isbn || item.upc || item.title?.toLowerCase().replace(/ /g, '-');
  } else if (type === 'MOVIE') {
    subDir = 'movies';
    filename = item.title?.toLowerCase().replace(/ /g, '-');
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  // Agregar timestamp de captura si no existe
  if (!item.fetched_at) {
    item.fetched_at = new Date().toISOString();
  }

  try {
    const targetDir = path.join(__dirname, 'data', subDir);
    const savedPath = saveFile(targetDir, `${filename}.json`, item, {
      minify: true,
      stripNA: false,
    });

    // Actualización de índice incremental automática y no bloqueante
    updateCategoryIndex(subDir, item, filename);

    return res.status(201).json({
      message: 'Item saved and index updated',
      path: savedPath,
    });
  } catch (err) {
    console.error('Error saving item:', err);
    return res.status(500).json({ error: 'Failed to save item', detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Open Catalog Receiver running at http://localhost:${port}`);
});


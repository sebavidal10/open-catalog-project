import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

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

app.post('/items', authMiddleware, (req, res) => {
  const item = req.body;
  const type = req.query.type; // BOOK, COMIC, MOVIE

  if (!item || !type) {
    return res.status(400).json({ error: 'Missing item or type' });
  }

  let subDir = '';
  let filename = '';

  if (type === 'BOOK' || type === 'COMIC') {
    subDir = type === 'BOOK' ? 'books' : 'comics';
    filename = item.isbn || item.title.toLowerCase().replace(/ /g, '-');
  } else if (type === 'MOVIE') {
    subDir = 'movies';
    filename = item.title.toLowerCase().replace(/ /g, '-');
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const filePath = path.join(__dirname, 'data', subDir, `${filename}.json`);

  // Agregar timestamp de captura si no existe
  if (!item.fetched_at) {
    item.fetched_at = new Date().toISOString();
  }

  fs.writeFile(filePath, JSON.stringify(item, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).json({ error: 'Failed to save item' });
    }

    console.log(`Item saved: ${filePath}`);

    // Regenerar índices automáticamente
    exec('node scripts/generate-index.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error regenerating index: ${error.message}`);
        return res
          .status(500)
          .json({
            error: 'Item saved but index failed',
            detail: error.message,
          });
      }
      console.log('Index regenerated successfully');
      res
        .status(201)
        .json({ message: 'Item saved and index updated', path: filePath });
    });
  });
});

app.listen(port, () => {
  console.log(`Open Catalog Receiver running at http://localhost:${port}`);
});

import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanComicData } from '../src/models/comic.js';
import fs from 'fs';
import path from 'path';

const input = process.argv.slice(2).join(' ');

if (!input) {
  console.error('Usage: node fetch-comic.js <ISBN or Title-Author>');
  process.exit(1);
}

function isISBN(str) {
  const clean = str.replace(/-/g, '');
  return /^\d{9}[\dX]$|^\d{13}$/.test(clean);
}

// Search ISBN function removed as resolution is now handled by the consumer (Boveda)

async function fetchComic() {
  let isbn = input.replace(/-/g, '');

  if (!isISBN(isbn)) {
    console.error('Error: Se requiere un ISBN válido (10 o 13 dígitos).');
    process.exit(1);
  }

  // Validar si ya existe localmente
  const localPath = path.join(process.cwd(), 'data/comics', `${isbn}.json`);
  if (fs.existsSync(localPath)) {
    console.log(`El comic con ISBN ${isbn} ya existe en el catálogo local:`);
    const existingData = fs.readFileSync(localPath, 'utf8');
    console.log(existingData);
    return;
  }

  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const data = await fetchData(url);
    const cleanedData = cleanComicData(isbn, data);
    saveFile('data/comics', `${isbn}.json`, cleanedData);
    console.log(JSON.stringify(cleanedData, null, 2));
  } catch (error) {
    console.error('Error fetching comic:', error.message);
    process.exit(1);
  }
}

fetchComic();

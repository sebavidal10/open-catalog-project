import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanComicData } from '../src/models/comic.js';
import fs from 'fs';
import path from 'path';

// ESM Check for direct execution
import { fileURLToPath } from 'url';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

function isISBN(str) {
  const clean = str.replace(/-/g, '');
  return /^\d{9}[\dX]$|^\d{13}$/.test(clean);
}

export async function fetchComic(input) {
  if (!input) {
    if (isMainModule) {
      console.error('Usage: node fetch-comic.js <ISBN or Title-Author>');
      process.exit(1);
    }
    throw new Error('Input required');
  }

  let isbn = input.replace(/-/g, '');

  if (!isISBN(isbn)) {
    const errorMsg = 'Error: Se requiere un ISBN válido (10 o 13 dígitos).';
    if (isMainModule) {
      console.error(errorMsg);
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  // Validar si ya existe localmente
  const localPath = path.join(process.cwd(), 'data/comics', `${isbn}.json`);
  if (fs.existsSync(localPath)) {
    console.log(`El comic con ISBN ${isbn} ya existe en el catálogo local:`);
    const existingData = fs.readFileSync(localPath, 'utf8');
    console.log(existingData);
    return JSON.parse(existingData);
  }

  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const data = await fetchData(url);
    const cleanedData = cleanComicData(isbn, data);
    saveFile('data/comics', `${isbn}.json`, cleanedData);
    if (isMainModule) {
      console.log(JSON.stringify(cleanedData, null, 2));
    }
    return cleanedData;
  } catch (error) {
    console.error('Error fetching comic:', error.message);
    if (isMainModule) process.exit(1);
    throw error;
  }
}

if (isMainModule) {
  const input = process.argv.slice(2).join(' ');
  fetchComic(input);
}

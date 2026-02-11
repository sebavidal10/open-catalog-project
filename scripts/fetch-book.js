import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanBookData } from '../src/models/book.js';
import fs from 'fs';
import path from 'path';

const input = process.argv.slice(2).join(' ');

if (!input) {
  console.error('Usage: node fetch-book.js <ISBN or Title-Author>');
  process.exit(1);
}

function isISBN(str) {
  const clean = str.replace(/-/g, '');
  return /^\d{9}[\dX]$|^\d{13}$/.test(clean);
}

// Search ISBN function removed as resolution is now handled by the consumer (Boveda)

async function fetchBook() {
  let isbn = input.replace(/-/g, '');

  if (!isISBN(isbn)) {
    console.error('Error: Se requiere un ISBN válido (10 o 13 dígitos).');
    process.exit(1);
  }

  // Validar si ya existe localmente
  const localPath = path.join(process.cwd(), 'data/books', `${isbn}.json`);
  if (fs.existsSync(localPath)) {
    console.log(`El libro con ISBN ${isbn} ya existe en el catálogo local:`);
    const existingData = fs.readFileSync(localPath, 'utf8');
    console.log(existingData);
    return;
  }

  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const data = await fetchData(url);
    const cleanedData = cleanBookData(isbn, data);
    saveFile('data/books', `${isbn}.json`, cleanedData);
    console.log(JSON.stringify(cleanedData, null, 2));
  } catch (error) {
    console.error('Error fetching book:', error.message);
    process.exit(1);
  }
}

fetchBook();

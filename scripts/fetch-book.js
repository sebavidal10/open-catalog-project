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

async function searchISBN(query) {
  const searchQuery = query.replace(/-/g, ' ');
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=1&fields=isbn`;
  const data = await fetchData(url);
  if (
    data.docs &&
    data.docs.length > 0 &&
    data.docs[0].isbn &&
    data.docs[0].isbn.length > 0
  ) {
    return data.docs[0].isbn[0];
  }
  throw new Error(`No se pudo encontrar un ISBN para: ${query}`);
}

async function fetchBook() {
  let isbn = input;

  if (!isISBN(input)) {
    try {
      console.log(`Buscando libro: "${input}"...`);
      isbn = await searchISBN(input);
      console.log(`ISBN encontrado: ${isbn}`);
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  } else {
    // Normalizar ISBN (quitar guiones) para la validación de archivo
    isbn = isbn.replace(/-/g, '');
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

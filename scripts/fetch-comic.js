import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanComicData } from '../src/models/comic.js';

const isbn = process.argv[2];

if (!isbn) {
  console.error('Usage: node fetch-comic.js <ISBN>');
  process.exit(1);
}

async function fetchComic(isbn) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const data = await fetchData(url);
    const cleanedData = cleanComicData(isbn, data);
    saveFile('data/comics', `${isbn}.json`, cleanedData);
  } catch (error) {
    console.error('Error fetching comic:', error.message);
    process.exit(1);
  }
}

fetchComic(isbn);

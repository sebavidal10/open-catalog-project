import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanBookData } from '../src/models/book.js';

const isbn = process.argv[2];

if (!isbn) {
  console.error('Usage: node fetch-book.js <ISBN>');
  process.exit(1);
}

async function fetchBook(isbn) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  try {
    const data = await fetchData(url);
    const cleanedData = cleanBookData(isbn, data);
    saveFile('data/books', `${isbn}.json`, cleanedData);
  } catch (error) {
    console.error('Error fetching book:', error.message);
    process.exit(1);
  }
}

fetchBook(isbn);

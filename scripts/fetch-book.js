import fs from 'fs';
import path from 'path';

const isbn = process.argv[2];

if (!isbn) {
  console.error('Usage: node fetch-book.js <ISBN>');
  process.exit(1);
}

async function fetchBook(isbn) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  console.log(`Fetching book from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const bookKey = `ISBN:${isbn}`;

    if (!data[bookKey]) {
      console.error(`Book with ISBN ${isbn} not found on Open Library.`);
      process.exit(1);
    }

    const bookData = data[bookKey];

    // Clean data
    const cleanedData = {
      isbn,
      title: bookData.title,
      authors: bookData.authors?.map((a) => a.name) || [],
      publish_date: bookData.publish_date,
      publisher: bookData.publishers?.map((p) => p.name) || [],
      pages: bookData.number_of_pages,
      cover:
        bookData.cover?.large ||
        bookData.cover?.medium ||
        bookData.cover?.small,
      subjects: bookData.subjects?.map((s) => s.name) || [],
      url: bookData.url,
      fetched_at: new Date().toISOString(),
    };

    const dirPath = path.join(process.cwd(), 'data', 'books');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, `${isbn}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log(`Successfully saved book: ${cleanedData.title}`);
  } catch (error) {
    console.error('Error fetching book:', error.message);
    process.exit(1);
  }
}

fetchBook(isbn);

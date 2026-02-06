import fs from 'fs';
import path from 'path';

const isbn = process.argv[2];

if (!isbn) {
  console.error('Usage: node fetch-comic.js <ISBN>');
  process.exit(1);
}

async function fetchComic(isbn) {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  console.log(`Fetching comic from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const bookKey = `ISBN:${isbn}`;

    if (!data[bookKey]) {
      console.error(`Comic with ISBN ${isbn} not found on Open Library.`);
      process.exit(1);
    }

    const comicData = data[bookKey];

    // Clean data
    const cleanedData = {
      isbn,
      title: comicData.title,
      authors: comicData.authors?.map((a) => a.name) || [],
      publish_date: comicData.publish_date,
      publisher: comicData.publishers?.map((p) => p.name) || [],
      pages: comicData.number_of_pages,
      cover:
        comicData.cover?.large ||
        comicData.cover?.medium ||
        comicData.cover?.small,
      subjects: comicData.subjects?.map((s) => s.name) || [],
      url: comicData.url,
      fetched_at: new Date().toISOString(),
    };

    const dirPath = path.join(process.cwd(), 'data', 'comics');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, `${isbn}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log(`Successfully saved comic: ${cleanedData.title}`);
  } catch (error) {
    console.error('Error fetching comic:', error.message);
    process.exit(1);
  }
}

fetchComic(isbn);

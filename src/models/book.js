export function cleanBookData(isbn, data) {
  const bookKey = `ISBN:${isbn}`;
  const bookData = data[bookKey];

  if (!bookData) {
    throw new Error(`Book with ISBN ${isbn} not found.`);
  }

  return {
    isbn,
    title: bookData.title,
    authors: bookData.authors?.map((a) => a.name) || [],
    publish_date: bookData.publish_date,
    publisher: bookData.publishers?.map((p) => p.name) || [],
    pages: bookData.number_of_pages,
    cover:
      bookData.cover?.large || bookData.cover?.medium || bookData.cover?.small,
    subjects: bookData.subjects?.map((s) => s.name) || [],
    url: bookData.url,
    fetched_at: new Date().toISOString(),
  };
}

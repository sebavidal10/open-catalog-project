export function cleanComicData(isbn, data) {
  const bookKey = `ISBN:${isbn}`;
  const comicData = data[bookKey];

  if (!comicData) {
    throw new Error(`Comic with ISBN ${isbn} not found.`);
  }

  return {
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
}

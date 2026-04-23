export function cleanComicData(data) {
  const issue = data;

  if (!issue || !issue.id) {
    throw new Error('Invalid comic data received from Metron');
  }

  if (!issue.isbn && !issue.upc) {
    return null;
  }

  // Legacy structure requirements:
  // title, authors (array), publish_date, publisher (array), pages (number),
  // cover (string), subjects (array), url (string), fetched_at (ISO string)
  // Optional but preferred: isbn, upc

  return {
    isbn: issue.isbn || null,
    upc: issue.upc || null,
    title: `${issue.series.name} #${issue.number}`,
    authors: issue.credits?.map((c) => c.creator) || [],
    publish_date: issue.store_date || issue.cover_date || 'Unknown',
    publisher: issue.publisher?.name ? [issue.publisher.name] : [],
    pages: issue.page_count || 0,
    cover: issue.image || '',
    subjects: issue.genres?.map((g) => g.name) || [],
    url: `https://metron.cloud/issue/${issue.id}/`,
    fetched_at: new Date().toISOString(),
    reviewed_at: null,
  };
}

import { describe, it, expect } from 'vitest';
import { cleanBookData } from '../src/models/book.js';
import { cleanComicData } from '../src/models/comic.js';
import { cleanMovieData } from '../src/models/movie.js';

describe('Catalog Models', () => {
  it('should format a movie correctly', () => {
    const rawData = {
      Title: 'Inception',
      Year: '2010',
      Director: 'Christopher Nolan',
      Poster: 'http://example.com/poster.jpg',
      Response: 'True',
    };

    const { slug, cleanedData } = cleanMovieData(rawData);

    expect(slug).toBe('inception');
    expect(cleanedData.title).toBe('Inception');
    expect(cleanedData.year).toBe('2010');
    expect(cleanedData.fetched_at).toBeDefined();
  });

  it('should format a book correctly', () => {
    const isbn = '9780141187761';
    const rawData = {
      [`ISBN:${isbn}`]: {
        title: 'Nineteen Eighty-Four',
        authors: [{ name: 'George Orwell' }],
        publish_date: '2004',
        cover: { large: 'http://example.com/cover.jpg' },
      },
    };

    const cleaned = cleanBookData(isbn, rawData);

    expect(cleaned.isbn).toBe(isbn);
    expect(cleaned.title).toBe('Nineteen Eighty-Four');
    expect(cleaned.authors).toContain('George Orwell');
  });

  it('should format a comic correctly', () => {
    const rawData = {
      id: 12345,
      series: { name: 'Spider-Man' },
      number: 1,
      isbn: '9781302915544',
      upc: '759606091554',
      credits: [{ creator: 'Stan Lee' }],
      store_date: '2019-01-01',
      publisher: { name: 'Marvel' },
      page_count: 32,
      image: 'http://example.com/cover.jpg',
      genres: [{ name: 'Superhero' }],
    };

    const cleaned = cleanComicData(rawData);

    expect(cleaned.isbn).toBe('9781302915544');
    expect(cleaned.title).toBe('Spider-Man #1');
    expect(cleaned.authors).toContain('Stan Lee');
    expect(cleaned.url).toBe('https://metron.cloud/issue/12345/');
  });
});


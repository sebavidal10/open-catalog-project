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
    const isbn = '9781302915544';
    const rawData = {
      [`ISBN:${isbn}`]: {
        title: 'Spider-Man',
        authors: [{ name: 'Stan Lee' }],
        publish_date: '2019',
      },
    };

    const cleaned = cleanComicData(isbn, rawData);

    expect(cleaned.isbn).toBe(isbn);
    expect(cleaned.title).toBe('Spider-Man');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBook } from './fetch-book.js';
import * as api from '../src/utils/api.js';
import * as fileSystem from '../src/utils/file-system.js';
import * as bookModel from '../src/models/book.js';
import fs from 'fs';
import path from 'path';

vi.mock('../src/utils/api.js', () => ({
  fetchData: vi.fn(),
}));

vi.mock('../src/utils/file-system.js', () => ({
  saveFile: vi.fn(),
}));

vi.mock('../src/models/book.js', () => ({
  cleanBookData: vi.fn(),
}));

vi.mock('fs');
vi.mock('path');

describe('fetchBook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    process.cwd = vi.fn().mockReturnValue('/mock/cwd');
  });

  it('should throw error if input is missing', async () => {
    await expect(fetchBook(undefined)).rejects.toThrow('Input required');
  });

  it('should throw error if ISBN is invalid', async () => {
    await expect(fetchBook('invalid-isbn')).rejects.toThrow(/ISBN válido/);
  });

  it('should return existing data if file exists locally', async () => {
    const isbn = '9780141439846';
    const mockData = { title: 'Dracula', isbn };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = await fetchBook(isbn);

    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(isbn));
    expect(result).toEqual(mockData);
    expect(api.fetchData).not.toHaveBeenCalled();
  });

  it('should fetch and save data if file does not exist', async () => {
    const isbn = '9780141439846';
    const mockApiData = { 'ISBN:9780141439846': { title: 'Dracula' } };
    const mockCleanedData = {
      title: 'Dracula',
      isbn,
      authors: ['Bram Stoker'],
    };

    fs.existsSync.mockReturnValue(false);
    api.fetchData.mockResolvedValue(mockApiData);
    bookModel.cleanBookData.mockReturnValue(mockCleanedData);

    const result = await fetchBook(isbn);

    expect(api.fetchData).toHaveBeenCalledWith(expect.stringContaining(isbn));
    expect(bookModel.cleanBookData).toHaveBeenCalledWith(isbn, mockApiData);
    expect(fileSystem.saveFile).toHaveBeenCalledWith(
      'data/books',
      `${isbn}.json`,
      mockCleanedData,
    );
    expect(result).toEqual(mockCleanedData);
  });
});

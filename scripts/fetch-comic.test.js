import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchComic } from './fetch-comic.js';
import * as api from '../src/utils/api.js';
import * as fileSystem from '../src/utils/file-system.js';
import * as comicModel from '../src/models/comic.js';
import fs from 'fs';
import path from 'path';

vi.mock('../src/utils/api.js', () => ({
  fetchData: vi.fn(),
}));

vi.mock('../src/utils/file-system.js', () => ({
  saveFile: vi.fn(),
}));

vi.mock('../src/models/comic.js', () => ({
  cleanComicData: vi.fn(),
}));

vi.mock('fs');
vi.mock('path');

describe('fetchComic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    process.cwd = vi.fn().mockReturnValue('/mock/cwd');
  });

  it('should throw error if input is missing', async () => {
    await expect(fetchComic(undefined)).rejects.toThrow('Input required');
  });

  it('should throw error if ISBN is invalid', async () => {
    await expect(fetchComic('invalid-isbn')).rejects.toThrow(/ISBN válido/);
  });

  it('should return existing data if file exists locally', async () => {
    const isbn = '9781401216672';
    const mockData = { title: 'Batman: The Killing Joke', isbn };

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = await fetchComic(isbn);

    expect(fs.existsSync).toHaveBeenCalledWith(expect.stringContaining(isbn));
    expect(result).toEqual(mockData);
    expect(api.fetchData).not.toHaveBeenCalled();
  });

  it('should fetch and save data if file does not exist', async () => {
    const isbn = '9781401216672';
    const mockApiData = {
      'ISBN:9781401216672': { title: 'Batman: The Killing Joke' },
    };
    const mockCleanedData = {
      title: 'Batman: The Killing Joke',
      isbn,
      authors: ['Alan Moore'],
    };

    fs.existsSync.mockReturnValue(false);
    api.fetchData.mockResolvedValue(mockApiData);
    comicModel.cleanComicData.mockReturnValue(mockCleanedData);

    const result = await fetchComic(isbn);

    expect(api.fetchData).toHaveBeenCalledWith(expect.stringContaining(isbn));
    expect(comicModel.cleanComicData).toHaveBeenCalledWith(isbn, mockApiData);
    expect(fileSystem.saveFile).toHaveBeenCalledWith(
      'data/comics',
      `${isbn}.json`,
      mockCleanedData,
    );
    expect(result).toEqual(mockCleanedData);
  });
});

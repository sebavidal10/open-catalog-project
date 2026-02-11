import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchMovie } from './fetch-movie.js';
import * as api from '../src/utils/api.js';
import * as fileSystem from '../src/utils/file-system.js';
import * as movieModel from '../src/models/movie.js';
import fs from 'fs';
import path from 'path';

vi.mock('../src/utils/api.js', () => ({
  fetchData: vi.fn(),
}));

vi.mock('../src/utils/file-system.js', () => ({
  saveFile: vi.fn(),
}));

vi.mock('../src/models/movie.js', () => ({
  cleanMovieData: vi.fn(),
}));

vi.mock('fs');
vi.mock('path');

describe('fetchMovie', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    path.join.mockImplementation((...args) => args.join('/'));
    process.cwd = vi.fn().mockReturnValue('/mock/cwd');
    process.env = { ...originalEnv, OMDB_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should throw error if input is missing', async () => {
    await expect(fetchMovie(undefined)).rejects.toThrow('Input required');
  });

  it('should throw error if API key is missing', async () => {
    delete process.env.OMDB_API_KEY;
    await expect(fetchMovie('Inception')).rejects.toThrow(
      'OMDB_API_KEY environment variable is missing',
    );
  });

  it('should return existing data if file exists locally', async () => {
    const title = 'Inception';
    const mockData = {
      title: 'Inception',
      year: '2010',
      slug: 'inception-2010',
    };

    movieModel.cleanMovieData.mockReturnValue({
      slug: 'inception-2010',
      cleanedData: mockData,
    });
    // Need to simulate fetching first part to get cleaned data to check existing
    // Wait, fetchMovie logic fetches first, cleans, THEN checks existence.
    // This is slightly inefficient in the script (fetches before check), but that's how it is.
    // So we must mock fetchData even for "existing" case check.

    const mockApiData = { Title: 'Inception', Year: '2010' };
    api.fetchData.mockResolvedValue(mockApiData);

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

    const result = await fetchMovie(title);

    expect(api.fetchData).toHaveBeenCalled();
    expect(fs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining('inception-2010'),
    );
    expect(result).toEqual(mockData);
  });

  it('should fetch and save data if file does not exist', async () => {
    const title = 'Inception';
    const mockApiData = { Title: 'Inception', Year: '2010' };
    const mockCleanedData = {
      title: 'Inception',
      year: '2010',
      slug: 'inception-2010',
    };

    api.fetchData.mockResolvedValue(mockApiData);
    movieModel.cleanMovieData.mockReturnValue({
      slug: 'inception-2010',
      cleanedData: mockCleanedData,
    });
    fs.existsSync.mockReturnValue(false);

    const result = await fetchMovie(title);

    expect(api.fetchData).toHaveBeenCalled();
    expect(fileSystem.saveFile).toHaveBeenCalledWith(
      'data/movies',
      'inception-2010.json',
      mockCleanedData,
    );
    expect(result).toEqual(mockCleanedData);
  });

  it('should handle year in input', async () => {
    const input = 'Inception 2010';
    api.fetchData.mockResolvedValue({});
    movieModel.cleanMovieData.mockReturnValue({
      slug: 'inception-2010',
      cleanedData: {},
    });

    await fetchMovie(input);

    expect(api.fetchData).toHaveBeenCalledWith(
      expect.stringContaining('&y=2010'),
    );
  });
});

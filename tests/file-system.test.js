import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { saveFile, sanitizeData } from '../src/utils/file-system.js';

describe('File System Utils', () => {
  const testDir = path.join(process.cwd(), 'tests/tmp');

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should automatically minify JSON when saving', () => {
    const data = {
      title: 'The Matrix',
      year: '1999',
      director: 'Wachowskis',
    };

    const filePath = saveFile(testDir, 'matrix.json', data, { minify: true });
    const rawContent = fs.readFileSync(filePath, 'utf-8');

    expect(rawContent).toBe(JSON.stringify(data));
    expect(rawContent).not.toContain('\n');
    expect(JSON.parse(rawContent)).toEqual(data);
  });

  it('should sanitize N/A and null values when requested', () => {
    const raw = {
      title: 'Avatar',
      rated: 'N/A',
      metascore: null,
      director: 'James Cameron',
      details: {
        award: 'N/A',
        boxOffice: '$2B',
      },
    };

    const sanitized = sanitizeData(raw);

    expect(sanitized).toEqual({
      title: 'Avatar',
      director: 'James Cameron',
      details: {
        boxOffice: '$2B',
      },
    });
  });
});

import fs from 'fs';
import path from 'path';

/**
 * Recursively strips 'N/A', null, and undefined values from objects if desired.
 */
export function sanitizeData(data) {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data !== null && typeof data === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(data)) {
      if (val === 'N/A' || val === null || val === undefined) {
        continue;
      }
      cleaned[key] = sanitizeData(val);
    }
    return cleaned;
  }
  return data;
}

/**
 * Saves a JSON file with automatic minification.
 * @param {string} directory Target directory relative to cwd or absolute
 * @param {string} filename Output file name
 * @param {any} data Object to serialize
 * @param {object} options Optional settings { minify: true, stripNA: false }
 */
export function saveFile(directory, filename, data, options = {}) {
  const { minify = true, stripNA = false } = options;
  const dirPath = path.isAbsolute(directory)
    ? directory
    : path.join(process.cwd(), directory);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, filename);
  const payload = stripNA ? sanitizeData(data) : data;
  const jsonContent = minify
    ? JSON.stringify(payload)
    : JSON.stringify(payload, null, 2);

  fs.writeFileSync(filePath, jsonContent);
  console.log(`Successfully saved file: ${filePath}`);
  return filePath;
}

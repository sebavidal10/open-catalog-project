import fs from 'fs';
import path from 'path';
import { fetchMovie } from './fetch-movie.js';
import { fileURLToPath } from 'url';

// ESM Check for direct execution
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

// Load .env manually if it exists (avoids dependencies)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

async function bulkFetchMovies(filePath) {
  if (!filePath) {
    console.error('Usage: node scripts/bulk-fetch-movies.js <path-to-file>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  console.log(`Found ${lines.length} movies to process from ${filePath}`);

  for (const line of lines) {
    try {
      console.log(`Processing: "${line}"`);
      await fetchMovie(line);
      // Add a small delay to be polite to the API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to process "${line}":`, error.message);
      // Continue with the next movie even if one fails
    }
    console.log('---');
  }

  console.log('Bulk import completed.');
}

if (isMainModule) {
  const filePath =
    process.argv[2] || path.join(process.cwd(), 'scripts/movies.txt');
  bulkFetchMovies(filePath);
}

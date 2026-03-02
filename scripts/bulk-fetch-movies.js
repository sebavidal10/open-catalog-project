import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanMovieData } from '../src/models/movie.js';

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

function parseInput(input) {
  // 1. Remove everything after a slash to get the primary title
  let primary = input.split('/')[0].trim();

  // 2. Extract year and clean title. Allow formats: "Title (2010)", "Title 2010", "Title - 2010"
  const match = primary.match(/^(.*?)(?:[- ]*(?:\()?(\d{4})(?:\))?)?$/);
  if (match) {
    const parsedTitle = match[1].trim();
    const parsedYear = match[2] || null;
    return { title: parsedTitle, year: parsedYear };
  }
  return { title: primary, year: null };
}

async function fetchMovie(input) {
  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  if (!OMDB_API_KEY) {
    throw new Error('Error: OMDB_API_KEY environment variable is missing.');
  }

  const { title, year } = parseInput(input);
  let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;

  if (year) {
    console.log(`Buscando película: "${title}" del año ${year}...`);
    url += `&y=${year}`;
  } else {
    console.log(`Buscando película: "${title}"...`);
  }

  const data = await fetchData(url);
  const { slug, cleanedData } = cleanMovieData(data);

  // Validar si ya existe localmente por el slug generado
  const localPath = path.join(process.cwd(), 'data/movies', `${slug}.json`);
  if (fs.existsSync(localPath)) {
    console.log(
      `La película "${cleanedData.title}" (${cleanedData.year}) ya existe en el catálogo local:`,
    );
    return; // Return empty to not overwrite/console spam valid existing ones when bulking
  }

  saveFile('data/movies', `${slug}.json`, cleanedData);
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

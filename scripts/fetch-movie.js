import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanMovieData } from '../src/models/movie.js';
import fs from 'fs';
import path from 'path';

// ESM Check for direct execution
import { fileURLToPath } from 'url';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

export async function fetchMovie(input) {
  if (!input) {
    if (isMainModule) {
      console.error('Usage: node fetch-movie.js <Movie Title> [Year]');
      process.exit(1);
    }
    throw new Error('Input required');
  }

  const OMDB_API_KEY = process.env.OMDB_API_KEY;

  if (!OMDB_API_KEY) {
    const errorMsg = 'Error: OMDB_API_KEY environment variable is missing.';
    if (isMainModule) {
      console.error(errorMsg);
      process.exit(1);
    }
    throw new Error(errorMsg);
  }

  function parseInput(input) {
    // Intenta encontrar un año de 4 dígitos al final (separado por espacio o guion)
    const match = input.match(/^(.*?)[- ](\d{4})$/);
    if (match) {
      return { title: match[1], year: match[2] };
    }
    return { title: input, year: null };
  }

  const { title, year } = parseInput(input);
  let url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;

  if (year) {
    console.log(`Buscando película: "${title}" del año ${year}...`);
    url += `&y=${year}`;
  } else {
    console.log(`Buscando película: "${title}"...`);
  }

  try {
    const data = await fetchData(url);
    const { slug, cleanedData } = cleanMovieData(data);

    // Validar si ya existe localmente por el slug generado
    const localPath = path.join(process.cwd(), 'data/movies', `${slug}.json`);
    if (fs.existsSync(localPath)) {
      console.log(
        `La película "${cleanedData.title}" (${cleanedData.year}) ya existe en el catálogo local:`,
      );
      const existingData = fs.readFileSync(localPath, 'utf8');
      console.log(existingData);
      return JSON.parse(existingData);
    }

    saveFile('data/movies', `${slug}.json`, cleanedData);
    if (isMainModule) {
      console.log(JSON.stringify(cleanedData, null, 2));
    }
    return cleanedData;
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    if (isMainModule) process.exit(1);
    throw error;
  }
}

if (isMainModule) {
  const input = process.argv.slice(2).join(' ');
  fetchMovie(input);
}

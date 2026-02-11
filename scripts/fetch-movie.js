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
    // Soporta: "Title YYYY", "Title-YYYY", "Title (YYYY)"
    const match = input.match(/^(.*?)(?:[- ]|\s*[()])(\d{4})[)]?$/);
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

    // 3. Collision Handling
    let finalSlug = slug;
    let localPath = path.join(
      process.cwd(),
      'data/movies',
      `${finalSlug}.json`,
    );

    if (fs.existsSync(localPath)) {
      const existingData = JSON.parse(fs.readFileSync(localPath, 'utf8'));

      // Case A: Identical movie (same IMDB ID or Title+Year) -> Return existing
      if (
        (existingData.imdbID && existingData.imdbID === cleanedData.imdbID) ||
        (existingData.title === cleanedData.title &&
          existingData.year === cleanedData.year)
      ) {
        console.log(
          `Movie "${cleanedData.title}" (${cleanedData.year}) already exists in catalog.`,
        );
        return existingData;
      }

      // Case B: Collision (Different movie, same slug) -> Append Year
      console.log(
        `Filename collision for "${slug}". Creating year-suffixed version...`,
      );
      finalSlug = `${slug}-${cleanedData.year}`;
      localPath = path.join(process.cwd(), 'data/movies', `${finalSlug}.json`);
    }

    saveFile('data/movies', `${finalSlug}.json`, cleanedData);
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

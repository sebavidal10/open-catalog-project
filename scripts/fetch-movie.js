import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanMovieData } from '../src/models/movie.js';

const input = process.argv.slice(2).join(' ');

if (!input) {
  console.error('Usage: node fetch-movie.js <Movie Title> [Year]');
  process.exit(1);
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

if (!OMDB_API_KEY) {
  console.error('Error: OMDB_API_KEY environment variable is missing.');
  process.exit(1);
}

function parseInput(input) {
  // Intenta encontrar un año de 4 dígitos al final (separado por espacio o guion)
  const match = input.match(/^(.*?)[- ](\d{4})$/);
  if (match) {
    return { title: match[1], year: match[2] };
  }
  return { title: input, year: null };
}

async function fetchMovie() {
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
    saveFile('data/movies', `${slug}.json`, cleanedData);
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    process.exit(1);
  }
}

fetchMovie();

import { fetchData } from '../src/utils/api.js';
import { saveFile } from '../src/utils/file-system.js';
import { cleanMovieData } from '../src/models/movie.js';

const movieTitle = process.argv.slice(2).join(' ');

if (!movieTitle) {
  console.error('Usage: node fetch-movie.js <Movie Title>');
  process.exit(1);
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

if (!OMDB_API_KEY) {
  console.error('Error: OMDB_API_KEY environment variable is missing.');
  process.exit(1);
}

async function fetchMovie(title) {
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;

  try {
    const data = await fetchData(url);
    const { slug, cleanedData } = cleanMovieData(data);
    saveFile('data/movies', `${slug}.json`, cleanedData);
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    process.exit(1);
  }
}

fetchMovie(movieTitle);

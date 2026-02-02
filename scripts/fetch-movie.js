import fs from 'fs';
import path from 'path';

const movieTitle = process.argv.slice(2).join(' ');

if (!movieTitle) {
  console.error('Usage: node fetch-movie.js <Movie Title>');
  process.exit(1);
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

if (!OMDB_API_KEY) {
  console.warn('OMDB_API_KEY environment variable is missing.');
  console.log('Using dummy response for testing or please set OMDB_API_KEY.');
  // In a real scenario, this would exit(1). For this setup, I'll keep the structure.
}

async function fetchMovie(title) {
  if (!OMDB_API_KEY) {
    process.exit(1);
  }

  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'False') {
      console.error(`Movie not found: ${data.Error}`);
      process.exit(1);
    }

    // Slugify title for filename
    const slug = data.Title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const cleanedData = {
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre,
      director: data.Director,
      writer: data.Writer,
      actors: data.Actors,
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster,
      ratings: data.Ratings,
      metascore: data.Metascore,
      imdbRating: data.imdbRating,
      imdbID: data.imdbID,
      type: data.Type,
      fetched_at: new Date().toISOString(),
    };

    const filePath = path.join(process.cwd(), 'data', 'movies', `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
    console.log(
      `Successfully saved movie: ${cleanedData.title} to ${slug}.json`,
    );
  } catch (error) {
    console.error('Error fetching movie:', error.message);
    process.exit(1);
  }
}

fetchMovie(movieTitle);

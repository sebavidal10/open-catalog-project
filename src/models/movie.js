export function cleanMovieData(data) {
  if (data.Response === 'False') {
    throw new Error(`Movie not found: ${data.Error}`);
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

  return { slug, cleanedData };
}

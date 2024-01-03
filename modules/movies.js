const axios = require('axios');
const cache = require('./cache');

class Movie {
  constructor(id, title, overview, avg_votes, ttl_votes, img_url, pop, release) {
    this.id = id;
    this.title = title;
    this.overview = overview;
    this.avg_votes = avg_votes;
    this.ttl_votes = ttl_votes;
    this.img_url = 'https://image.tmdb.org/t/p/w500' + img_url;
    this.pop = pop;
    this.release = release;
  }
}

async function getMovies() {
  // Check if data is in the cache
  if (cache.get('movies')) {
    return cache.get('movies');
  }

  const movieApiKey = 'b1a8686216706ad6eb219e88773fe0a0'; 

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${movieApiKey}&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_release_type=2`;

  try {
    const movieResponse = await axios.get(url);
    const movies = movieResponse.data.results.map(m => new Movie(m.id, m.title, m.overview, m.vote_average, m.vote_count, m.poster_path, m.popularity, m.release_date));

    // Store data in the cache for a day.
    cache.setWithExpiration('movies', movies, 86400);

    return movies;
  } catch (error) {
    console.log('Error fetching movies', error);
    throw error;
  }
}

module.exports = { getMovies };

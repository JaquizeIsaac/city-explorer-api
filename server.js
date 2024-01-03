require('dotenv').config();

const PORT = process.env.PORT || 3000;

const weatherModule = require('./modules/weather');
const movieModule = require('./modules/movies');
const yelpModule = require('./modules/yelp');

const cors = require('cors');
const express = require('express');

const app = express();

// Middleware

app.use(cors());

app.get('/', (request, response) => {
  response.send('Backend represent');
});

app.get('/weather', weatherHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);

app.use('*', errorHandler);

app.get('/error', (req, res) => {
  res.status(600).json({message: 'test Error message'});
});

// Functions

async function weatherHandler(request, response, next) {
  const { lat, lon } = request.query;

  try {
    const forecasts = await weatherModule.getWeather(lat, lon);
    response.json(forecasts);
  } catch (error) {
    next(error);
  }
}

async function moviesHandler(request, response, next) {
  try {
    const movies = await movieModule.getMovies();
    response.send(movies);
  } catch (error) {
    next(error);
  }
}

async function yelpHandler(request, response, next) {
  const { lat, lon } = request.query;
  try {
    const restaurants = await yelpModule.getRestaurants(lat, lon);
    response.json(restaurants);
  } catch (error) {
    next(error);
  }
}

// Errors

function errorHandler(error, request, response, next) {

  const statusCode = error.response.data.status_code || 500;
  const errorMessage = error.response.data.status_message || 'Internal Server Error';

  response.status(statusCode).json({message: errorMessage});
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
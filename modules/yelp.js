const axios = require('axios');
const cache = require('./cache');

class Restaurant {
  constructor(id, name, image, price, rating, url) {
    this.id = id;
    this.name = name;
    this.img_url = image;
    this.price = price;
    this.rating = rating;
    this.url = url;
  }
}

async function getRestaurants(lat, lon) {
  const cacheKey = `yelp${lat},${lon}`;

  // Check if data is in the cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&sort_by=best_match&limit=20`;

  try {
    const options = {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.YELP_API_KEY}`
      }
    };
    const yelpResponse = await axios.get(url, options);
    const restaurants = yelpResponse.data.businesses.map((data) => new Restaurant(
      data.id,
      data.name,
      data.image_url,
      data.price,
      data.rating,
      data.url
    ));

    // Store data in the cache for about a day
    cache.setWithExpiration(cacheKey, restaurants, 86000);

    return restaurants;
  } catch (error) {
    console.log('Error fetching yelp data', error);
    throw error;
  }
}

module.exports = { getRestaurants };
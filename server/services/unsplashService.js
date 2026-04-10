const axios = require('axios');

const UNSPLASH_BASE = 'https://api.unsplash.com';

const fetchImages = async (query, count = 5) => {
  try {
    const response = await axios.get(`${UNSPLASH_BASE}/search/photos`, {
      params: {
        query,
        per_page: count,
        orientation: 'landscape',
        client_id: process.env.UNSPLASH_ACCESS_KEY,
      },
    });

    return response.data.results.map((photo) => photo.urls.regular);
  } catch (error) {
    console.error(`Unsplash API error for query "${query}":`, error.message);
    return [];
  }
};

const getDestinationImages = async (destination) => {
  // Try in order: exact city query → city landmark → city place → generic fallback
  const queries = [
    `${destination} city landmark`,
    `${destination} travel scenery`,
    `${destination} tourist attraction`,
  ];

  for (const query of queries) {
    const images = await fetchImages(query, 6);
    if (images.length > 0) return images;
  }

  // Final generic fallback (rarely hit)
  return await fetchImages('beautiful travel destination', 3);
};

const getAttractionImages = async (attraction, destination) => {
  const images = await fetchImages(`${attraction} ${destination}`, 3);
  if (images.length === 0) {
    return await fetchImages(`${destination} landmark tourist`, 2);
  }
  return images;
};

const getHotelImages = async (hotelName, destination) => {
  let images = await fetchImages(`${hotelName} hotel`, 2);
  if (images.length === 0) {
    images = await fetchImages(`${destination} hotel luxury`, 2);
  }
  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'];
  }
  return images;
};

module.exports = { getDestinationImages, getAttractionImages, getHotelImages };

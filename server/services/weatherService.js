const axios = require('axios');

const getWeather = async (city) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
        },
      }
    );

    const data = response.data;
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      windSpeed: data.wind.speed,
      visibility: data.visibility,
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    throw new Error('Unable to fetch weather data for this city');
  }
};

const getForecast = async (city) => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric',
          cnt: 5,
        },
      }
    );

    return response.data.list.map((item) => ({
      date: item.dt_txt,
      temperature: Math.round(item.main.temp),
      description: item.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
    }));
  } catch (error) {
    console.error('Forecast API error:', error.message);
    return [];
  }
};

module.exports = { getWeather, getForecast };

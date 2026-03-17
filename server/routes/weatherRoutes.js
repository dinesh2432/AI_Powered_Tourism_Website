const express = require('express');
const router = express.Router();
const { getWeather, getForecast } = require('../services/weatherService');

router.get('/:city', async (req, res) => {
  try {
    const weather = await getWeather(req.params.city);
    res.status(200).json({ success: true, weather });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:city/forecast', async (req, res) => {
  try {
    const forecast = await getForecast(req.params.city);
    res.status(200).json({ success: true, forecast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const app = express();

const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Endpoint pour récupérer l'endroit avec la température la plus élevée
app.get('/highest-temperature', async (req, res) => {
  try {
    const locations = [
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'New York', lat: 40.7128, lon: -74.006 },
      { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
    ];

    const temperatureData = await Promise.all(
      locations.map(async (location) => {
        const response = await axios.get(API_URL, {
          params: {
            latitude: location.lat,
            longitude: location.lon,
            hourly: 'temperature_2m',
            timezone: 'auto',
          },
        });

        const temperatures = response.data.hourly.temperature_2m;
        const maxTemp = Math.max(...temperatures);
        return { location: location.name, maxTemp };
      })
    );

    const hottest = temperatureData.reduce((prev, current) =>
      prev.maxTemp > current.maxTemp ? prev : current
    );

    res.json(hottest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching data.' });
  }
});

// Démarrer le serveur
app.listen(5000, () => {
  console.log('Backend running on port 5000');
});

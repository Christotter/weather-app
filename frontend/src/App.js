import React, { useState, useEffect } from 'react';

const App = () => {
  const [hottestLocation, setHottestLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTemperatures, setAllTemperatures] = useState([]);

  const locations = [
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "New York", lat: 40.7128, lon: -74.0060 },
    { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "Székesfehérvár", lat: 47.1910, lon: 18.4131 },
    { name: "Gland", lat: 46.4167, lon: 6.2667 },
    { name: "Lausanne", lat: 46.5197, lon: 6.6333 },
    { name: "Abidjan", lat: 5.3453, lon: -4.0244 }
  ];

  const fetchTemperature = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await response.json();
      return data.current_weather.temperature;
    } catch (error) {
      console.error("Error fetching temperature:", error);
      return null;
    }
  };

  const getHottestLocation = async () => {
    try {
      setLoading(true);
      const temperatures = await Promise.all(
        locations.map(async (location) => {
          const temp = await fetchTemperature(location.lat, location.lon);
          return { name: location.name, temperature: temp };
        })
      );

      // Filtrer les lieux avec des températures valides
      const validTemperatures = temperatures.filter(item => item.temperature !== null);

      // Trouver la température la plus élevée
      const hottest = validTemperatures.reduce((max, current) => (current.temperature > max.temperature ? current : max), validTemperatures[0]);

      setHottestLocation(hottest);
      setAllTemperatures(validTemperatures); // Stocker toutes les températures pour affichage
    } catch (error) {
      setError("Failed to fetch data.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHottestLocation();
  }, []);

  return (
    <div>
      <h1>Hottest Location</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div>
          {hottestLocation && (
            <div>
              <h2>The hottest location is {hottestLocation.name} with a temperature of {hottestLocation.temperature}°C.</h2>
            </div>
          )}
          <h3>Temperatures of all locations:</h3>
          <ul>
            {allTemperatures.map((location) => (
              <li key={location.name}>
                {location.name}: {location.temperature}°C
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;

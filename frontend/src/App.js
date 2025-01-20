import React, { useState, useEffect } from 'react';

const App = () => {
  const [locations, setLocations] = useState([]);
  const [hottestLocation, setHottestLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const continentsCoordinates = {
    Africa: { latMin: -37, latMax: 37, lonMin: -18, lonMax: 51 },
    Asia: { latMin: 10, latMax: 80, lonMin: 60, lonMax: 180 },
    Europe: { latMin: 35, latMax: 72, lonMin: -31, lonMax: 40 },
    NorthAmerica: { latMin: 24, latMax: 72, lonMin: -170, lonMax: -60 },
    SouthAmerica: { latMin: -55, latMax: 12, lonMin: -80, lonMax: -35 },
    Oceania: { latMin: -50, latMax: -10, lonMin: 120, lonMax: 180 },
  };

  // Fonction pour générer des coordonnées aléatoires
  const getRandomCoordinates = (continent) => {
    const { latMin, latMax, lonMin, lonMax } = continentsCoordinates[continent];
    const lat = (Math.random() * (latMax - latMin)) + latMin;
    const lon = (Math.random() * (lonMax - lonMin)) + lonMin;
    return { lat, lon };
  };

  // Fonction pour récupérer la ville et le pays les plus proches d'une coordonnée avec GeoNames
  const getCityFromCoordinates = async (lat, lon) => {
    const username = "christotter"; // Ton nom d'utilisateur GeoNames
    const response = await fetch(`http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&username=${username}`);
    const data = await response.json();
    if (data.geonames && data.geonames[0]) {
      return {
        name: data.geonames[0].name,
        country: data.geonames[0].countryName,
      }; // Retourner le nom de la ville et du pays
    }
    return null;
  };

  // Fonction pour récupérer la température
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
      const selectedLocations = [];

      // Sélectionner un lieu pour chaque continent
      for (let continent of Object.keys(continentsCoordinates)) {
        const { lat, lon } = getRandomCoordinates(continent);
        const cityData = await getCityFromCoordinates(lat, lon);
        if (cityData) {
          const temperature = await fetchTemperature(lat, lon);
          selectedLocations.push({
            name: cityData.name,
            country: cityData.country,
            lat,
            lon,
            temperature,
          });
        } else {
          selectedLocations.push({
            continent,
            message: `No location found for ${continent}`,
          });
        }
      }

      setLocations(selectedLocations);

      // Trouver la ville la plus chaude
      const hottest = selectedLocations.filter(item => item.temperature).reduce((max, current) => (current.temperature > max.temperature ? current : max), selectedLocations[0]);
      setHottestLocation(hottest);
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
              <h2>The hottest location is {hottestLocation.name} ({hottestLocation.country}) with a temperature of {hottestLocation.temperature}°C.</h2>
            </div>
          )}
          <h3>Locations from each continent:</h3>
          <ul>
            {locations.map((location, index) => (
              <li key={index}>
                {location.message ? (
                  <span>{location.message}</span>
                ) : (
                  <span>{location.name}, {location.country}: {location.temperature}°C</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;

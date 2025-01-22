import React, { useState, useEffect } from 'react';

const App = () => {
  const [hottestLocation, setHottestLocation] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les données depuis le backend
  const getHottestLocation = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/hottest-location');
      const data = await response.json();
      setHottestLocation(data.hottestLocation);
      setAllLocations(data.allLocations); // Stocke toutes les localisations
    } catch (error) {
      setError('Failed to fetch data.');
      console.error('Error:', error);
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
          {hottestLocation && hottestLocation.name ? (
            <h2>
              The hottest location is {hottestLocation.name} ({hottestLocation.country}) with a
              temperature of {hottestLocation.temperature}°C.
            </h2>
          ) : (
            <h2>No hottest location could be determined.</h2>
          )}
          <h2>All Locations</h2>
          <ul>
            {allLocations.map((location, index) => (
              location.name && location.country && location.temperature !== undefined ? (
                <li key={index}>
                  {location.name}, {location.country}, {location.continent}: {location.temperature}°C
                </li>
              ) : (
                <li key={index}>
                  {location.continent}: {location.message || 'No valid data available'}
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;

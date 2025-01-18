import React, { useEffect, useState } from 'react';

function App() {
  const [hottest, setHottest] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/highest-temperature')
      .then((response) => response.json())
      .then((data) => setHottest(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Hottest Location</h1>
      {hottest ? (
        <div>
          <h2>{hottest.location}</h2>
          <p>Max Temperature: {hottest.maxTemp}°C</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;

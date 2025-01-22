import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config(); // Charger les variables d'environnement

// Configuration MongoDB
const uri = process.env.MONGO_URI; // URI MongoDB dans .env
const dbName = 'weatherApp';
let db;

// Fonction pour se connecter à la base de données MongoDB
export async function connectToDB() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log(`Connecté à la base de données: ${dbName}`);
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    throw error;
  }
}

// Nouvelle fonction pour sauvegarder une localisation
export async function saveLocation(location) {
  try {
    console.log("Tentative d'accès à la collection 'locations'");
    const collection = db.collection('locations');
    console.log("Insertion dans la collection : ", location);
    await collection.insertOne(location);
    console.log("Localisation sauvegardée avec succès");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la localisation :", error);
  }
}

// Fonction pour obtenir la température et la ville à partir des coordonnées
export async function getLocationData(lat, lon) {
    const username = process.env.GEONAMES_USERNAME;
    const geoNamesUrl = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&username=${username}`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  
    try {
      console.log(`Fetching data for coordinates: ${lat}, ${lon}`);
  
      // Requête GeoNames
      const geoNamesResponse = await fetch(geoNamesUrl);
      if (!geoNamesResponse.ok) {
        throw new Error(`GeoNames API error: ${geoNamesResponse.statusText}`);
      }
      const geoNamesData = await geoNamesResponse.json();
  
      if (!geoNamesData.geonames || geoNamesData.geonames.length === 0) {
        console.warn('No city found for these coordinates:', { lat, lon });
        return { cityName: 'Unknown', countryName: 'Unknown', temperature: null };
      }
  
      const cityData = geoNamesData.geonames[0];
      const cityName = cityData.name;
      const countryName = cityData.countryName;
  
      // Requête Open-Meteo
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) {
        throw new Error(`Open-Meteo API error: ${weatherResponse.statusText}`);
      }
      const weatherData = await weatherResponse.json();
  
      if (weatherData.current_weather) {
        const temperature = weatherData.current_weather.temperature;
        return { cityName, countryName, temperature };
      } else {
        throw new Error('Weather data not found');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw error;
    }
  }
  

// Fonction pour générer des coordonnées aléatoires pour un continent
export function getRandomCoordinates(continent) {
  const continentsCoordinates = {
    Africa: { latMin: -37, latMax: 37, lonMin: -18, lonMax: 51 },
    Asia: { latMin: 10, latMax: 80, lonMin: 60, lonMax: 180 },
    Europe: { latMin: 35, latMax: 72, lonMin: -31, lonMax: 40 },
    NorthAmerica: { latMin: 24, latMax: 72, lonMin: -170, lonMax: -60 },
    SouthAmerica: { latMin: -55, latMax: 12, lonMin: -80, lonMax: -35 },
    Oceania: { latMin: -50, latMax: -10, lonMin: 120, lonMax: 180 },
  };

  // Vérifier si le continent est valide
  if (!continentsCoordinates[continent]) {
    throw new Error(`Continent invalide: ${continent}`);
  }

  const { latMin, latMax, lonMin, lonMax } = continentsCoordinates[continent];
  const lat = Math.random() * (latMax - latMin) + latMin;
  const lon = Math.random() * (lonMax - lonMin) + lonMin;

  return { lat, lon };
}

// Sauvegarder les résultats des requêtes API dans la base de données
export async function saveQueryResult({ lat, lon, cityName, countryName, temperature, continent }) {
    if (!db) {
      throw new Error('Database connection is not established.');
    }
  
    const collection = db.collection('queryResults');
  
    // Vérifie si les coordonnées existent déjà
    const existingResult = await collection.findOne({ lat, lon });
    if (existingResult) {
      console.log(`Coordinates already processed: lat=${lat}, lon=${lon}`);
      return;
    }
  
    // Insérer les résultats dans la base de données
    const result = {
      lat,
      lon,
      cityName: cityName || 'Unknown',
      countryName: countryName || 'Unknown',
      continent: continent || 'Unknown',
      temperature: temperature !== undefined ? temperature : null,
      timestamp: new Date(),
    };
  
    await collection.insertOne(result);
    console.log('Saved query result to database:', result);
  }
  
// Fonction pour récupérer la base de données connectée
export function getDatabase() {
  if (!db) {
    throw new Error('La base de données n’est pas connectée.');
  }
  return db;
}

// Fonction pour fermer la connexion à la base de données
export async function closeDBConnection() {
  if (db) {
    await db.close();
    console.log('Connexion à la base de données fermée');
  }
}


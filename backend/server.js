import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDB, getLocationData, getRandomCoordinates, closeDBConnection, saveLocation, saveQueryResult, getDatabase } from './db.js';

dotenv.config(); // Charger les variables d'environnement

// Initialisation de l'application Express
const app = express();

// Utiliser CORS
app.use(cors());

const PORT = process.env.PORT || 3001;

app.use(express.json()); // Pour traiter les requêtes JSON

// Connecte à MongoDB
connectToDB()
  .then(() => console.log('Connexion à MongoDB réussie.'))
  .catch((err) => console.error('Erreur de connexion à MongoDB:', err));



// Endpoint pour tester l’écriture dans MongoDB
app.post('/api/test-db-write', async (req, res) => {
  try {
    const db = getDatabase(); // Récupère la base de données connectée
    const collection = db.collection('testCollection'); // Utilise une collection appelée testCollection

    const document = {
      testField: 'Hello, MongoDB!',
      timestamp: new Date(),
    };

    const result = await collection.insertOne(document); // Insère un document dans la collection
    console.log('Document inséré :', result);

    res.status(201).json({ message: 'Document inséré avec succès', result });
  } catch (error) {
    console.error('Erreur lors de l’insertion dans la base :', error);
    res.status(500).json({ error: 'Erreur lors de l’insertion dans la base' });
  }
});




// Endpoint pour ajouter une localisation
app.post('/api/locations', async (req, res) => {
  const location = req.body; // Récupère les données envoyées par le client
  try {
    await saveLocation(location);
    res.status(201).json({ message: 'Localisation enregistrée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la localisation :', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de la localisation.' });
  }
});

// Endpoint pour obtenir la localisation la plus chaude et toutes les localisations
app.get('/api/hottest-location', async (req, res) => {
  try {
    const selectedLocations = [];
    const continents = ['Africa', 'Asia', 'Europe', 'NorthAmerica', 'SouthAmerica', 'Oceania'];

    for (let continent of continents) {
      try {
        const { lat, lon } = getRandomCoordinates(continent);
        const locationData = await getLocationData(lat, lon);

        // Enregistrer le résultat dans la base de données
        await saveQueryResult({
          lat,
          lon,
          cityName: locationData?.cityName,
          countryName: locationData?.countryName,
          temperature: locationData?.temperature,
          continent,
        });

        if (
          locationData &&
          locationData.cityName &&
          locationData.countryName &&
          locationData.temperature !== null
        ) {
          selectedLocations.push({
            continent,
            name: locationData.cityName,
            country: locationData.countryName,
            lat,
            lon,
            temperature: locationData.temperature,
          });
        } else {
          selectedLocations.push({
            continent,
            message: `No valid data found for ${continent}`,
          });
        }
      } catch (error) {
        console.error(`Error processing continent ${continent}:`, error);

        // Enregistrer les coordonnées avec un message d'erreur dans la base de données
        await saveQueryResult({
          lat: lat || 'Unknown',
          lon: lon || 'Unknown',
          cityName: 'Unknown',
          countryName: 'Unknown',
          temperature: null,
          continent,
        });

        selectedLocations.push({
          continent,
          message: `Error fetching data for ${continent}`,
        });
      }
    }

    // Filtrer les localisations valides
    const validLocations = selectedLocations.filter((location) => location.temperature !== undefined);

    // Trouver la localisation la plus chaude
    const hottest =
      validLocations.length > 0
        ? validLocations.reduce((max, current) =>
            current.temperature > max.temperature ? current : max
          )
        : { message: 'No valid locations found across all continents.' };

    res.status(200).json({
      hottestLocation: hottest,
      allLocations: selectedLocations,
    });
  } catch (error) {
    console.error('Error fetching hottest location:', error);
    res.status(500).json({ error: 'Failed to fetch the hottest location.' });
  }
});

// Lancer le serveur
const server = app.listen(PORT, () => {
  console.log(`Serveur backend en écoute sur http://localhost:${PORT}`);
});

// Fermeture propre du serveur et de la base de données
process.on('SIGINT', async () => {
  console.log('Fermeture du serveur...');
  await closeDBConnection();
  server.close(() => {
    console.log('Serveur fermé.');
    process.exit(0);
  });
});


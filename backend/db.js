require('dotenv').config();
const { MongoClient } = require('mongodb');

// Configuration MongoDB
const uri = process.env.MONGO_URI; // Chargement de l'URI depuis les variables d'environnement
const dbName = 'weatherApp';
let db;

async function connectToDB() {
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

async function saveLocation(location) {
  if (!db) throw new Error('La base de données n’est pas connectée.');
  const collection = db.collection('locations');

  // Vérifie si la localisation existe déjà
  const existing = await collection.findOne({ lat: location.lat, lon: location.lon });
  if (existing) {
    console.log('Localisation déjà enregistrée:', existing);
    return;
  }

  // Insère la localisation dans la base
  await collection.insertOne(location);
  console.log('Localisation enregistrée:', location);
}

async function isLocationProcessed(lat, lon) {
  if (!db) throw new Error('La base de données n’est pas connectée.');
  const collection = db.collection('locations');
  const location = await collection.findOne({ lat, lon });
  return location !== null;
}

module.exports = { connectToDB, saveLocation, isLocationProcessed };

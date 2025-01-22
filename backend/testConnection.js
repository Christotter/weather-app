const { MongoClient } = require('mongodb');

// Remplacez cette adresse par l'IP de votre machine virtuelle Linux
const uri = 'mongodb://cjohnson:Zurich.15@192.168.1.100:27017'; // Ajoute les identifiants d'authentification

// Nom de la base de données que vous souhaitez utiliser
const dbName = 'admin';

async function testConnection() {
  try {
    // Crée une instance de MongoClient avec l'authentification
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    // Connexion à MongoDB
    await client.connect();
    console.log('Connexion réussie à MongoDB');

    // Accéder à une base de données spécifique
    const db = client.db(dbName);
    console.log(`Connecté à la base de données: ${db.databaseName}`);

    // Effectuer une opération de test (par exemple, récupérer les collections)
    const collections = await db.collections();
    console.log('Collections:', collections.map(col => col.collectionName));

    // Fermer la connexion
    await client.close();
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
  }
}

// Exécuter la fonction de test
testConnection();

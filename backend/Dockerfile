# Étape 1 : Utiliser une image de base Node.js
FROM node:22.13.0

# Étape 2 : Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 3 : Copier les fichiers nécessaires
COPY package*.json ./
COPY . .

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Exposer le port sur lequel le backend écoute
EXPOSE 3001

# Étape 6 : Commande pour lancer le serveur
CMD ["node", "server.js"]

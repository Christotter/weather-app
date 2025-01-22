# Étape 1 : Construire l'application avec Node.js
FROM node:22.13.0 AS build
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

# Étape 2 : Servir l'application avec Nginx
FROM nginx:1.27.3
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

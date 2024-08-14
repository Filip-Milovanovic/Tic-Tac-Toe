# Dockerfile (fe/Dockerfile)

# Koristimo Node.js 18 kao bazu
FROM node:18

# Postavimo radni direktorijum unutar kontejnera
WORKDIR /usr/src/app

# Kopiramo package.json i package-lock.json u kontejner
COPY package*.json ./

# Instaliramo dependencies
RUN npm cache clean --force && npm install --legacy-peer-deps

# Kopiramo ostatak aplikacije u kontejner
COPY . .

# Ekspoziramo port na kojem frontend sluša
EXPOSE 3000

# Pokrećemo frontend aplikaciju
CMD ["npm", "start"]
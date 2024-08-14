# Dockerfile (be/Dockerfile)

# Koristimo Node.js 18 kao bazu
FROM node:18

# Postavimo radni direktorijum unutar kontejnera
WORKDIR /usr/src/app

# Kopiramo package.json i package-lock.json u kontejner
COPY package*.json ./

# Instaliramo dependencies
RUN npm install

# Kopiramo ostatak aplikacije u kontejner
COPY . .

# Ekspoziramo port na kojem aplikacija sluša
EXPOSE 5000

# Pokrećemo aplikaciju
CMD ["npm", "run", "dev"]

FROM node:20.14.0-buster as build

WORKDIR /app/aivaluate/backend

RUN apt-get update && \
    apt-get install -y netcat-openbsd postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN which nc && nc -h

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "echo 'DB_HOST: $DB_HOST'; echo 'DB_PORT: $DB_PORT'; while ! nc -z $DB_HOST $DB_PORT; do sleep 1; done && node server.js"]
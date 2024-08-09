FROM node:20.14.0-buster as build

WORKDIR /app/aivaluate/backend-eval

RUN apt-get update && \
    apt-get install -y netcat-openbsd postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN which nc && nc -h

COPY package*.json ./

RUN npm install axios
RUN npm install nodemailer
RUN npm install
RUN npm install express multer

COPY . .

# Check the directory structure for debugging
RUN ls -la /app/aivaluate/backend-eval

# Check if jest.config.js and logger.js exist for debugging
RUN ls -la /app/aivaluate/backend-eval/jest.config.js
RUN ls -la /app/aivaluate/backend-eval/evallogger.js


EXPOSE 6000

CMD ["sh", "-c", "echo 'DB_HOST: $DB_HOST'; echo 'DB_PORT: $DB_PORT'; while ! nc -z $DB_HOST $DB_PORT; do sleep 1; done && npm test -- --coverage --coverageReporters=text && node EvalServer.js"]
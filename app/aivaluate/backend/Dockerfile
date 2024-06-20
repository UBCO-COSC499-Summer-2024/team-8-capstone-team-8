FROM node:20.14.0-buster as build

WORKDIR /app/aivaluate/backend
=======
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD sh -c "while ! nc -z $DB_HOST $DB_PORT; do sleep 1; done && node server.js"
COPY --from=build /app .

RUN apk add --no-cache postgresql-client

COPY aivaluatedb.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=AIvaluatedb
ENV POSTGRES_HOST=db

EXPOSE 5432

CMD ["sh", "-c", "until PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -c 'SELECT 1' >/dev/null 2>&1; do echo 'Waiting for database connection...'; sleep 1; done && PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f /docker-entrypoint-initdb.d/aivaluatedb.sql && node server.js"]
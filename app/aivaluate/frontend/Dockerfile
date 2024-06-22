FROM node:20.14.0-buster as build

WORKDIR /app/aivaluate/frontend

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
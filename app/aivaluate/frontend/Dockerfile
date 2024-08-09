FROM node:20.14.0-buster as build


WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm install axios

RUN npm install react-datepicker
RUN npm install date-fns
RUN npm install selenium-webdriver

RUN npm run build

RUN ls -la /app/dist

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY --from=build /app/public /usr/share/nginx/html/public

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

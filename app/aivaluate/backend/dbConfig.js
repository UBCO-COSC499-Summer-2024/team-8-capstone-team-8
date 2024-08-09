// require('dotenv').config();

// const { Pool } = require("pg");

// const isProduction = process.env.NODE_ENV === "production";

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`;

// const pool = new Pool({
//     connectionString: isProduction ? process.env.DATABASE_URL : connectionString
// });

// module.exports = { pool };

require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

let connectionString;

if (isProduction) {
    connectionString = process.env.DATABASE_URL;
} else if (isTest) {
    connectionString = `postgresql://${process.env.TEST_DB_USER}:${process.env.TEST_DB_PASSWORD}@${process.env.TEST_DB_HOST}:${process.env.TEST_DB_PORT || 5432}/${process.env.TEST_DB_DATABASE}`;
} else {
    connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`;
}

const pool = new Pool({
    connectionString
});

module.exports = { pool };

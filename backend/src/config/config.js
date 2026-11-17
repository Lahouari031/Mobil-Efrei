// Database configuration, read from the .env file.
// Used both by the app (models/index.js) and by sequelize-cli (migrations / seeders).
require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
};

module.exports = { development: base, test: base, production: base };

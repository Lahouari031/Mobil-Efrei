// Entry point: connects to the database, then starts the HTTP server
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate(); // checks the MySQL connection
    console.log('✅ Connected to the database');
    app.listen(PORT, () => console.log(`🚀 Mobil'Efrei API running on http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
    process.exit(1);
  }
}

start();

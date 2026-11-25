// Entry point: connects to the database, then starts the HTTP server
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

// Explains the most common set-up mistakes (shown in the terminal)
function databaseHint(err) {
  const code = err.original?.code || err.parent?.code || '';
  const where = `${process.env.DB_HOST}:${process.env.DB_PORT}`;
  if (code === 'ECONNREFUSED') return `MySQL is not running on ${where}. Start MySQL (Windows: services.msc > MySQL84 > Start) or check DB_PORT in backend/.env.`;
  if (code === 'ER_ACCESS_DENIED_ERROR') return 'Wrong MySQL user or password: check DB_USER and DB_PASSWORD in backend/.env.';
  if (code === 'ER_BAD_DB_ERROR') return 'The database does not exist yet: run "npm run db:setup" from the project root.';
  if (!process.env.DB_NAME) return 'backend/.env is missing: run "npm run setup" from the project root.';
  return 'Check the DB_* values in backend/.env.';
}

async function start() {
  try {
    await sequelize.authenticate(); // checks the MySQL connection
    console.log('✅ Connected to the database');
    app.listen(PORT, () => console.log(`🚀 Mobil'Efrei API running on http://localhost:${PORT}/api`));
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err.message);
    console.error('👉 ' + databaseHint(err));
    process.exit(1);
  }
}

start();

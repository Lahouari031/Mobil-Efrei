'use strict';
// Seeder: a second administrator account, read from .env
//   ADMIN2_EMAIL=firstname.lastname@efrei.net
//   ADMIN2_USERNAME=yourname
//   ADMIN2_PASSWORD=...
// On an existing database, run only this seeder:
//   npx sequelize-cli db:seed --seed 20261124000001-second-admin.js
require('dotenv').config();
const bcrypt = require('bcrypt');

const { ADMIN2_EMAIL, ADMIN2_USERNAME, ADMIN2_PASSWORD } = process.env;

module.exports = {
  async up(queryInterface) {
    if (!ADMIN2_EMAIL || !ADMIN2_USERNAME || !ADMIN2_PASSWORD) {
      console.log('Second admin skipped: set ADMIN2_EMAIL, ADMIN2_USERNAME and ADMIN2_PASSWORD in .env');
      return;
    }
    const now = new Date();
    const passwordHash = await bcrypt.hash(ADMIN2_PASSWORD, 12);
    await queryInterface.bulkInsert('users', [
      {
        email: ADMIN2_EMAIL.toLowerCase(),
        username: ADMIN2_USERNAME,
        password_hash: passwordHash,
        role: 'admin',
        email_verified_at: now, // admins skip the email code
        created_at: now,
        updated_at: now,
      },
    ]);
  },
  async down(queryInterface) {
    if (ADMIN2_EMAIL) await queryInterface.bulkDelete('users', { email: ADMIN2_EMAIL.toLowerCase() });
  },
};

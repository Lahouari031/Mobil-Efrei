'use strict';
// Seeder: creates an administrator account used to manage tips (admin area)
require('dotenv').config();
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin1234', 12);
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      { email: 'admin@efrei.net', username: 'admin', password_hash: passwordHash, role: 'admin', created_at: now, updated_at: now },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@efrei.net' });
  },
};

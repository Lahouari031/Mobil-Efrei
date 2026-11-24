'use strict';
// Migration: admin accounts never need the email code
// (the admin seeder runs after the email-verification migration, so its account was left unverified)
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkUpdate('users', { email_verified_at: new Date() }, { role: 'admin', email_verified_at: null });
  },
  async down() {},
};

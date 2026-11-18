'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Les comptes déjà créés conservent leur accès au site.
    await queryInterface.bulkUpdate(
      'users',
      { email_verified_at: new Date() },
      { email_verified_at: null },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'email_verified_at');
  },
};
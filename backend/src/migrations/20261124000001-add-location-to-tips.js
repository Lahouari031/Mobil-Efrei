'use strict';
// Migration: optional address + GPS coordinates on tips (used by the "Map" tab)
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tips', 'address', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('tips', 'latitude', { type: Sequelize.DECIMAL(9, 6), allowNull: true });
    await queryInterface.addColumn('tips', 'longitude', { type: Sequelize.DECIMAL(9, 6), allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('tips', 'longitude');
    await queryInterface.removeColumn('tips', 'latitude');
    await queryInterface.removeColumn('tips', 'address');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'urgent_alerts',
      'alert_date',
      {
        type: Sequelize.DATEONLY,
        allowNull: true
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'urgent_alerts',
      'alert_date'
    );
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('urgent_alerts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onDelete: 'CASCADE',
      },

      title: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },

      details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('urgent_alerts');
  },
};
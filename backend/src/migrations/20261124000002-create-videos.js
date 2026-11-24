'use strict';
// Migration: TikTok videos attached to a destination ("Videos" tab)
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('videos', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING(150), allowNull: true },
      url: { type: Sequelize.STRING(255), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('videos');
  },
};

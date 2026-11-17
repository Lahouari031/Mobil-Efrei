'use strict';
// Migration: create the destinations table
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('destinations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: Sequelize.STRING(60), allowNull: false, unique: true },
      country: { type: Sequelize.STRING(60), allowNull: false },
      city: { type: Sequelize.STRING(60), allowNull: false },
      university: { type: Sequelize.STRING(120) },
      flag: { type: Sequelize.STRING(8) },
      summary: { type: Sequelize.TEXT, allowNull: false },
      language: { type: Sequelize.STRING(80) },
      currency: { type: Sequelize.STRING(40) },
      monthly_budget: { type: Sequelize.INTEGER },
      image_url: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('destinations');
  },
};

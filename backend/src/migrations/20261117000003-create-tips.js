'use strict';
// Migration: create the tips table (foreign key to destinations)
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tips', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      destination_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'destinations', key: 'id' },
        onDelete: 'CASCADE',
      },
      category: {
        type: Sequelize.ENUM('budget', 'places', 'student-life', 'culture-language', 'schedule', 'school-resources'),
        allowNull: false,
      },
      title: { type: Sequelize.STRING(120), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      link: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tips');
  },
};

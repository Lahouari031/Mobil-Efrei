'use strict';
// Migration: create the likes table (many-to-many users <-> comments)
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      comment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'comments', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    // Prevents a user from liking the same comment twice
    await queryInterface.addIndex('likes', ['user_id', 'comment_id'], { unique: true, name: 'likes_user_comment_unique' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('likes');
  },
};

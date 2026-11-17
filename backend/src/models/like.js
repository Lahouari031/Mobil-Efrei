// Like model: join table User <-> Comment.
// A user can like a given comment only once (unique index on the pair).
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Like',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      commentId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      tableName: 'likes',
      underscored: true,
      updatedAt: false,
      indexes: [{ unique: true, fields: ['user_id', 'comment_id'] }],
    }
  );

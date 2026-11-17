// Comment model: a student's feedback about a destination
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Comment',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      destinationId: { type: DataTypes.INTEGER, allowNull: false },
      content: { type: DataTypes.STRING(500), allowNull: false, validate: { len: [3, 500] } },
    },
    { tableName: 'comments', underscored: true }
  );

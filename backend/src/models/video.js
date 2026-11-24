// Video model: a TikTok video shown in the "Videos" tab of a destination
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Video',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      destinationId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(150), allowNull: true },
      url: { type: DataTypes.STRING(255), allowNull: false },
    },
    { tableName: 'videos', underscored: true }
  );

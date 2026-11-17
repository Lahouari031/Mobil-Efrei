// Destination model: a partner university / city for the semester abroad
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'Destination',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      slug: { type: DataTypes.STRING(60), allowNull: false, unique: true }, // used in the URL: /destinations/cape-town
      country: { type: DataTypes.STRING(60), allowNull: false },
      city: { type: DataTypes.STRING(60), allowNull: false },
      university: { type: DataTypes.STRING(120), allowNull: true },
      flag: { type: DataTypes.STRING(8), allowNull: true }, // flag emoji
      summary: { type: DataTypes.TEXT, allowNull: false },
      language: { type: DataTypes.STRING(80), allowNull: true },
      currency: { type: DataTypes.STRING(40), allowNull: true },
      monthlyBudget: { type: DataTypes.INTEGER, allowNull: true }, // estimated monthly budget in euros
      imageUrl: { type: DataTypes.STRING(255), allowNull: true },
    },
    { tableName: 'destinations', underscored: true }
  );

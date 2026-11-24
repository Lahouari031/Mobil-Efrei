// Tip model: a piece of advice linked to a destination, sorted by category
const { DataTypes } = require('sequelize');

const CATEGORIES = ['budget', 'places', 'student-life', 'culture-language', 'schedule', 'school-resources'];

module.exports = (sequelize) => {
  const Tip = sequelize.define(
    'Tip',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      destinationId: { type: DataTypes.INTEGER, allowNull: false },
      category: { type: DataTypes.ENUM(...CATEGORIES), allowNull: false },
      title: { type: DataTypes.STRING(120), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      link: { type: DataTypes.STRING(255), allowNull: true },
      // Optional location, used by the "Map" tab (Leaflet + OpenStreetMap)
      address: { type: DataTypes.STRING(255), allowNull: true },
      latitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true, get() { const v = this.getDataValue('latitude'); return v == null ? null : Number(v); } },
      longitude: { type: DataTypes.DECIMAL(9, 6), allowNull: true, get() { const v = this.getDataValue('longitude'); return v == null ? null : Number(v); } },
    },
    { tableName: 'tips', underscored: true }
  );
  Tip.CATEGORIES = CATEGORIES;
  return Tip;
};

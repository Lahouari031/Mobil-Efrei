const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'UrgentAlert',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      destinationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      alertDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    },
    {
      tableName: 'urgent_alerts',
      underscored: true,
    }
  );

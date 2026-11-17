// User model: an EFREI student registered on the platform
const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        // Second validation layer, at model level
        validate: { isEmail: true, is: /@efrei\.(net|fr)$/i },
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: { is: /^[a-zA-Z0-9_]{3,20}$/ },
      },
      // The password is NEVER stored in plain text: only its bcrypt hash
      passwordHash: { type: DataTypes.STRING(100), allowNull: false },
      role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    },
    {
      tableName: 'users',
      underscored: true,
      // By default, the hash is never returned by queries
      defaultScope: { attributes: { exclude: ['passwordHash'] } },
      scopes: { withPassword: { attributes: { include: ['passwordHash'] } } },
    }
  );

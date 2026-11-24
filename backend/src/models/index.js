// Models entry point (the "M" in MVC).
// Creates the Sequelize connection, loads every model and declares the relationships.
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {
  User: require('./user')(sequelize),
  Destination: require('./destination')(sequelize),
  Tip: require('./tip')(sequelize),
  Comment: require('./comment')(sequelize),
  Like: require('./like')(sequelize),
  UrgentAlert: require('./urgentAlert')(sequelize),
  Video: require('./video')(sequelize),
};

const { User, Destination, Tip, Comment, Like, UrgentAlert, Video } = db;

// ---------- Relationships ----------
// A destination has many tips (1-N)
Destination.hasMany(Tip, { foreignKey: 'destinationId', as: 'tips', onDelete: 'CASCADE' });
Tip.belongsTo(Destination, { foreignKey: 'destinationId', as: 'destination' });

// A destination has many comments (1-N)
Destination.hasMany(Comment, { foreignKey: 'destinationId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Destination, { foreignKey: 'destinationId', as: 'destination' });

// A user writes many comments (1-N)
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Likes: many-to-many relationship between User and Comment, through the "likes" table
User.belongsToMany(Comment, { through: Like, foreignKey: 'userId', otherKey: 'commentId', as: 'likedComments' });
Comment.belongsToMany(User, { through: Like, foreignKey: 'commentId', otherKey: 'userId', as: 'likers' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Comment, { foreignKey: 'commentId' });
Like.belongsTo(User, { foreignKey: 'userId' });

Destination.hasMany(UrgentAlert, {
  foreignKey: 'destinationId',
  as: 'urgentAlerts',
  onDelete: 'CASCADE',
});

UrgentAlert.belongsTo(Destination, {
  foreignKey: 'destinationId',
  as: 'destination',
});

// A destination has many TikTok videos (1-N)
Destination.hasMany(Video, { foreignKey: 'destinationId', as: 'videos', onDelete: 'CASCADE' });
Video.belongsTo(Destination, { foreignKey: 'destinationId', as: 'destination' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

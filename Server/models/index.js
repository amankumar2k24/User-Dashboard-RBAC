const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./User')(sequelize, Sequelize);
db.Role = require('./Role')(sequelize, Sequelize);
db.Post = require('./Post')(sequelize, Sequelize);
db.RefreshToken = require('./RefreshToken')(sequelize, Sequelize);

// Define associations
db.User.belongsTo(db.Role, { foreignKey: 'roleId', as: 'role' });
db.Role.hasMany(db.User, { foreignKey: 'roleId', as: 'users' });
db.User.hasMany(db.RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
db.RefreshToken.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.User.hasMany(db.Post, { foreignKey: 'authorId', as: 'posts' }); 
db.Post.belongsTo(db.User, { foreignKey: 'authorId', as: 'author' });

module.exports = db;

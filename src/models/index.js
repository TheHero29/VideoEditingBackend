const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', 
});

const Video = require('./video');

sequelize.sync().then(() => {
    console.log('Database synchronized');
}).catch(err => {
    console.error('Unable to sync the database:', err);
});

module.exports = sequelize;

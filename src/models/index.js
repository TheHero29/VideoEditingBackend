const { Sequelize } = require('sequelize');
require('./video')
// Create a new Sequelize instance
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', 
});

sequelize.sync().then(() => {
    console.log('Database synchronized');
}).catch(err => {
    console.error('Unable to sync the database:', err);
});

module.exports = sequelize;

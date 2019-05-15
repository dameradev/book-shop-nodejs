const Sequalize = require('sequelize');

const sequelize = new Sequalize('node', 'root', '523970Aa', {
  dialect: 'mysql', 
  host: 'localhost'
});


module.exports = sequelize;
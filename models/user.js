const Sequalize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('User', {
  id: {
    type: Sequalize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequalize.STRING,
  email: Sequalize.STRING
});


module.exports = User;
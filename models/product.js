const Sequalize = require('sequelize');

const sequelize = require('../util/database');

const Product = sequelize.define('product', {
    id: {
      type: Sequalize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    title: Sequalize.STRING,
    price: {
      type: Sequalize.DOUBLE,
      allowNull: false
    },
    imageUrl: {
      type: Sequalize.STRING,
      allowNull: false
    },
    description: {
      type: Sequalize.TEXT,
      allowNull: false
    }
});

module.exports = Product;
const path = require('path');

const express = require('express');

const rootDir = require('../helpers/path')

const router = express.Router();

const products = [];

// /admin/add-procuct => GET
router.get('/add-product',  (req, res, next) => {
  res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

// /admin/add-procuct => POST
router.post('/add-product', (req, res, next) => {
  products.push({title: req.body.title});
  res.redirect('/')
});

exports.routes = router;
exports.products = products;
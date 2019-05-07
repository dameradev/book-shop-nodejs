const path = require('path');

const express = require('express');

const productsController = require('../controllers/products');

const router = express.Router();



// /admin/add-procuct => GET
router.get('/add-product',  productsController.getAddProduct);

// /admin/add-procuct => POST
router.post('/add-product', productsController.postAddProduct);

module.exports = router;

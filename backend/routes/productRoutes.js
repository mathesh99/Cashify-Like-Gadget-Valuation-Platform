const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products', productController.getAllProductsGrouped);
router.post('/evaluate', productController.evaluateProduct);

module.exports = router;

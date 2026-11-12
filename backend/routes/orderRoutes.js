const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Place a Buy Order (Guest)
router.post('/', orderController.createOrder);

module.exports = router;

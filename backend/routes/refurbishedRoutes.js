const express = require('express');
const router = express.Router();
const refurbishedController = require('../controllers/refurbishedController');

router.get('/refurbished', refurbishedController.getRefurbishedProducts);

module.exports = router;

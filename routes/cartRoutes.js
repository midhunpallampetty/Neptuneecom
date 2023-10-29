// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add a product to the cart
router.post('/add', cartController.addToCart);

  
// Increment the quantity of a product in the cart
router.put('/increment/:productId', cartController.incrementCartItem);

// Remove a product from the cart
router.delete('/remove/:productId', cartController.removeItemFromCart);

// Get the user's cart
router.get('/', cartController.getUserCart);

module.exports = router;

// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');



module.exports = router;

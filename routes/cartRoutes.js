// routes/cartRoutes.js
const express = require('express');
const userAuth= require('../middleware/userAuth');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add a product to the cart
router.post('/add', userAuth.isUserLogged,cartController.addToCart);


// Increment the quantity of a product in the cart
router.get('/increment', userAuth.isUserLogged,cartController.incrementCartItem);

// Remove a product from the cart
router.get('/remove', userAuth.isUserLogged,cartController.removeItemFromCart);

// Get the user's cart
router.get('/', userAuth.isUserLogged,cartController.getUserCart);

module.exports = router;

// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');



module.exports = router;

// routes/cartRoutes.js
const express = require('express');
const userAuth= require('../middleware/userAuth');
const router = express.Router();
const cartController = require('../controllers/cartController');
const blockCheck=require('../middleware/isBlocked');
router.post('/add', userAuth.isUserLogged,cartController.addToCart);
router.get('/increment', userAuth.isUserLogged,cartController.incrementCartItem);
router.get('/remove', userAuth.isUserLogged,cartController.removeItemFromCart);
router.get('/', userAuth.isUserLogged,blockCheck.checkBlockedStatus,cartController.getUserCart);
router.post('/clear-user-cart', cartController.clearUserCart);

module.exports = router;

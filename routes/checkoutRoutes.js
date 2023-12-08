const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Route to get the checkout page
router.get('/', checkoutController.getCheckoutPage);

router.post('/updateDetailCheckout', checkoutController.updateDetailCheckout);

router.post('/updateAddressSet2', checkoutController.updateAddressSet2);

// Route to process the checkout


module.exports = router;

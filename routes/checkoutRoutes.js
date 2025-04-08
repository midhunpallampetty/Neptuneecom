const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const isLogged=require('../middleware/userAuth');
router.get('/', isLogged.isUserLogged,checkoutController.getCheckoutPage);

router.post('/updateDetailCheckout', isLogged.isUserLogged,checkoutController.updateDetailCheckout);

router.post('/updateAddressSet2', isLogged.isUserLogged,checkoutController.updateAddressSet2);
module.exports = router;

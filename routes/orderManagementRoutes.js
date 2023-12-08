const express = require('express');
const router = express.Router();
const orderManagementController = require('../controllers/orderManagementController'); // Import your controller
const adminAuth= require('../middleware/adminAuth');
const userAuth= require('../middleware/userAuth');
// Admin Routes
router.get('/', adminAuth.isAdminLogged,orderManagementController.adminOrders);
router.post('/status', orderManagementController.updateOrderStatus);

// User Routes
router.get('/user', userAuth.isUserLogged,orderManagementController.userOrders);
router.post('/cancel', userAuth.isUserLogged,orderManagementController.requestCancellation);
router.post('/return', userAuth.isUserLogged,orderManagementController.requestReturn);
router.post('/handle-razorpay-success', userAuth.isUserLogged,orderManagementController.handleRazorpaySuccess);
router.get('/user/order-history', userAuth.isUserLogged,orderManagementController.getUserOrderHistory);
router.post('/create-order', userAuth.isUserLogged,orderManagementController.createOrder);
router.get('/returnOrders', adminAuth.isAdminLogged,orderManagementController.returnOrdersPage);
router.get('/paysuccess', orderManagementController.paysuccessController);
// Approve refund for a specific order
router.post('/approveRefund', adminAuth.isAdminLogged,orderManagementController.approveRefund);

// Add more routes as needed

module.exports = router;

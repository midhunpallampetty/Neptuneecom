const express = require("express");
const blockCheck = require("../middleware/isBlocked");
const router = express.Router();
const orderManagementController = require("../controllers/orderManagementController"); // Import your controller
const adminAuth = require("../middleware/adminAuth");
const userAuth = require("../middleware/userAuth");

router.get("/", adminAuth.isAdminLogged, orderManagementController.adminOrders);
router.post("/status", orderManagementController.updateOrderStatus);

router.get(
  "/user",
  blockCheck.checkBlockedStatus,
  userAuth.isUserLogged,
  orderManagementController.userOrders
);
router.post(
  "/cancel",
  blockCheck.checkBlockedStatus,
  userAuth.isUserLogged,
  orderManagementController.requestCancellation
);
router.post(
  "/return",
  blockCheck.checkBlockedStatus,
  userAuth.isUserLogged,
  orderManagementController.requestReturn
);
router.post(
  "/handle-razorpay-success",
  blockCheck.checkBlockedStatus,
  userAuth.isUserLogged,
  orderManagementController.handleRazorpaySuccess
);
router.get(
  "/user/order-history",
  userAuth.isUserLogged,
  orderManagementController.getUserOrderHistory
);
router.post(
  "/create-order",
  blockCheck.checkBlockedStatus,
  userAuth.isUserLogged,
  orderManagementController.createOrder
);
router.get(
  "/returnOrders",
  adminAuth.isAdminLogged,
  orderManagementController.returnOrdersPage
);
router.get("/paysuccess", orderManagementController.paysuccessController);

router.post(
  "/approveRefund",
  adminAuth.isAdminLogged,
  orderManagementController.approveRefund
);

module.exports = router;

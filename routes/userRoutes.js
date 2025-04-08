// userRoutes.js
const express = require("express");
const blockedCheck=require('../middleware/isBlocked');
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const userAuth= require('../middleware/userAuth');
const flash = require("connect-flash");
const userCouponController = require('../controllers/userCouponController');
const Banner = require('../models/bannerModel');
require("dotenv").config();
const bannerController=require('../controllers/bannerController');
const randomstring = require("randomstring");
const cartRoutes=require('./cartRoutes');
const checkoutRoutes=require('./checkoutRoutes');
const userController = require("../controllers/userController");
const Product = require("../models/Product");
const orderManagemnetRoutes=require('./orderManagementRoutes');
const twilio = require("twilio");
const wishlistController = require("../controllers/wishlistController");
const profileController = require("../controllers/profileController");
const banenrController=require('../controllers/bannerController');
const addressController=require('../controllers/addressController');
// Create a Twilio client
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.AUTHTOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = "+12053950807";
const { sendOtp, verifyOtp ,registerUser} = require("../controllers/otpController");
// Function to send OTP via Twilio
function sendOTP(phoneNumber, otp) {
  return client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: +12053950807,
    to: phoneNumber,
  });
}
router.post("/send-otp", sendOtp);

// Route to verify OTP
router.post("/verify-otps", verifyOtp);
router.post("/register-user", registerUser);
router.use("/checkout",checkoutRoutes);
router.get("/mainpage", blockedCheck.checkBlockedStatus,userController.getProducts); //thisone
router.get('/registration'),userController.registrationUser;
router.get("/userSignup/:payload?", userController.renderUserSignup);
router.get('/generate-invite', userController.generateInviteLinkController);



router.use(flash());

// Render the homepage
router.get("/", async (req, res) => {
  try {
    // Retrieve a list of products from your database
    const products = await Product.find();
    const totalProducts = await Product.countDocuments();

    // Render the index.ejs template and pass the products and totalProducts data to it
    const data = {
      title: "My Express App",
      message: "Welcome to my Express app with EJS!",
      products: products, // Pass the products array
      totalProducts: totalProducts, // Pass the totalProducts count
    };

    res.render("index", data);
  } catch (err) {
    // Handle any errors
    res
      .status(500)
      .json({ error: "An error occurred while fetching products." });
  }
});
// Profile page route
router.post('/users/:userId/additional-addresses/profile',blockedCheck.checkBlockedStatus,addressController.addAdditionalAddress);

// Checkout page route
router.post('/checkoutAddress', blockedCheck.checkBlockedStatus,addressController.addAdditionalAddress);
//Profile add Address and Update/delete

// Inside your route handler for the login route (e.g., /userLogin)
router.get("/userLogin", (req, res) => {
  const error = req.flash("error")[0]; // Get the error message from flash (if any)
  res.render("userLogin", { error }); // Pass the error variable to the template
});

// Handle User Login


// Add a new route for blocking/unblocking users
router.post("/blockUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Toggle the isBlocked field (block/unblock)
    user.isBlocked = !user.isBlocked;
    await user.save();

    const message = user.isBlocked
      ? "User blocked successfully."
      : "User unblocked successfully.";
    res.status(200).json({ message });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while blocking/unblocking the user." });
  }
});




router.get("/adminSignup", (req, res) => {
  res.render("adminSignup");
});

// Handle User Logout
router.get("/logout", (req, res) => {
  // Clear the session (assuming you are using sessions)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }

    // Clear cache by setting appropriate response headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.redirect("/");
  });
});

router.post("/userLogin", userController.userLogin);
router.get("/userLogin", (req, res) => {
  res.render("userLogin");
});
router.get("/product/:productId", userController.showProductDetailsWithZoom);
router.use("/cart", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,cartRoutes);

router.post("/wishlist/add",blockedCheck.checkBlockedStatus ,userAuth.isUserLogged,wishlistController.addToWishlist);

router.get("/wishlist-cart/add", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,wishlistController.addToCartFromWishlist);

router.get("/wishlist", blockedCheck.checkBlockedStatus, userAuth.isUserLogged,wishlistController.showWishlist);
router.post(
  "/wishlist/remove/:productId",
  userAuth.isUserLogged,blockedCheck.checkBlockedStatus,wishlistController.removeFromWishlist
);
  router.use("/ordersuser", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,orderManagemnetRoutes);
  router.post('/apply-coupon', blockedCheck.checkBlockedStatus,userCouponController.applyCoupon);

  router.post('/orderdetail', blockedCheck.checkBlockedStatus,userController.renderOrderDetail);

router.get("/profile", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,profileController.viewProfile);

router.post("/profile/add", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,profileController.addDetail);

router.put("/update", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,profileController.updateDetail);
router.post('/download-invoice',userController.renderOrderDetailPdf);
router.delete("/delete", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,profileController.deleteDetail);
router.get("/shopping", blockedCheck.checkBlockedStatus,userController.displayShoppingPage);
router.use('/api/orders', blockedCheck.checkBlockedStatus,userAuth.isUserLogged,orderManagemnetRoutes);
router.use("/ordersuser", blockedCheck.checkBlockedStatus,userAuth.isUserLogged,orderManagemnetRoutes);


module.exports = router;

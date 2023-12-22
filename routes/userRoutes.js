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

// Function to send OTP via Twilio
function sendOTP(phoneNumber, otp) {
  return client.messages.create({
    body: `Your OTP is: ${otp}`,
    from: +12053950807,
    to: phoneNumber,
  });
}

// Route for sending OTP
router.post("/send-otp", async (req, res) => {
  console.log(req.body);
  const phoneNumber = req.body.num; // The recipient's phone number
  const otp = generateOTP(); // Implement your OTP generation logic
  req.session.otp = otp;
  try {
    const message = await sendOTP(phoneNumber, otp);
    const successMessage = "Otp successfully!";
    res.status(200).json({ status: true });
    // Respond with a success message
  } catch (error) {
    console.error("Error sending OTP:", error);
    const errorMessage = "Error Sending OTP!";
    res.status(400).json({ status: true });
  }
});
router.post("/resend-otp", async (req, res) => {
  console.log(req.body);
  const phoneNumber = req.body.num; // The recipient's phone number
  const otp = generateOTP(); // Implement your OTP generation logic
  req.session.otp = otp; // Store the new OTP in the session
  try {
    const message = await sendOTP(phoneNumber, otp); // Send the new OTP
    const successMessage = "OTP successfully resent!";
    res.status(200).json({ status: true });
    // Respond with a success message
  } catch (error) {
    console.error("Error resending OTP:", error);
    const errorMessage = "Error Resending OTP!";
    res.send(`
      <script>
        alert('${errorMessage}');
        window.location.href = '/userSignup'; // Redirect to the desired page
      </script>
    `);
  }
});


function verifyOTP(storedOTP, enteredOTP) {
  return storedOTP === enteredOTP;
}

router.post("/register", async (req, res) => {
 
  const { email, password } = req.body;

  try {
   
    const newUser = new User({ email, password, wallet: 0 });

   
    await newUser.save();

    console.log("User registered successfully");
    const successMessage = "User Registration Success!";
    res.send(`
      <script>
        alert('${successMessage}');
        window.location.href = '/userLogin'; // Redirect to the desired page
      </script>
    `);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Implement your OTP generation logic here
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  return otp;
}

// Display all products
router.use("/checkout",checkoutRoutes);
router.get("/mainpage", blockedCheck.checkBlockedStatus,userController.getProducts); //thisone
router.get('/registration'),userController.registrationUser;
router.post("/verify-otp", (req, res) => {
  const userEnteredOtp = req.body.otp;
  const storedOtp = req.session.otp;
  if (userEnteredOtp === storedOtp) {
    res.status(200).json({ status: true });
  } else {
    res.status(201).json({ status: true });
  }
});

router.get("/userSignup/:payload?", userController.renderUserSignup);
router.get('/generate-invite', userController.generateInviteLinkController);
router.post("/userSignup", userController.handleUserSignup);

router.post("/userSignup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      
      const errorMessage = "User With This Email already reggitered!";
      res.send(`
            <script>
              alert('${errorMessage}');
              window.location.href = '/userSignup'; // Redirect to the desired page
            </script>
          `);
    }

    
    const user = await User.create({ username, email, password });

    
    const successMessage = "User registered successfully!";
    res.send(`
      <script>
        alert('${successMessage}');
        window.location.href = '/userLogin'; // Redirect to the desired page
      </script>
    `);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
router.post("/userLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("userLogin", { error: "User not found." });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.render("userLogin", { error: "Account is blocked." });
    }

    // Check if the user has isadmin set to true
    if (user.isadmin) {
      return res.render("userLogin", { error: "Admin login not allowed." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Store the authenticated user in the session
      req.session.user = user;
      req.session.userId = user._id;

      console.log(user, "Authentication successful");
      console.log(req.session.user._id, "User ID stored in session");

      let products = await Product.find();

      // Redirect to mainpage with the user data
      return res.redirect("/mainpage");
    } else {
      return res.render("userLogin", { error: "Incorrect password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
});

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

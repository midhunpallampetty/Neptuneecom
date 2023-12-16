const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bannerController = require('../controllers/bannerController');
const orderManagementRoutes=require('./orderManagementRoutes');
const flash = require("connect-flash");
const Admin = require("../models/adminModel"); // Import Admin Model
const adminCouponController = require('../controllers/adminCouponController');

const User = require("../models/userModel"); // Make sure the path is correct
const adminController = require("../controllers/adminController");
const productController=require('../controllers/productController');
const multer = require("multer");
const adminAuth = require('../middleware/adminAuth'); // Example adminAuth middleware file

const Order=require('../models/order');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("zzzzzzzzzzzzzzzzzzzzzzzzzz");
    cb(null, "public/uploads/"); // Define the directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Define the file name for the uploaded file
  },
});

const upload = multer({ storage }); // Create the multer upload middleware

// Configure express-session middleware


router.post(
  "/admin/products",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 }, // Allow up to 5 additional images
  ]),
  adminAuth.isAdminLogged,productController.addProduct
);
// router.put('/edit-product/:productId', adminController.editProduct);
// Display the edit form
router.get("/admin/products", adminAuth.isAdminLogged,productController.listProducts);
router.get("/admin/edit/:productId", adminAuth.isAdminLogged,productController.getEditProduct);
router.get("/delete-product/:productId", adminAuth.isAdminLogged,productController.deleteProduct);
// Handle the form submission
router.get('/adminDashboardDetail',adminAuth.isAdminLogged,adminController.adminDashReport);
// Define a route that handles the form submission with image upload
router.post(
  "/admin/edit/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 }, // Allow up to 5 additional images
  ]),
  productController.postEditProduct
);

// router.put('/products/:id', upload.single('image'), adminController.updateProduct);

// Define a route for deleting a product
router.use("/ordersadmin", orderManagementRoutes);



// Use connect-flash middleware
router.use(flash());

// Render the homepage
router.get("/admin", (req, res) => {
  const data = {
    title: "My Express App",
    message: "Welcome to my Express app with EJS!",
  };
  res.render("index", data);
});

// Admin Login Page
router.get("/adminLogin", (req, res) => {
  res.render("adminLogin", { message: req.flash("message") }); // Pass any flash messages to the view
});

// Handle Admin Login
router.post("/adminLogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      // Admin not found
      req.flash("message", "Admin not found"); // Flash error message
      return res.redirect("adminLogin"); // Redirect back to login page
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      // Passwords match, redirect to adminDash
      req.session.admin = admin; // Store admin in session
const orderDetail=await Order.find();



      return res.redirect("/adminDash");
    } else {
      // Incorrect password
      req.flash("message", "Incorrect password"); // Flash error message
      return res.redirect("/admin/adminLogin"); // Redirect back to login page
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
});

// Admin Signup Page
router.get("/adminSignup", (req, res) => {
  res.render("adminSignup");
});
// Add this route in your Express.js code
// Example route handler


router.get('/userManager', async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const perPage = 8;
const searchQuery = req.query.search || '';
const searchRegex = new RegExp(searchQuery, 'i');

const skip = (page - 1) * perPage;

  
    const users = await User.find({ username: searchRegex })
      .skip(skip)
      .limit(perPage);


    const totalUsers = await User.countDocuments({ username: searchRegex });


    const totalPages = Math.ceil(totalUsers / perPage)

    res.render('userManager', { users, page, totalPages, searchQuery });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});
router.get('/manage-banners', bannerController.listBanners);
router.get('/disable-banner/:id', bannerController.disableBanner);
router.get('/add-banner', bannerController.renderAddBannerForm);
router.post('/add-bannerdetail', upload.single('image'), bannerController.addBanner);
router.get('/adminDash', adminController.getAdminDashboard);

// Handle Admin Signup
router.post("/adminSignup", async (req, res) => {
  const { email, password, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin document in the database
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      isAdmin: isAdmin === "on", // Check if isAdmin checkbox is checked
    });

    await newAdmin.save();

    console.log("Admin signup successful");
    res.render("adminLogin", {
      success: "Admin signup successful. You can now login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Signup failed.");
  }
});

// Handle blocking a user
router.post("/blockUser/block/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find the user by userId in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Set the isBlocked property to true to block the user
    user.isBlocked = true;

    // Save the updated user document
    await user.save();

    // Send a success response
    res.json({ message: "User blocked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error blocking user." });
  }
});

// Handle unblocking a user
router.post("/blockUser/unblock/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find the user by userId in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Set the isBlocked property to false to unblock the user
    user.isBlocked = false;

    // Save the updated user document
    await user.save();

    // Send a success response
    res.json({ message: "User unblocked successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error unblocking user." });
  }
});

// Handle Admin Logout
router.get("/logoutAdmin", (req, res) => {
  
    // Clear the session (assuming you are using sessions)
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
  
      // Clear cache by setting appropriate response headers
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
  
      res.redirect("/adminLogin");
    });
  });
  router.get('/create-coupon', adminAuth.isAdminLogged,adminCouponController.renderCreateCouponForm);


  router.post('/coupon', adminAuth.isAdminLogged,adminCouponController.createCoupon);
  router.get('/coupons/:id/edit', adminCouponController.getEditCoupon);
  router.post('/coupons/:id/edit', adminCouponController.postEditCoupon);


  // Delete a coupon
  router.get('/coupon/delete', adminAuth.isAdminLogged,adminCouponController.deleteCoupon);
  router.get('/coupon-list', adminCouponController.renderCouponList);

module.exports = router;

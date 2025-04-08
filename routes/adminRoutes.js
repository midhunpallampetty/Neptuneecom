const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const bannerController = require('../controllers/bannerController');
const orderManagementRoutes = require('./orderManagementRoutes');
const flash = require("connect-flash");
const Admin = require("../models/adminModel"); // Import Admin Model
const adminCouponController = require('../controllers/adminCouponController');
const User = require("../models/userModel"); // Make sure the path is correct
const adminController = require("../controllers/adminController");
const productController = require('../controllers/productController');
const multer = require("multer");
const adminAuth = require('../middleware/adminAuth'); // Example adminAuth middleware file
const Order = require('../models/order');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploading file...");
    cb(null, "public/uploads/"); // Directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Define the file name
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// Configure express-session middleware


router.post(
  "/admin/products",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 }, // Allow up to 5 additional images
  ]),
  adminAuth.isAdminLogged, productController.addProduct
);
// router.put('/edit-product/:productId', adminController.editProduct);
// Display the edit form
router.get("/admin/products", adminAuth.isAdminLogged, productController.listProducts);
router.get("/admin/edit/:productId", adminAuth.isAdminLogged, productController.getEditProduct);
router.get("/delete-product/:productId", adminAuth.isAdminLogged, productController.deleteProduct);
// Handle the form submission
router.get('/adminDashboardDetail', adminAuth.isAdminLogged, adminController.adminDashReport);
// Define a route that handles the form submission with image upload
router.post(
  "/admin/edit/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 }, // Allow up to 5 additional images
  ]),
  productController.postEditProduct
);


// Define a route for deleting a product
router.use("/ordersadmin", orderManagementRoutes);



// Use connect-flash middleware
router.use(flash());

// Render the homepage
router.get("/adminLogin", (req, res) => {
  res.render("adminLogin", { message: req.flash("message") }); // Pass any flash messages to the view
});
router.post("/adminLogin", adminController.adminLogin);
router.post("/adminSignup", adminController.adminSignup);
router.get("/userManager", adminController.getUserManagerPage);
router.get('/manage-banners', bannerController.listBanners);
router.get('/disable-banner/:id', bannerController.disableBanner);
router.get('/add-banner', bannerController.renderAddBannerForm);
router.post('/add-bannerdetail', upload.single('image'), bannerController.addBanner);
router.get('/adminDash', adminController.getAdminDashboard);
router.get('/offer-form', adminController.showOfferForm);
router.get('/category-offer', adminController.showcatOfferForm);
router.post('/product-offer', adminController.createProductOffer);
router.post('/category-offer', adminController.createCategoryOffer);
router.post("/blockUser/block/:userId", adminController.blockUser);
router.post("/blockUser/unblock/:userId", adminController.unblockUser);
router.get('/create-coupon', adminAuth.isAdminLogged, adminCouponController.renderCreateCouponForm);
router.post('/coupon', adminAuth.isAdminLogged, adminCouponController.createCoupon);
router.get('/coupons/:id/edit', adminCouponController.getEditCoupon);
router.post('/coupons/:id/edit', adminCouponController.postEditCoupon);
router.get('/coupon/delete', adminAuth.isAdminLogged, adminCouponController.deleteCoupon);
router.get('/coupon-list', adminCouponController.renderCouponList);

module.exports = router;

const express = require("express");
const User = require("../models/userModel");
const Banner=require('../models/bannerModel');
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const randomstring = require("randomstring");
const session = require("express-session");
const flash = require("connect-flash");
const router = require("../routes/adminRoutes");
const userRoutes = require("../routes/adminRoutes");

const Router = express.Router();
const Product = require("../models/Product");
const saltRounds = 10;
const twilio = require("twilio");
const { log } = require("winston");
const Cart = require("../models/Cart");
const Order = require("../models/order");
const Wishlist = require("../models/Wishlist");
const Category = require("../models/Category");
// Create a Twilio client
const accountSid = "ACa46dba17ac0e44e04353b02210d1c95c";
const authToken = "87cb986fc6a51b1966aea5fadef48bc8";
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = "+12053950807";

// Use connect-flash for flash messages
router.use(flash());



const userController = {
  registerUser: async (req, res) => {
    try {
      const { email, password, otp } = req.body; // Add OTP field to your registration form

      // Check if the user already exists (you can add more validation here)

      // Verify OTP
      const existingUser = await User.findOne({ email });

      if (!existingUser || existingUser.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP or user not found.",
        });
      }

      // Create the user in the database
      const user = await User.create({ email, password });

      // You can add more actions here if needed, e.g., sending a confirmation email

      // Redirect to a success page or do something else
      res.status(200).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Controller
  getProducts: async (req, res) => {
    try {
      const itemsPerPage = 6;
      const page = parseInt(req.query.page) || 1;
      const skipCount = (page - 1) * itemsPerPage;
  
      let filter = {}; // Initialize an empty filter object
  
      if (req.query.search) {
        // If a search query is provided, add it to the filter
        const searchRegex = new RegExp(req.query.search, "i");
        filter.name = { $regex: searchRegex };
      }
  
      if (req.query.categoryId) {
        // If a category ID is provided, add it to the filter
        filter.category = req.query.categoryId;
      }
  
      let sort = {}; // Initialize an empty sort object
  
      if (req.query.sort) {
        // Sort products based on price, ascending or descending
        if (req.query.sort === "lowToHigh") {
          sort.price = 1;
        } else if (req.query.sort === "highToLow") {
          sort.price = -1;
        } else if (req.query.sort === "category") {
          // If sorting by category, include category in the sort object
          sort.category = 1;
        }
      }
  
      const totalProductsCount = await Product.countDocuments(filter); // Count filtered products
  
      let products = [];
      if (Object.keys(filter).length > 0 || Object.keys(sort).length > 0) {
        // If there's a filter or sort, use it in the query
        products = await Product.find(filter)
          .sort(sort)
          .skip(skipCount)
          .limit(itemsPerPage);
      } else {
        // If no filter or sort, retrieve all products
        products = await Product.find({}).skip(skipCount).limit(itemsPerPage);
      }
  
      const categories = await Category.find({ listed: true }); // Retrieve all distinct categories
      const today = new Date();
      const banners = await Banner.find({
        isActive: true,
        startTime: { $lte: today },
        endTime: { $gte: today }
      });
  
      res.render("mainpage", {
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProductsCount / itemsPerPage),
        selectedCategory: req.query.categoryId || "All", // Display selected category or 'All'
        categories,
        banners,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching products.");
    }
  },
  
  renderUserSignup: (req, res) => {
    res.render("userSignup"); // Render the 'userSignup.ejs' view
  },

  handleUserSignup: async (req, res) => {
    try {
      const { email, password, username } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // User with the same email already exists
        const errorMessage =
          "User with this email already exists. Please use a different email.";
        return res.send(`
          <script>
            alert('${errorMessage}');
            window.location.href = '/registration'; // Redirect to the registration page
          </script>
        `);
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create a new user in the database with the hashed password
      const user = await User.create({
        email,
        password: hashedPassword,
        username,
        wallet: 0,
      });

      // You can add more actions here if needed, e.g., sending a confirmation email
      req.session.user = user;
      req.session.userId = user._id;
      const successMessage = "User registered successfully!";
      return res.send(`
        <script>
          alert('${successMessage}');
          window.location.href = '/mainpage'; // Redirect to the desired page
        </script>
      `);
    } catch (error) {
      if (error.code && error.code === 11000) {
        // Handle duplicate key error (E11000)
        const errorMessage =
          "User with this email already exists. Please use a different email.";
        return res.send(`
          <script>
            alert('${errorMessage}');
            window.location.href = '/registration'; // Redirect to the registration page
          </script>
        `);
      }

      console.error(error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  },

  displayProducts: async (req, res) => {
    try {
      const products = await Product.find();

      res.render("mainpage", { products });
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch products.");
    }
  },

  //profile management
  registrationUser:async (req,res)=>{
   try{
    res.render("registration");
   }catch(err){
    console.error(err);
   }
   
  },
  //Profile Management Ends

  blockUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.isBlocked = !user.isBlocked;
      await user.save();

      const message = user.isBlocked
        ? "User blocked successfully."
        : "User unblocked successfully.";
      res.status(200).json({ message });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while blocking/unblocking the user.",
      });
    }
  },

  adminSignup: (req, res) => {
    res.render("adminSignup");
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }

      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      res.redirect("/");
    });
  },

  showProductDetailsWithZoom: async (req, res) => {
    try {
      console.log("=====================");
      const product = await Product.findById(req.params.productId);
      if (!product) {
        // Handle product not found
        res
          .status(404)
          .render("product-not-found", { productId: req.params.productId });
      } else {
        // Render the product details view with image zoom
        res.render("productdetails", { product });
      }
    } catch (error) {
      // Handle errors
      console.error(error);

      // Redirect to main page in case of an error
      res.redirect("/mainpage"); // Update this URL with your main page URL
    }
  },

  //User Profile Controllers
  viewProfile: async (req, res) => {
    try {
      console.log("profile view");

      const userId = req.session.userId;

      // Check if the user is logged in (userId exists in the session)
      if (!userId) {
        res.status(404).render("404"); // Redirect to the 404 error page
        return;
      }

      const user = await User.findById(userId);

      // If the user is not found, display a 404 error page
      if (!user) {
        res.status(404).render("404");
        return;
      }

      res.render("profile", { user, userOrders });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error"); // Handle other errors with a 500 error page
    }
  },

  // Add new user details
  addDetail: async (req, res) => {
    try {
      const { email, FullName, Phone, HouseName, Pincode } = req.body;
      // Create a new detail and add it to the user's profile
      const userId = req.session.userId;
      console.log(req.body, FullName);
      // Use await with findOneAndUpdate
      await User.findByIdAndUpdate(userId, {
        $set: {
          email,
          FullName,
          Phone,
          HouseName,
          Pincode,
        },
      });

      res.redirect("/profile");
    } catch (error) {
      // Handle any errors here
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Update user details
  updateDetail: (req, res) => {
    const username = req.user.username; // Assuming you have user authentication implemented
    const { fieldToUpdate, newValue } = req.body;

    // Implement the logic to update user details here
    userModel.findOneAndUpdate(
      { username, "details.fieldToUpdate": fieldToUpdate },
      { $set: { "details.$.fieldToUpdate": newValue } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error updating user details");
        } else {
          res.redirect("/profile");
        }
      }
    );
  },

  // Delete user details
  deleteDetail: (req, res) => {
    const username = req.user.username; // Assuming you have user authentication implemented
    const { fieldToDelete } = req.body;

    // Implement the logic to delete user details here
    userModel.findOneAndUpdate(
      { username },
      { $pull: { details: { fieldToDelete } } },
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error deleting user details");
        } else {
          res.redirect("/profile");
        }
      }
    );
  },
  displayShoppingPage: async (req, res) => {
    try {
      // Retrieve a list of products from your database
      const products = await Product.find();
      const totalProducts = await Product.countDocuments();

      // Render the shopping page (shopping.ejs) and pass the products data to it
      res.render("shopping", { products, totalProducts });
    } catch (err) {
      // Handle any errors
      res
        .status(500)
        .json({ error: "An error occurred while fetching products." });
    }
  },
};

module.exports = userController;

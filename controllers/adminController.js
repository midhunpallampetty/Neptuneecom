const express = require('express');
const bcrypt = require('bcrypt');
const multer=require('multer');
const session = require('express-session');
const flash = require('connect-flash');
const Admin = require('../models/adminModel'); // Import Admin Model
const User = require('../models/userModel'); // Make sure the path is correct
const Product = require('../models/Product');

const router = express.Router();


  
  // Handle product creation with image upload
 let postAddProduct = async (req, res) => {
    const { name, description, price } = req.body;
    let newPath = req.file.path;
    const image = newPath.replace("public", "")
    console.log(image);
    try {
      const newProduct = new Product({ name, description, price, image });
      const savedProduct = await newProduct.save();
      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(500).json({ error: 'Product creation failed' });
    }
  };



// Configure express-session middleware
router.use(
  session({
    secret: 'your-secret-key', // Change this to a secret key for session encryption
    resave: false,
    saveUninitialized: true,
  })
);
// Create a method for handling the product creation
const addProduct = async (req, res) => {
  try {
    // Extract data from the request (e.g., req.body, req.file)
    const { name, description, price,category } = req.body;
    
    console.log(req.body);
    const newPath = req.file.path;
    const image = newPath.replace("public", "");
    // Create a new Product model
    const newProduct = new Product({ name, description, price, image,category });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Respond with a success alert and redirect
    const successMessage = 'Product added successfully!';
    res.send(`
      <script>
        alert('${successMessage}');
        window.location.href = '/adminDash'; // Redirect to the desired page
      </script>
    `);
  } catch (error) {
    // Handle errors and respond with an error alert
    const errorMessage = 'Product creation failed';
    res.send(`
      <script>
        alert('${errorMessage}');
        window.location.href = '/'; // Redirect to the desired page
      </script>
    `);
  }
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/'); // Store uploads in 'public/uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage });
  

// Use connect-flash middleware
router.use(flash());

// Render the homepage
const renderHomepage = (req, res) => {
  const data = {
    title: 'My Express App',
    message: 'Welcome to my Express app with EJS!',
  };
  res.render('index', data);
};

// Admin Login Page
const renderAdminLoginPage = (req, res) => {
  res.render('adminLogin', { message: req.flash('message') }); // Pass any flash messages to the view
};

// Handle Admin Login
const handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      // Admin not found
      req.flash('message', 'Admin not found'); // Flash error message
      return res.redirect('adminLogin'); // Redirect back to login page
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      // Passwords match, redirect to adminDash
      req.session.admin = admin; // Store admin in session
      return res.redirect('/adminDash');
    } else {
      // Incorrect password
      req.flash('message', 'Incorrect password'); // Flash error message
      return res.redirect('/admin/adminLogin'); // Redirect back to login page
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Login failed.');
  }
};

// Add this route in your Express.js code
// Example route handler
const renderUserManager = async (req, res) => {
  try {
    const users = await User.find(); // Query all users from the database

    res.render('userManager', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user data.');
  }
};
// Controller function for rendering the adminAddProduct page
const renderAdminAddProduct = async (req, res) => {
  try {
    const products = await Product.find();
    // You can include any necessary data fetching or processing here if needed
    res.render('adminAddProduct',{ products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error rendering the adminAddProduct page.');
  }
};

// Render the product creation page
const renderAddProduct = (req, res) => {
  // Render the 'adminAddProduct.ejs' view for adding new products
  res.render('adminAddProduct',{catego});
};
// Handle blocking a user
const blockUser = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    // Find the user by userId in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Set the isBlocked property to true to block the user
    user.isBlocked = true;

    // Save the updated user document
    await user.save();

    // Send a success response
    res.json({ message: 'User blocked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error blocking user.' });
  }
};

// Handle unblocking a user
const unblockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    // Find the user by userId in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Set the isBlocked property to false to unblock the user
    user.isBlocked = false;

    // Save the updated user document
    await user.save();

    // Send a success response
    res.json({ message: 'User unblocked successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unblocking user.' });
  }
};

// Render Admin Signup Page
const renderAdminSignupPage = (req, res) => {
  res.render('adminSignup');
};

// Handle Admin Signup
const handleAdminSignup = async (req, res) => {
  const { email, password, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin document in the database
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      isAdmin: isAdmin === 'on', // Check if isAdmin checkbox is checked
    });

    await newAdmin.save();

    console.log('Admin signup successful');
    res.render('adminLogin', { success: 'Admin signup successful. You can now login.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Signup failed.');
  }
};


const listProducts = async (req, res) => {
  try {
   
    const products = await Product.find().populate('category','description'); 
    // Populate the 'category' field with 'name'
    res.render('adminProductList', { products });
    console.log(products); // Render the view with the products
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product list' });
  }
};


const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price } = req.body;
    const image = req.file.filename;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    
    product.image = image;

    await product.save();

    res.redirect('/adminEditProduct'); // Redirect to the product list page
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the product' });
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.render('adminEditProduct', { product }); // Remove the leading slash
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product for editing' });
  }
};

const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    // Find the product by ID and remove it
    await Product.findByIdAndRemove(productId);

    // Redirect to the product list page or respond with a success message
    res.redirect('/admin/products'); // Replace 'products' with the correct route
  } catch (error) {
    res.status(500).json({ error: 'Product deletion failed' });
  }
};







module.exports = {
  renderHomepage,
  renderAdminLoginPage,
  handleAdminLogin,
  renderAdminSignupPage,
  handleAdminSignup,
  renderUserManager,
  blockUser,
  unblockUser,
  listProducts,
  editProduct,
  updateProduct,
  deleteProduct,
  addProduct,
  
};

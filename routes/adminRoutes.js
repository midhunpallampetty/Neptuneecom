const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');
const Admin = require('../models/adminModel'); // Import Admin Model
const User = require('../models/userModel'); // Make sure the path is correct
const adminController = require('../controllers/adminController');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Define the directory for storing uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Define the file name for the uploaded file
  }
});

const upload = multer({ storage }); // Create the multer upload middleware










// Configure express-session middleware
router.use(
  session({
    secret: 'your-secret-key', // Change this to a secret key for session encryption
    resave: false,
    saveUninitialized: true,
  })
);
router.get('/admin/products', adminController.listProducts);

router.post('/admin/products', upload.single('image'), adminController.addProduct);
router.get('/edit-product/:productId', adminController.editProduct);

router.put('/products/:id', upload.single('image'), adminController.updateProduct);

// Define a route for deleting a product
router.get('/delete-product/:productId', adminController.deleteProduct);



// Use connect-flash middleware
router.use(flash());



// Render the homepage
router.get('/admin', (req, res) => {
  const data = {
    title: 'My Express App',
    message: 'Welcome to my Express app with EJS!',
  };
  res.render('index', data);
});

// Admin Login Page
router.get('/adminLogin', (req, res) => {
  res.render('adminLogin', { message: req.flash('message') }); // Pass any flash messages to the view
});


// Handle Admin Login
router.post('/adminLogin', async (req, res) => {
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
});


// Admin Signup Page
router.get('/adminSignup', (req, res) => {
  res.render('adminSignup');
});
// Add this route in your Express.js code
// Example route handler
router.get('/userManager', async (req, res) => {
  try {
    const users = await User.find(); // Query all users from the database
    console.log(users);
    res.render('userManager', { users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching user data.');
  }
});












// Handle Admin Signup
router.post('/adminSignup', async (req, res) => {
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
});

// Handle blocking a user
router.post('/blockUser/block/:userId', async (req, res) => {
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
});
router.post('/upload', upload.single('file'), (req, res) => {
  // Handle the uploaded file
  
});
// Handle unblocking a user
router.post('/blockUser/unblock/:userId', async (req, res) => {
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
});






// Handle Admin Logout
router.get('/logout', (req, res) => {
  // ... (existing logout code)
});

module.exports = router;

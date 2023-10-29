// userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

const randomstring = require('randomstring');
// const Cart = require('../models/Cart'); // Import your Cart model

const userController = require('../controllers/userController');
const Product = require('../models/Product');



const twilio = require('twilio');

// Create a Twilio client
const accountSid = 'ACa46dba17ac0e44e04353b02210d1c95c';
const authToken = '87cb986fc6a51b1966aea5fadef48bc8';
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = '+17075023738';

// Function to send OTP via Twilio
function sendOTP(phoneNumber, otp) {
    return client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: +17075023738,
        to: phoneNumber
    });
}

// Route for sending OTP
router.post('/send-otp', async (req, res) => {
  const phoneNumber = req.body.phone; // The recipient's phone number
  const otp = generateOTP(); // Implement your OTP generation logic
  req.session.otp = otp;
  try {
    const message = await sendOTP(phoneNumber, otp);
    const successMessage = 'Otp successfully!';
    res.send(`
      <script>
        alert('${successMessage}');
        window.location.href = '/userSignup'; // Redirect to the desired page
      </script>
    `);
    // Respond with a success message
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    const errorMessage = 'Error Sending OTP!';
    res.send(`
      <script>
        alert('${errorMessage}');
        window.location.href = '/userSignup'; // Redirect to the desired page
      </script>
    `);
  }
});




// Function to verify OTP (simplified; adapt as needed)
// A simple OTP verification function
function verifyOTP(storedOTP, enteredOTP) {
  return storedOTP === enteredOTP;
}


// Route for verifying OTP
// Your Express route for user registration with OTP verification
// Route for verifying OTP
// Your Express route for user registration with OTP verification
router.post('/register', async (req, res) => {
  // This code does not check for the existence of a user with the provided email

  // Get the email, phone, or other user details from the request body
  const { email,password } = req.body;

  try {
    // Create a new user record with the provided details
    const newUser = new User({ email,password });

    // Save the new user to the database
    await newUser.save();

    console.log('User registered successfully');
    const successMessage = 'User Registration Success!';
    res.send(`
      <script>
        alert('${successMessage}');
        window.location.href = '/userLogin'; // Redirect to the desired page
      </script>
    `);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});




// Implement your OTP generation logic here
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
}









// Display all products
session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
})

router.get('/mainpage', userController.getProducts);

// router.get('/userprofile', (req, res) => {
//   // Check if the user is authenticated. You might use a middleware for this.
//   if (!req.user) {
//       return res.redirect('/admin/userLogin'); // Redirect to the login page if not authenticated
//   }

//   // Retrieve the user's information from the database using their ID or another unique identifier
//   const userId = req.user.id; // Replace with how you identify users

//   // Assuming you have a User model with properties like 'address', 'gender', and 'phone'
//   User.findById(userId, (err, user) => {
//       if (err) {
//           // Handle any errors, e.g., render an error page
//           return res.render('error', { error: err });
//       }

//       if (!user) {
//           // Handle the case where the user doesn't exist
//           return res.render('error', { error: 'User not found' });
//       }

//       // Render the 'userprofile.ejs' view with the user's information
//       res.render('userprofile',{username:user.username,email:user.email});
//   });
// });
router.post('/verify-otp', (req, res) => {
  const userEnteredOtp = req.body.otp;
  const storedOtp = req.session.otp;
  console.log('Stored OTP:', storedOtp);
  console.log('User Entered OTP:', userEnteredOtp);
  if (userEnteredOtp === storedOtp) {
   

    // OTP verification successful
    res.redirect('/registration'); // Redirect to the registration form
  } else {
    // Invalid OTP
    const errorMessage = 'Invalid OTP!';
    res.send(`
      <script>
        alert('${errorMessage}');
        window.location.href = '/userSignup'; // Redirect to the desired page
      </script>
    `);
  }
});
router.get('/userSignup', userController.renderUserSignup);

// Handle user registration
router.post('/userSignup', userController.handleUserSignup);
// Handle user registration
router.post('/userSignup', async (req, res) => {
  try {
      const { username, email, password } = req.body;
console.log(req.body);
      // Check if the user already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
          // User with the same email already exists
          const errorMessage = 'User With This Email already reggitered!';
          res.send(`
            <script>
              alert('${errorMessage}');
              window.location.href = '/userSignup'; // Redirect to the desired page
            </script>
          `);
      }

      // If the user does not exist, create a new user in the database
      const user = await User.create({ username, email, password });

      // You can add more actions here if needed, e.g., sending a confirmation email
 const successMessage = 'User registered successfully!';
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

// Helper function to generate OTP
// function generateOTP() {
//   return randomstring.generate({
//     length: 6,
//     charset: 'numeric',
//   });
// }

// Render the homepage
router.get('/', (req, res) => {
  const data = {
    title: 'My Express App',
    message: 'Welcome to my Express app with EJS!',
  };
  
  res.render('index', data);
});







   





// // Display user profile page
// router.get('/admin/userprofile', userController.getUserProfile);

// Update user information
// router.post('/user/update', userController.updateUser);

// Delete user
// router.post('/user/delete', userController.deleteUser);


// Inside your route handler for the login route (e.g., /userLogin)
router.get('/userLogin', (req, res) => {
  const error = req.flash('error')[0]; // Get the error message from flash (if any)
  res.render('userLogin', { error }); // Pass the error variable to the template
});

// Handle User Login
router.post('/userLogin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('userLogin', { error: 'User not found' });
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      return res.render('userLogin', { error: 'Your account has been blocked.' });
    }

    // Check if the user has isadmin set to true
    if (user.isadmin) {
      return res.render('userLogin', { error: 'Admins are not allowed to log in' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Store the authenticated user in the session
      req.session.user = user;
     
      console.log(req.session.user)
      let products = await Product.find()
      // Redirect to mainpage with the user data
    
    
      return res.render('mainpage', { user,products });
      
      console.log(products);
    } else {
      return res.render('userLogin', { error: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Login failed.');
  }
});

// Add a new route for blocking/unblocking users
router.post('/blockUser/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle the isBlocked field (block/unblock)
    user.isBlocked = !user.isBlocked;
    await user.save();

    const message = user.isBlocked ? 'User blocked successfully.' : 'User unblocked successfully.';
    res.status(200).json({ message });
  } catch (error) {
    
    res.status(500).json({ error: 'An error occurred while blocking/unblocking the user.' });
  }
});

// Product details route with image zoom
router.get('/admin/product/:productId', async (req, res) => {
  try {
   
    const product = await Product.findById(req.params.productId);
    if (!product) {
      // Handle product not found
      res.status(404).render('product-not-found', { productId: req.params.productId });
    } else {
      // Render the product details view with image zoom
      res.render('/admin/productdetails', { product });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/adminSignup', (req, res) => {
  res.render('adminSignup');
});

// Handle User Logout
router.get('/logout', (req, res) => {
  // Clear the session (assuming you are using sessions)
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }

    // Clear cache by setting appropriate response headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.redirect('/');
  });
});









// User Login Page
router.get('/userLogin', (req, res) => {
  res.render('userLogin');
});

module.exports = router;

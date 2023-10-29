const express=require('express');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const randomstring = require('randomstring');
const session = require('express-session');
const flash = require('connect-flash');
const router = require('../routes/adminRoutes');
const userRoutes = require('../routes/adminRoutes');
const Router=express.Router();
const Product = require('../models/Product');
const saltRounds = 10;
const twilio = require('twilio');

// Create a Twilio client
const accountSid = 'ACa46dba17ac0e44e04353b02210d1c95c';
const authToken = '87cb986fc6a51b1966aea5fadef48bc8';
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = '+17075023738';

// // Function to send OTP via Twilio
// function sendOTP(phoneNumber, otp) {
//     return client.messages.create({
//         body: `Your OTP is: ${otp}`,
//         from: twilioPhoneNumber,
//         to: phoneNumber
//     });
// }

// // Function to verify OTP (simplified; adapt as needed)
// function verifyOTP(otp, userEnteredOtp) {
//     return otp === userEnteredOtp;
// }

// // Implement your OTP generation logic here
// function generateOTP() {


//     // Generate and return a random OTP, e.g., a 6-digit number
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
})



// Use connect-flash for flash messages
router.use(flash());
  
// Retrieve and display products
// exports.
// Route handler for rendering product details view with image zoom

// Render the user registration form


// Handle user registration





const userController = {
  registerUser : async (req, res) => {
    try {
      const { email, password, otp } = req.body; // Add OTP field to your registration form
  
      // Check if the user already exists (you can add more validation here)
  
      // Verify OTP
      const existingUser = await User.findOne({ email });
  
      if (!existingUser || existingUser.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Invalid OTP or user not found.',
        });
      }
  
      // Create the user in the database
      const user = await User.create({ email, password });
  
      // You can add more actions here if needed, e.g., sending a confirmation email
  
      // Redirect to a success page or do something else
      res.status(200).json({
        success: true,
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },













    getProducts: async (req, res) => {
        try {
          const products = await Product.find();
         
         
          res.render('mainpage', { products });
        } catch (error) {
          console.error(error);
          res.status(500).send('Error fetching products.');
        }
      },
      renderUserSignup : (req, res) => {
        res.render('userSignup'); // Render the 'userSignup.ejs' view
      },
     
    
  
      handleUserSignup: async (req, res) => {
        try {
          const { email, password, username } = req.body;
      
          // Check if the user already exists
          const existingUser = await User.findOne({ email });
      
          if (existingUser) {
            // User with the same email already exists
            const errorMessage = 'User With this email already exists Please Check!';
            res.send(`
              <script>
                alert('${errorMessage}');
                window.location.href = '/userSignup'; // Redirect to the desired page
              </script>
            `);
          }
      
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, saltRounds);
      
          // Create a new user in the database with the hashed password
          const user = await User.create({ email, password: hashedPassword, username });
      
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
      },
      
    

   


    displayProducts: async (req, res) => {
        try {
            const products = await Product.find();
          
            res.render('mainpage', { products });
        } catch (err) {
            console.error(err);
            res.status(500).send('Failed to fetch products.');
        }
    },




    // getUserProfile: (req, res) => {
    //   const user = req.session.user; 
    
    //   console.log(user);// Assuming you have the authenticated user in req.user
    //   res.render('userprofile', { user }); // Pass the 'user' object to the view
    //   req.session.user = user; // Set the authenticated user in the session

    // },
  
  // updateUser: (req, res) => {
  //     const userId = req.user.id; // Get the user's ID
  //     const { address, gender, phone } = req.body;
      
  //     // Update the user's information in the database
  //     User.findByIdAndUpdate(userId, { address, gender, phone }, { new: true }, (err, updatedUser) => {
  //       if (err) {
  //         // Handle errors
  //         res.redirect('/userprofile');
  //       } else {
  //         // Redirect to the updated profile page
  //         res.redirect('/userprofile');
  //       }
  //     });
      
  // },
  
  // deleteUser: (req, res) => {
  //     const userId = req.user.id; // Get the user's ID
      
  //     // Delete the user from the database
  //     User.findByIdAndRemove(userId, (err) => {
  //         if (err) {
  //             // Handle errors
  //             res.redirect('/userprofile'); // Redirect back to the profile page
  //         } else {
  //             // Redirect to the registration or login page
  //             res.redirect('userlogin');
  //         }
  //     });
  // },







    blockUser: async (req, res) => {
      try {
        const userId = req.params.userId;
        const user = await User.findById(userId);
  
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
  
        user.isBlocked = !user.isBlocked;
        await user.save();
  
        const message = user.isBlocked
          ? 'User blocked successfully.'
          : 'User unblocked successfully.';
        res.status(200).json({ message });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while blocking/unblocking the user.' });
      }
    },
  
    // renderUserSignup: (req, res) => {
    //   const successMessage = req.flash('successMessage')[0];
    //   res.render('userSignup', { successMessage });
    // },
  
    // userSignup: async (req, res) => {
    //   try {
    //     const { email } = req.body;
   
    //     const existingUser = await User.findOne({ email });
    //     if (existingUser) {
    //       return res.render('userSignup', { error: 'User already exists' });
    //     }
  
    //     // Helper function to generate OTP
    //     function generateOTP() {
    //       return randomstring.generate({
    //         length: 6,
    //         charset: 'numeric',
    //       });
    //     }
  
        // const otp = generateOTP();
        // const otpExpiry = Date.now() + 5 * 60 * 1000;
  
        // const newUser = new User({
        //   email,
        //   otp: otp,
        //   otpExpiry: otpExpiry,
        // });
  
        // Create a transporter object using the default SMTP transport
        // const transporter = nodemailer.createTransport({
        //   service: 'GMAIL',
        //   auth: {
        //     user:'midhunpallampetty@gmail.com',
        //     pass:'xiul ehqf oszv gxaq',
        //   },
        
        // });
  
        // Send OTP email
        // const mailOptions = {
        //   from: 'midhunpallampetty@gmail.com',
        //   to: email,
        //   subject: 'Your OTP for Registration',
        //   text: `Your OTP is: ${otp}`,
        // };
  
        // transporter.sendMail(mailOptions, (error, info) => {
        //   if (error) {
        //     console.error(error);
        //     res.status(500).json({ error: 'Email sending failed.' });
        //   } else {
        //     console.log('Email sent: ' + info.response);
        //     console.log('OTP:', otp); // Add this line to log the OTP
        //     res.status(200).json({ message: 'Email sent successfully.' });
        //   }
        // });
  
    //     await newUser.save();
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).send('Registration failed.');
    //   }
      
    // },



  renderUserLogin: (req, res) => {
    const error = req.flash('error')[0];
    res.render('userLogin', { error });
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.render('userLogin', { error: 'User not found' });
      }

      if (user.isBlocked) {
        return res.render('userLogin', { error: 'Your account has been blocked.' });
      }

      if (user.isadmin) {
        return res.render('userLogin', { error: 'Admins are not allowed to log in' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = user;
        
        return res.render('mainpage', { user });
      } else {
        return res.render('userLogin', { error: 'Incorrect password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Login failed.');
    }
  },

  adminSignup: (req, res) => {
    res.render('adminSignup');
  },

  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.redirect('/');
    });
  },

  showProductDetailsWithZoom: async (req, res) => {
    try {
      console.log("=====================")
      const product = await Product.findById(req.params.productId);
      if (!product) {
        // Handle product not found
        res.status(404).render('product-not-found', { productId: req.params.productId });
      } else {
        // Render the product details view with image zoom
        res.render('productdetails', { product });
      }
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
};





module.exports = userController ;


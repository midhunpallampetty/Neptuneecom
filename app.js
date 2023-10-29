const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const profileRoutes = require('./routes/profileRoutes');
const cartRoutes = require('./routes/cartRoutes');
const twilio = require('twilio');

const User = require('./models/userModel'); // Import User Model
const Admin = require('./models/adminModel'); // Import Admin Model
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userController = require('./controllers/userController');
const cartController = require('./controllers/cartController');
const adminController = require('./controllers/adminController');
const category = require('./models/category');

const app = express();

const port = process.env.PORT || 4000;
const connectionString = 'mongodb+srv://midhunpallampetty:midhun123@cluster0.u7ailcy.mongodb.net/?retryWrites=true&w=majority';
const accountSid = 'ACa46dba17ac0e44e04353b02210d1c95c';
const authToken = '87cb986fc6a51b1966aea5fadef48bc8';

const client = twilio(accountSid, authToken);
const twilioPhoneNumber = '+17075023738';
//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/product/:productId', userController.showProductDetailsWithZoom);
// Parse application/json
app.use(bodyParser.json());


// Setup Mongoose topology
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDb connection Error'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);
// Use the userRoutes
app.use('/user', userRoutes);
// Define routes for rendering views
app.get('/adminDash', (req, res) => {
  res.render('adminDash');
});
app.get('/profile', (req, res) => {
  res.render('profile');
});

// Use your existing product routes
app.use('/user', require('./routes/userRoutes')); 
// app.use('/cart', require('./routes/cartRoutes')); // Use the cart routes you just created


app.use('/category', require('./routes/category'));
// In your adminRoutes.js or app.js
app.get('/adminAddProduct',async (req, res) => {
  
  // Your route handling code here
  const categories = await category.find()
  res.render('adminAddProduct',{categories});
});
app.get('/adminEditProduct', (req, res) => {
  // Your route handling code here
  res.render('adminEditProduct');
});

app.get('/error', (req, res) => {
  res.render('404');
});





app.get('/adminDeleteProduct', (req, res) => {
  // Your route handling code here
  res.render('adminDeleteProduct');
});

// router.get('/edit-product/:id', async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   res.render('adminAddProduct', { product, editMode: true });
// });



// Define routes for rendering views
app.use('/', userRoutes);
app.use('/adminAddProduct', adminRoutes);
app.use('/adminProductList', adminRoutes);
app.use('/adminEditProduct', adminRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.use((req, res, next) => {
  console.log(`Request received for ${req.url}`);
  next();
});
app.use(express.json());
app.use('/admin', adminRoutes);

app.use('/cart',cartRoutes);
app.use('/shop', userRoutes);
// app.use('/mainpage', userRoutes);app.use('/cart', require('./cartRoutes'));
app.get('/adminDash', (req, res) => {
  res.render('adminDash');
});
app.use('/userManager', adminRoutes);
app.use('/adminAddProduct', adminRoutes);
app.use('/userSignup', userRoutes);
app.get('/registration',(req,res)=>{
  res.render('registration')
});




// User Login Page
app.get('/userLogin', userController.renderUserLogin);

// User Signup route
app.get('/userSignup', userController.renderUserSignup);
app.post('/userSignup', userController.handleUserSignup);

app.use('/adminSignup', adminRoutes);
app.get('/adminSignup', adminRoutes);
app.post('/adminSignup', adminRoutes);
app.use('/userLoginOTP', userRoutes);
app.get('/userLoginOTP', userRoutes);
app.post('/userLoginOTP', userRoutes);
app.get('/register', (req, res) => {
  res.render('register', { phoneNumber: req.session.phoneNumber });
});

// Admin Login
app.get('/adminLogin', (req, res) => {
  res.render('adminLogin');
});
app.get('/mainpage', userController.getProducts);


// Block/Unblock User route
app.post('/blockUser/:userId', async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'An error occurred while blocking/unblocking the user.' });
  }
});



// app.get('/products/edit/:id', adminController.editProduct);

// // Route to handle form submission for editing a product
// app.post('/products/edit/:id', adminController.updateProduct);

app.use(adminRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

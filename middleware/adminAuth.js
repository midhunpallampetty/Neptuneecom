// middleware/adminAuth.js

const isAdminLogged = (req, res, next) => {
    // Check if req.session.admin is available
    if (req.session.admin) {
      // If admin session exists, proceed to the next middleware or route handler
      return next();
    }
  
    // If admin session doesn't exist, redirect to the admin login page
    res.redirect('/adminLogin'); // Adjust the route to your admin login page
  };
  // middleware/userAuth.js



  module.exports={isAdminLogged};
  
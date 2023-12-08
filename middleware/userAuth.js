const isUserLogged = (req, res, next) => {
    // Check if req.session.user is available
    if (req.session.user) {
      // If user session exists, proceed to the next middleware or route handler
      return next();
    }
  
    // If user session doesn't exist, redirect to the user login page
    res.redirect('/userLogin'); // Adjust the route to your user login page
  };
  
  module.exports = {
    isUserLogged,
  };
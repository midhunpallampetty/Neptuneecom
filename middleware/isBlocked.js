// Assuming you have a User model defined with a 'isBlocked' field
const User = require("../models/userModel");

// Middleware to check if the user is blocked
const checkBlockedStatus = async (req, res, next) => {
  try {
    // Assume you have stored the user ID in the session or request object
    const userId = req.session.userId; // Adjust this according to your authentication setup

    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      // Handle the case where the user is not found
      return res.redirect('/userLogin');
    }

    // Check if the user is blocked
    if (user.isBlocked) {
      // Redirect to the user login page if blocked
      return res.redirect("/userLogin");
    }

    // Continue processing if the user is not blocked
    next();
  } catch (error) {
    console.error("Error checking user blocked status:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { checkBlockedStatus,
 };

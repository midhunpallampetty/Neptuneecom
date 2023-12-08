const express = require("express");
const User = require("../models/userModel");
const session = require("express-session");
const profileController={


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

      res.render("profile", { user });
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
}
module.exports=profileController;
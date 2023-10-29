// profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Create a new profile for the user
router.post('/profiles', profileController.createProfile);

// Get the user's profile
router.get('/profiles/:userId', profileController.getProfile);

// Add an address to the user's profile
router.post('/profiles/:userId/addresses', profileController.addAddress);

// Add an image to the user's profile
router.post('/profiles/:userId/images', profileController.addImage);

// Add a phone number to the user's profile
router.post('/profiles/:userId/phoneNumbers', profileController.addPhoneNumber);

// Other profile-related routes

module.exports = router;

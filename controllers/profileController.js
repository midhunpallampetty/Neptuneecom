// profileController.js
const Profile = require('../models/profileModel');

// Create a new profile for the user
const createProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = new Profile({ user: userId });
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create a profile' });
  }
};

// Get the user's profile

// GET user profile
const getProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId).exec();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.render('profile', { user });
    } catch (error) {
      res.status(500).json({ error: 'Unable to get the user profile' });
    }
  };

// Add an address to the user's profile
const addAddress = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { address, city, state, postalCode } = req.body;
      const profile = await Profile.findOne({ user: userId }).exec();
      if (profile) {
        profile.addresses.push({ address, city, state, postalCode });
        await profile.save();
        res.redirect(`/api/profiles/${userId}`);
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Unable to add an address' });
    }
  }

// Add an image to the user's profile
const addImage = async (req, res) => {
    try {
      const userId = req.params.userId;
      const { imageUrl } = req.body;
      const profile = await Profile.findOne({ user: userId }).exec();
      if (profile) {
        profile.images.push(imageUrl);
        await profile.save();
        res.redirect(`/api/profiles/${userId}`);
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Unable to add an image' });
    }
  }

// Add a phone number to the user's profile
const addPhoneNumber = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { phoneNumber } = req.body;
    const profile = await Profile.findOne({ user: userId }).exec();
    if (profile) {
      profile.phoneNumbers.push(phoneNumber);
      await profile.save();
      res.json(profile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Unable to add a phone number' });
  }
};

// Other profile-related controller functions

module.exports = {
  createProfile,
  getProfile,
  addAddress,
  addImage,
  addPhoneNumber,
  // Export other profile-related controller functions
};

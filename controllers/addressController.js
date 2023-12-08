// addressController.js

const User = require('../models/userModel');

async function addAdditionalAddress(req, res) {
  const { userId } = req.params; // Assuming you pass the user ID in the request parameters
  const { address, fromPage } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fromPage === 'profile') {
      user.additionalAddresses.push(address);
    } else if (fromPage === 'checkout') {
      user.checkoutAddresses.push(address);
    } else {
      return res.status(400).json({ message: 'Invalid request' });
    }

    await user.save();

    res.status(200).json({ message: 'Address added successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  addAdditionalAddress,
};

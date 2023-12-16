// addressController.js

const User = require("../models/userModel");
async function addAdditionalAddress(req, res) {
  const { userId } = req.session;
  const { Name, House, phone, pincode, fromPage } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure that additionalAddresses is initialized as an array
    if (!user.additionalAddresses) {
      user.additionalAddresses = [];
    }

    if (fromPage === 'profile' || fromPage === 'checkout') {
      const newAddress = {
        Name,
        House,
        phone,
        pincode,
      };

      user.additionalAddresses.push(newAddress);
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

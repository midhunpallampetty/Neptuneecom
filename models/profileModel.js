// profileModel.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
  },
  addresses: [
    {
      address: String,
      city: String,
      state: String,
      postalCode: String,
    },
  ],
  images: [String], // Store image URLs
  phoneNumbers: [String],
  // Add any other fields you need for the user's profile
});

module.exports = mongoose.model('Profile', profileSchema);

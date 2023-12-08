// models/Wishlist.js
const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: String, // You can use user IDs here
  },
  items: [wishlistItemSchema],
});

module.exports = mongoose.model('Wishlist', wishlistSchema);

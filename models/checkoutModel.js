const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
      },
      quantity: Number,
    },
  ],
  address: {
    home: {
      Phone: Number,
      FullName: String,
      HouseName: String,
      // Add other home address-related fields
    },
    work: {
      Phone: Number,
      FullName: String,
      Company: String,
      // Add other work address-related fields
    },
  },
  totalPrice: Number,
  paymentMethod: String, // For cash-on-delivery option
  orderDate: Date,
});

module.exports = mongoose.model('Checkout', checkoutSchema);

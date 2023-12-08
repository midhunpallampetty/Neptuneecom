const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  House: { type: String, required: true },
  email: { type: String, required: true },
  phone:{ type: Number, required: true },
  pincode:{ type: Number, required: true },
  // Add other address fields as needed
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  isBlocked: { type: Boolean, default: false },
  FullName: String,
  wallet: { type: Number },
  Image: String,
  Phone: Number,
  HouseName: String,
  Pincode: String,
  CustName: String,
  PhoneNum: Number,
  companyName: String,
  Zipcode: String,
  couponsApplied: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    }
  ],
  additionalAddresses: [addressSchema],
});

const User = mongoose.model('User', userSchema);

module.exports = User;

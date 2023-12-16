const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  Name: { type: String, },
  House: { type: String,  },
 
  phone:{ type: Number, },
  pincode:{ type: Number, },
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
  referralLink: { type: String, unique: true },
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

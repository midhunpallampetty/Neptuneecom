const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, default: 'admin' }, // Set the default value to 'admin'
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

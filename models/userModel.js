const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }, // Set the default value to 'user'
    isBlocked: { type: Boolean, default: false },
    address: String,
    gender: String,
    phone: String, // The phone field to store the user's phone number
   
});

const User = mongoose.model('User', userSchema);

module.exports = User;

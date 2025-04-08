// controllers/otpController.js

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// In-memory store for OTP and timestamp (will reset on server restart, which is fine for dev)
let otpStore = {
  otp: null,
  generatedAt: null,
};

// Function to send OTP
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore = {
    otp,
    generatedAt: Date.now(), // store timestamp in ms
  };

  try {
    await transporter.sendMail({
      from: '"Neptune Music" <midhunpallampetty@gmail.com>',
      to: email,
      subject: "Your OTP to Register User",
      text: `
      Hello,
      
      Your OTP code for Neptune Music is: ${otp}
      This OTP is valid for only 1 minute.
      
      If you did not request this, please ignore this email.
      
      Thank you,
      Neptune Music Team
      `
      
    });

    console.log(`OTP ${otp} sent to ${email}`);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ message: "Failed to send OTP email." });
  }
};

// Function to verify OTP
const verifyOtp = (req, res) => {
  const { otp } = req.body;

  console.log("User entered OTP:", otp);

  const currentTime = Date.now();
  const otpAge = (currentTime - otpStore.generatedAt) / 1000; // in seconds

  if (!otp || otp.length !== 6 || isNaN(otp)) {
    return res.status(400).json({ message: "Invalid OTP format." });
  }

  if (!otpStore.otp) {
    return res.status(400).json({ message: "OTP not found. Please request a new one." });
  }

  if (otpAge > 60) {
    otpStore = { otp: null, generatedAt: null }; // reset
    return res.status(400).json({ message: "OTP expired. Please request a new one." });
  }

  if (otp === otpStore.otp) {
    otpStore = { otp: null, generatedAt: null }; // reset after success
    return res.status(200).json({ message: "OTP verified successfully." });
  } else {
    return res.status(400).json({ message: "Incorrect OTP." });
  }
};

// Register controller
const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      wallet: 0,
    });

    await newUser.save();

    req.session.user = newUser;
    req.session.userId = newUser._id;

    return res.status(200).json({ message: "User registered and logged in successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Error registering user" });
  }
};

module.exports = { sendOtp, verifyOtp, registerUser };

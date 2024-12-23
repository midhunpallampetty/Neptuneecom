// controllers/otpController.js

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel"); // Replace with the correct path to your User model
// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: "midhunpallampetty@gmail.com", // Replace with your email
    pass: "acjr jvev anap xhag", // Replace with your email app password
  },
});
let checkOtp=0;
// Function to send OTP via email
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  checkOtp=otp;
  try {
    // Send OTP via email
    await transporter.sendMail({
      from: '"Your App Name" <your-email@gmail.com>', // Sender address
      to: email, // Recipient email
      subject: "Your OTP Code", // Subject line
      text: `Your OTP code is ${otp}. It is valid for 10 minutes.`, // Plain text body
    });

    console.log(`OTP ${otp} sent to ${email}`);

    res.status(200).json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({ message: "Failed to send OTP email." });
  }
};

// Function to verify OTP
const verifyOtp = async (req, res) => {
  const { otp } = req.body;
console.log('user typed',otp);

  if (!otp || otp.length !== 6 || isNaN(otp)) {
    return res.status(400).json({ message: "Invalid OTP." });
  }

  // Simulate OTP verification logic
  const isValid = otp === checkOtp; // Replace with your verification logic

  if (isValid) {
    res.status(200).json({ message: "OTP verified successfully." });
  } else {
    res.status(400).json({ message: "Incorrect OTP." });
  }
};


// Controller to handle user registration
const registerUser = async (req, res) => {
    const { email, password, username } = req.body;
  
    try {
      // Check if required fields are provided
      if (!email || !password || !username) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use." });
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create a new user instance with the hashed password
      const newUser = new User({ 
        email, 
        password: hashedPassword, 
        username, 
        wallet: 0 
      });
  
      // Save the user to the database
      await newUser.save();
  
      console.log("User registered successfully");
      const successMessage = "User Registration Success!";
  
      // Respond with a script for a client-side redirect
      res.send(`
        <script>
          alert('${successMessage}');
          window.location.href = '/userLogin'; // Redirect to the desired page
        </script>
      `);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Error registering user" });
    }
  };


module.exports = { sendOtp, verifyOtp,registerUser };

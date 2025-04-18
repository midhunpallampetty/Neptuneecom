const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const flash = require("connect-flash");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Product = require("../models/Product");
const Order = require("../models/order");
const router = express.Router();
const Category = require("../models/Category");
const { default: mongoose } = require("mongoose");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.use(flash());

// Render the homepage
const renderHomepage = (req, res) => {
  const data = {
    title: "My Express App",
    message: "Welcome to my Express app with EJS!",
  };
  res.render("index", data);
};

// Admin Login Page
const renderAdminLoginPage = (req, res) => {
  res.render("adminLogin", { message: req.flash("message") }); // Pass any flash messages to the view
};

// Handle Admin Login
const handleAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      req.flash("message", "Admin not found");
      return res.redirect("/adminLogin");
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      req.session.admin = admin;
      return res.redirect("/adminDash");
    } else {
      // Incorrect password
      req.flash("message", "Incorrect password");
      return res.redirect("/admin/adminLogin");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Login failed.");
  }
};

const renderUserManager = async (req, res) => {
  try {
    const users = await User.find();

    res.render("userManager", { users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching user data.");
  }
};

const blockUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked successfully." });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ message: "Error blocking user." });
  }
};
const unblockUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked successfully." });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ message: "Error unblocking user." });
  }
};

const renderAdminSignupPage = (req, res) => {
  res.render("adminSignup");
};
const adminDashReport = async (req, res) => {
  const orderDetail = await Order.find();
  console.log(orderDetail);
  res.render("adminDash", { orderDetail });
};

const handleAdminSignup = async (req, res) => {
  const { email, password, isAdmin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      isAdmin: isAdmin === "on",
    });

    await newAdmin.save();

    console.log("Admin signup successful");
    res.render("adminLogin", {
      success: "Admin signup successful. You can now login.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Signup failed.");
  }
};
const getAdminDashboard = async (req, res) => {
  if (!req.session.admin) {
    res.status(404).render("adminError");
  } else {
    const Products = await Product.find();

    const Orders = await Order.find();
    const deliveredOrders = await Order.find({ status: "delivered" });
    const aggregationResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } },
    ]);
    function countOrdersForDay(orders) {
      const dayCounts = {
        0: 0, // Sunday
        1: 0, // Monday
        2: 0, // Tuesday
        3: 0, // Wednesday
        4: 0, // Thursday
        5: 0, // Friday
        6: 0, // Saturday
      };

      orders.forEach((order) => {
        const orderDate = new Date(order.orderDate);
        const dayOfWeek = orderDate.getDay();
        dayCounts[dayOfWeek]++;
      });

      return dayCounts;
    }

    // Example usage to get counts for each day
    function countOrdersForMonths(orders) {
      const monthCounts = {
        0: 0, // January
        1: 0, // February
        2: 0, // March
        3: 0, // April
        4: 0, // May
        5: 0, // June
        6: 0, // July
        7: 0, // August
        8: 0, // September
        9: 0, // October
        10: 0, // November
        11: 0, // December
      };
      // Function to generate the PDF report

      orders.forEach((order) => {
        const orderDate = new Date(order.orderDate);
        const month = orderDate.getMonth();
        monthCounts[month]++;
      });

      return monthCounts;
    }

    // Example usage to get the count of orders for each month
    const ordersCountForMonths = countOrdersForMonths(Orders);

    // Log the count of orders for each month (replace this with your actual code to display or use the counts)
    console.log("Orders count per month:", ordersCountForMonths);
    const canceledOrdersCount = await Order.countDocuments({
      status: "canceled",
    });
    const deliveredOrdersCount = await Order.countDocuments({
      status: "delivered",
    });
    const pendingOrdersCount = await Order.countDocuments({
      status: "Pending",
    });

    console.log("Total number of canceled orders:", canceledOrdersCount);

    function countOrdersForYears(orders, ...years) {
      const yearCounts = Object.fromEntries(years.map((year) => [year, 0]));

      orders.forEach((order) => {
        const orderDate = new Date(order.orderDate);
        const year = orderDate.getFullYear();

        if (years.includes(year)) {
          yearCounts[year]++;
        }
      });

      // Convert the yearCounts object to an array
      const resultArray = years.map((year) => yearCounts[year]);

      return resultArray;
    }

    // Example usage to get the count of orders for each specific year as an array
    const ordersCountForYears = countOrdersForYears(
      Orders,
      2016,
      2017,
      2018,
      2019,
      2020,
      2022,
      2023
    );

    console.log("Orders count for each year (as array):", ordersCountForYears);

    // Example usage to get counts for each day
    const ordersCountForDays = countOrdersForDay(Orders);
    console.log("Orders count for each day of the week:", ordersCountForDays);

    const returnOrders = await Order.countDocuments({ returned: true });
    const categoryCount = await Category.countDocuments();
    console.log("categoryCount", categoryCount);
    const totalPriceOfDeliveredOrders =
      aggregationResult.length > 0 ? aggregationResult[0].totalPrice : 0;

    // Log the count of orders for each month (replace this with your actual code to display or use the counts)
    console.log("Orders count per month:", ordersCountForMonths);

    const razorpayOrderCount = await Order.countDocuments({
      paymentMethod: "razorpay",
    });

    const refundedOrders = await Order.find({ status: "refunded" });

    const totalRefundedPrice = refundedOrders.reduce(
      (total, order) => total + order.totalPrice,
      0
    );
    const canceledOrderCount = await Order.countDocuments({ canceled: true });
    console.log(`Total Price of Refunded Orders: ${canceledOrderCount}`);
    res.render("adminDash", {
      Orders,
      Products,
      totalPriceOfDeliveredOrders,
      returnOrders,
      ordersCountForDays,
      ordersCountForMonths,
      ordersCountForYears,
      canceledOrdersCount,
      deliveredOrdersCount,
      pendingOrdersCount,
      categoryCount,
      razorpayOrderCount,
      totalRefundedPrice,
      canceledOrderCount,
    });
  }
};

const showOfferForm = async (req, res) => {
  // Render the offer creation form page (offerForm.ejs)
  const products = await Product.find();
  console.log(products, "sdghcfvshgcvdsvcd");
  res.render("offerForm", { products });
};
const showcatOfferForm = async (req, res) => {
  // Render the offer creation form page (offerForm.ejs)
  const categories = await Category.find();

  res.render("catOffer", { categories });
};

const createProductOffer = async (req, res) => {
  const { discount, productId } = req.body;

  try {
    // Validate the discount percentage
    const parsedDiscount = parseFloat(discount);
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ error: "Discount percentage must be between 0 and 100" });
    }

    // Find the product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ error: "Product not found" });
    }

    // Update or save the offer details in the product model
    product.offer = {
      discountPercentage: parsedDiscount,
      // Add more offer details as needed
    };

    // Save the updated product
    await product.save();
    console.log("Success");
    res.status(200).json({ message: "Product offer created successfully" });
  } catch (error) {
    console.error("Error creating product offer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const createCategoryOffer = async (req, res) => {

  try {
    // Extract offer details from the request body
    const { categoryId, discountPercentage } = req.body;

    const products = await Product.updateMany(
      { category: new mongoose.Types.ObjectId(categoryId) },
      {
        $set: {
          "offer.discountPercentage": discountPercentage,
        },
      }
    );
    const errormsg='Successfully Updated Offer!';
    return res.send(`
      <script>
        alert('${errormsg}');
        window.location.href = '/category-offer'; // Redirect to the registration page
      </script>
    `);
  } catch (error) {
    console.error("Error creating category offer:", error);
    const errormsg2='Error';
    return res.send(`
      <script>
        alert('${errormsg2}');
        window.location.href = '/category-offer'; // Redirect to the registration page
      </script>
    `);
  }
};
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      req.flash("message", "Admin not found");
      return res.redirect("/admin/adminLogin");
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (passwordMatch) {
      req.session.admin = admin;
      const orderDetail = await Order.find(); // If you're using it, otherwise remove it

      return res.redirect("/adminDash");
    } else {
      req.flash("message", "Incorrect password");
      return res.redirect("/admin/adminLogin");
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).send("Login failed.");
  }
};
const getUserManagerPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 8;
    const searchQuery = req.query.search || '';
    const searchRegex = new RegExp(searchQuery, 'i');
    const skip = (page - 1) * perPage;

    const users = await User.find({ username: searchRegex })
      .skip(skip)
      .limit(perPage);

    const totalUsers = await User.countDocuments({ username: searchRegex });
    const totalPages = Math.ceil(totalUsers / perPage);

    res.render("userManager", {
      users,
      page,
      totalPages,
      searchQuery
    });
  } catch (error) {
    console.error("Error in user manager route:", error);
    res.status(500).send("An error occurred");
  }
};
const adminSignup = async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
      isAdmin: isAdmin === "on",
    });

    await newAdmin.save();

    console.log("Admin signup successful");
    res.render("adminLogin", {
      success: "Admin signup successful. You can now login.",
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).send("Signup failed.");
  }
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = {
  getAdminDashboard,
  renderHomepage,
  renderAdminLoginPage,
  handleAdminLogin,
  renderAdminSignupPage,
  handleAdminSignup,
  renderUserManager,
  getUserManagerPage,
  blockUser,
  unblockUser,
  adminSignup,
  adminLogin,
  adminDashReport,
  showOfferForm,
  createCategoryOffer,
  createProductOffer,
  showcatOfferForm,
};

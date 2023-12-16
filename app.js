const express = require("express");
const nocache = require("nocache");
const adminAuth = require("./middleware/adminAuth"); // Example adminAuth middleware file
const salesReportRoutes = require("./routes/salesReportRoutes");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const orderManagementRoutes = require("./routes/orderManagementRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userController = require("./controllers/userController");
const Category = require("./models/Category");
const Order = require("./models/order");
const Product = require("./models/Product");

require("dotenv").config();


const { v4: uuidv4 } = require("uuid");

const app = express();

app.use("/user", require("./routes/userRoutes"));
app.use(nocache());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 20,
    },
  })
);

// Handle Razorpay webhook
app.post("/razorpay-webhook", (req, res) => {
  const body = req.body;
  // const orderId = body.payload.order.entity.id;
  // const paymentId = body.payload.payment.entity.id;

  // Update your order status and handle the payment
  // ...

  res.json({ received: true });
});


app.use("/orders", orderManagementRoutes);
const port = process.env.PORT || 4000;
const connectionString = process.env.MONGOCONNECTIONSTRING;
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/product/:productId", userController.showProductDetailsWithZoom);
app.use(bodyParser.json());
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDb connection Error"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/user", userRoutes);


app.use("/category", require("./routes/category"));

app.get("/adminAddProduct", async (req, res) => {
  const categories = await Category.find();
  res.render("adminAddProduct", { categories });
});
app.get("/adminEditProduct", (req, res) => {
  // Your route handling code here
  res.render("adminEditProduct");
});
app.get("/adminError", (req, res) => {
  res.render("adminError");
});
app.get("/adminDeleteProduct", (req, res) => {
  res.render("adminDeleteProduct");
});
app.use("/sales-report", salesReportRoutes);

app.use("/", userRoutes);

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

app.use((req, res, next) => {  console.log(`Request received for ${req.url}`); next(); });

app.use(express.json());

app.use("/wishlist", userRoutes);
app.use("/userSignup", userRoutes);

app.use("/admin", adminRoutes);
app.get("/adminSignup", adminRoutes);
app.post("/adminSignup", adminRoutes);
app.use("/userManager", adminRoutes);
app.use("/adminAddProduct", adminRoutes);
app.use("/adminSignup", adminRoutes);

app.get("/registration", (req, res) => { res.render("registration");
});

app.get("/userSignup", userController.renderUserSignup);
app.post("/userSignup", userController.handleUserSignup);

app.get("/mainpage", userController.getProducts);

app.use(adminRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

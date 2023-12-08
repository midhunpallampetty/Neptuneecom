const User = require("../models/userModel");
const Product = require("../models/Product");
const Order = require("../models/order"); // Create an Order model if you haven't already
const uuid = require("uuid");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
// Generate a new UUID
require("dotenv").config();

const orderManagementRoutes = require("../routes/orderManagementRoutes");
// Assuming you have a model named Order and a view named adminOrders

 // Number of orders to display per page

exports.adminOrders = async (req, res) => {
  const ITEMS_PER_PAGE = 10;
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from the request query parameters

    const totalOrders = await Order.countDocuments(); // Count total number of orders

    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

    const orders = await Order.find()
      .populate("user product")
      .skip((page - 1) * ITEMS_PER_PAGE) // Skip records based on the page number
      .limit(ITEMS_PER_PAGE); // Limit the number of records per page

    res.render("adminOrders", { orders, currentPage: page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
};

// controllers/orderManagementController.js

exports.userOrders = async (req, res) => {
  try {
    const perPage = 10; // Number of orders to display per page
    const page = parseInt(req.query.page) || 1; // Get the page number from the request query parameters
    const sortBy = req.query.sortBy || 'latest'; // Default sorting by latest orderDate
    const statusFilter = req.query.status || 'all'; // Default to show all orders

    // Create a sorting object based on the selected sorting option
    const sortOptions = {};
    if (sortBy === 'oldest') {
      sortOptions.orderDate = 1; // Ascending orderDate
    } else {
      sortOptions.orderDate = -1; // Descending orderDate (latest first) - default
    }

    // Create a filter object based on the selected status option
    const filterOptions = {};
    if (statusFilter !== 'all') {
      filterOptions.status = statusFilter;
    }

    // Calculate the skip value based on the page number and items per page
    const skip = (page - 1) * perPage;

    // Fetch user-specific orders from the database with pagination, sorting, and filtering
    const userOrders = await Order.find({
      user: req.session.user._id,
      ...filterOptions, // Apply status filter
    })
      .populate('product user')
      .sort(sortOptions) // Apply sorting
      .skip(skip)
      .limit(perPage);

    // Count total number of orders for pagination information
    const totalOrders = await Order.countDocuments({
      user: req.session.user._id,
      ...filterOptions, // Apply status filter
    });

    res.render('userOrders', {
      userOrders,
      currentPage: page,
      pages: Math.ceil(totalOrders / perPage),
      sortBy,
      statusFilter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching user orders' });
  }
};



exports.updateOrderStatus = async (req, res) => {
  const { newStatus,order } = req.body;

  try {
    
    const isValidObjectId = mongoose.Types.ObjectId.isValid(order);
    if (!isValidObjectId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid orderNo" });
    }

  const data = await Order.findByIdAndUpdate(order, { status: newStatus });
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

exports.requestCancellation = async (req, res) => {
  const orderNo = req.query.orderNo;
  
  try {
    const order = await Order.findById(orderNo);
    const product = order.product;
console.log(product,'fvdfhyvcbefjuvbrebvhre');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order has already been canceled
    if (order.canceled) {
      return res
        .status(400)
        .json({ message: "Order has already been canceled" });
    }

    // Check if the order status is not 'delivered'
    if (order.status !== "delivered") {
      // Update the order status to 'canceled' and set the cancellation date
      const cancellationDate = new Date();
      await increaseProductStockCancel(product);

      const updatedOrder = await Order.findByIdAndUpdate(
        orderNo,
        {
          status: "canceled",
          cancellationDate: cancellationDate,
          canceled: true,
        },
        { new: true }
      );
      const userId = updatedOrder.user;
     
      // Check if payment method is 'razorpay' before refunding money to the wallet
      if (updatedOrder.paymentMethod === "razorpay") {
        // Return totalPrice to user's wallet

        const user = await User.findById(userId);
        if (!user.wallet) {
          // If 'wallet' field doesn't exist, create it
          user.wallet = 0;
        }
        console.log('yyyyyyyyyyyyyehbcxjju')
        user.wallet += updatedOrder.totalPrice;
        await user.save();
      }else if (updatedOrder.paymentMethod === "cod") {
        // Return totalPrice to user's wallet

        const user = await User.findById(userId);
        if (!user.wallet) {
          // If 'wallet' field doesn't exist, create it
          user.wallet = 0;
        }
        console.log('yyyyyyyyyyyyyehbcxjju')
        user.wallet += updatedOrder.totalPrice;
        await user.save();
      }

      res.json({ message: "Order canceled successfully", order: updatedOrder });
    } else {
      res
        .status(400)
        .json({
          message: "Order cannot be canceled because it is already delivered",
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to submit cancellation request");
  }
};
async function increaseProductStockCancel(products) {
  try {
    for (const data of products) {
      const product = data.product._id; // Extract product ID
      const quantity = data.quantity;

      // Update the stock for the product
      await Product.findByIdAndUpdate(data.product, { $inc: { stock: quantity } });
    }
  } catch (error) {
    console.error("Error increasing stock during cancellation:", error);
    // Handle the error as needed
  }
}

exports.requestReturn = async (req, res) => {
  const orderNo = req.query.orderNo;

  try {
    const returnRequestDate = new Date();
    const order = await Order.findByIdAndUpdate(
      orderNo,
      {
        returned: true,
        returnRequestDate: returnRequestDate,
      },
      { new: true }
    );

    res.json({ message: "Return request submitted successfully", order });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to submit return request");
  }
};

exports.getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.session.user; // Assuming you have user authentication implemented
    const userOrderHistory = await Order.find({ user: userId }).populate(
      "Product"
    );
    res.render("userOrderHistory", { userOrderHistory });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { FullName, email, Phone, Pincode } = req.session.user;
    const selectedAddressSet = req.body.selectedAddressSet;
    console.log(selectedAddressSet, 'we need this ');
    let user = req.session.user;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      user = existingUser;
    } else {
      user = new User({ FullName, email, Phone, Pincode });
      await user.save();
    }

    const product = req.session.cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));
    const discount=req.session.discountAmount||0;
    const totalPrice = req.session.totalPriceAfterCoupon !== null
    ? req.session.totalPriceAfterCoupon
    : req.session.totalPrice;
  
  // Now you can use the totalPrice in your code as needed
  console.log('Total Price:', totalPrice);
    const paymentMethod = req.body.paymentMethod;
    const generatedUUID = uuid.v4();
    const orderId = `NTN${generatedUUID}`;

    let status;
    let razorpayOrder; // Declare razorpayOrder outside the if block

    if (paymentMethod === 'cod') {
      // For COD orders
      status = 'Pending';
      // Reduce stock for COD orders
      await reduceProductStock(product);
    } else if (paymentMethod === 'razorpay') {
      const razorpay = new Razorpay({
        key_id: process.env.KEYID_PAY,
        key_secret: process.env.KEY_NOTHING,
      });

      const razorpayOptions = {
        amount: totalPrice * 100,
        currency: 'INR',
        receipt: orderId,
      };

      razorpayOrder = await razorpay.orders.create(razorpayOptions);

      // Reduce stock for Razorpay orders
      await reduceProductStock(product);

      status = 'Pending';
    }

    // Set Addresschoose based on selectedAddressSet
    let Addresschoose;
    if (selectedAddressSet === 'addressSet2') {
      Addresschoose = 'addressSet2';
    } else if (selectedAddressSet === 'addressSet1') {
      Addresschoose = 'addressSet1';
    } else {
      Addresschoose = null;
    }

    const order = new Order({
      user,
      product: product,
      totalPrice,
      status,
      paymentMethod,
      orderId,
      Addresschoose,
      discount,
    });

    await order.save();
    req.session.discountAmount=false;
    req.session.totalPriceAfterCoupon=false;
    if (paymentMethod === 'razorpay') {
      return res.json({
        razorpayOrder,
        paymentMethod: 'razorpay',
        orderId,
        status,
      });
    }

    res.status(201).json({ message: 'Order placed successfully', orderId: orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error placing order' });
  }
};

// Helper function to reduce product stock
// Helper function to reduce product stock
async function reduceProductStock(products) {
  try {
    for (const data of products) {
      await Product.findByIdAndUpdate(data.product,{$inc:{stock:-data.quantity}})
    }
  } catch (error) {
    console.error("Error reducing stock:", error);
    // Handle the error as needed
  }
}

// Add a new function to handle Razorpay success and update the 'paid' field
exports.handleRazorpaySuccess = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id } = req.body;
    const orderId = req.body;
    console.log(orderId, "testgv dbhcjnecfkrefrbevcbehjnrcrgyeh");

    if (!razorpay_payment_id || !razorpay_order_id) {
      return res
        .status(400)
        .json({ error: "Invalid Razorpay payment ID or order ID" });
    }

    const order = await Order.findOne({ orderId: orderId.orderId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the 'paid' field and add 'paymentId'
    order.paid = true;
    order.paymentId = razorpay_payment_id;

    // Save the updated order
    await order.save();

    res.json({
      message: "Payment successful. Order marked as paid.",
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error handling Razorpay success" });
  }
};

// Update the status of the order after Razorpay payment success
// controllers/ordersController.js

exports.returnOrdersPage = async (req, res) => {
  try {
    // Retrieve orders with return status set to true and exclude 'refunded' orders
    const returnOrders = await Order.find({
      returned: true,
      status: { $ne: "refunded" },
    });
    console.log(returnOrders, "magiccccccccccccccccccccccc");

    res.render("returnorder", { returnOrders });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
// paysuccessController.js
exports.paysuccessController = async (req, res) => {
  try {
    // Assuming order details are stored in req.session.orderDetails
    const orderId = req.query.orderNo; // Using query parameter



const orderDetail= await Order.findOne({orderId});

const productid = await Order.aggregate([
  { $match: { orderId: orderId } },
  { $unwind: "$product"}
 
  // Other aggregation stages, if any
]);
const pro = await Order.findOne({orderId})
console.log(pro,pro.product[0].quantity,"quantityquantityquantityquantityquantityquantityquantity");
const product = await Order.findOne({orderId})
// console.log(product.product[0]._id,"=====================");
const proArray = await Promise.all(product.product.map(async(item)=>{
  return await Product.findById(item.product)
}))

console.log(proArray,"========================++");


totalPriceAfterCoupon=req.session.totalPriceAfterCoupon;
console.log(totalPriceAfterCoupon,'grfybyfeuvubrfyugruybruybrygvbrgytvry');
const userid=orderDetail.user;
const user=await User.findById(userid)
// console.log(productid,'WERFVBNM<FGHJ')
    // Render the paysuccess template with order details
    await res.render('paysuccess', { orderDetail:orderDetail,user,proArray,pro});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error rendering paysuccess page" });
  }
};



exports.approveRefund = async (req, res) => {
  const orderId = req.query.orderNo; // Using query parameter

  try {
    // Retrieve the order by ID
    const order = await Order.findById(orderId);

    console.log(orderId, "ffffffffffffffffff");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });   
    }

    // Update the order status to 'refunded' and set refund date
    const refundDate = new Date();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: "refunded", refundDate: refundDate },
      { new: true }
    );

    // Update the refund approval date
    const refundApprovalDate = new Date();
    updatedOrder.refundApprovalDate = refundApprovalDate;

    await updatedOrder.save();

    const userId = order.user; // Assuming userId is stored in the order
    const product = order.product;

console.log('haiiiiiiii',product);
    // Return total price to user's wallet
    const user = await User.findById(userId);
   

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await increaseProductStock(product);
    user.wallet += updatedOrder.totalPrice;
    await user.save();

    res.status(200).json({ message: "Refund approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
async function increaseProductStock(products) {
  try {
    console.log(products, 'dwubcfi eufbiuerfuerhfyheyge');
    for (const data of products) {
      console.log('lvyyyyyyyyyyyyyyyyyyyyyyyy',data);
      await Product.findByIdAndUpdate(data.product, { $inc: { stock: data.quantity } });
    }
  } catch (error) {
    console.error("Error increasing stock:", error);
    // Handle the error as needed
  }
}


function generateOrderId() {
  // Implement a function to generate a unique order ID
  // You can use a library like 'uuid' for this purpose
}

// Implement more controller methods as needed

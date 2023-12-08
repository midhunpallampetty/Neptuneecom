const mongoose = require('mongoose');
const productItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  mainImage: {
    type: String, // Assuming it stores the image URL
  },
});




const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  product: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String, // e.g., 'Razorpay' or 'COD'
    required: true,
  },
  status: {
    type: String, // 'pending', 'approved', 'shipped', 'delivered', 'canceled', 'returned'
    default:'pending',
  },
  canceled: {
    type: Boolean,
    default: false,
  },
  returned: {
    type: Boolean,
    default: false,
  },
  discount:{
    type:Number,
    default:false,
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  refundDate: {
    type: Date,
    default: Date.now(),
  },
returnRequestDate: {
  type: Date,
  default: Date.now(),
},

Addresschoose:String,

  paid:{
    type:Boolean,
    default:false,

  },
  orderId:{
    type:String,
  },
  cancellationDate: { type: Date },
  paymentId:String,
  
  paymentId:{
    type:String,
    default:'',
  },
  
  // Add more fields as needed
});

module.exports = mongoose.model('Order', orderSchema);

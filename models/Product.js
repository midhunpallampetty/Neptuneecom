const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  brand:String,
  material:String,
  weight:Number,
  color:String,
  listprice:Number,
  stock:Number,
  createdAt: { type: Date, default: Date.now },
  mainImage: String, // The main image URL
  additionalImages: [String], // Array of additional image URLs
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
  },
});

module.exports = mongoose.model('Product', productSchema);

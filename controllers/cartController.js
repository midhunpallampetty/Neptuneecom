const express = require("express");
const app = express();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/userModel");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

const cartController = {
  addToCart: async (req, res) => {
    try {
      let { productId } = req.body;
      // const { user } = req.body;
      let user = req.session.user;
      // You should provide the user ID in the request
      console.log(user);
      // Find the user's cart or create one if it doesn't exist
      let cart = await Cart.findOne({ user });

      // Find the product
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (!cart) {
        cart = new Cart({ user });
      }

      // Check if the product is already in the cart
      const cartItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cart.items.push({ product: productId });
      }

      await cart.save();
      res.status(201).json({ message: "Product added to the cart" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  incrementCartItem: async (req, res) => {
    try {
        const productId = req.query.productId;
        const user = req.session.userId; // Provide the user ID in the request
        console.log(productId, user, "haiiiiiiiiiiiiiiiiooooooooooooo");

        // Find the user's cart
        const cart = await Cart.findOne({ user });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Check if the product is already in the cart
        const cartItem = cart.items.find((item) => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in the cart" });
        }

        // Increment the quantity by 1, but do not allow it to exceed 10 or go below 1
        const newQuantity = cartItem.quantity + Number(req.query.inc);
        if (newQuantity < 1 || newQuantity > 10) {
            return res.status(400).json({ message: "Invalid quantity. Quantity should be between 1 and 10." });
        }

        cartItem.quantity = newQuantity;

        await cart.save();
        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
},

  

  removeItemFromCart: async (req, res) => {4010
    try {
      const productId = req.query.productId;
      const user = req.session.userId; // You should provide the user ID in the request
      console.log(productId,typeof productId);
      const cart = await Cart.findOne({user });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      } else {
        cart.items = cart.items.filter((item) => item.product+"" !== productId+"");

      console.log(cart);

        await cart.save();
        res.redirect('/cart')
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserCart: async (req, res) => {
    try {
      const user = req.session.user; // You should provide the user ID in the request
      console.log(user,user._id);
      // Find the user's cart
      let cart = await Cart.findOne({ user:user._id }).populate("items.product");
     if(cart){
       // Remove items with a null product (if any)
       console.log(cart,'TEsttttttttttttt');
       cart.items = cart?.items.filter((item) => item.product !== null);
 
       // Save the updated cart (if needed)
       await cart.save(); // You should save the document instance, not the Cart model
 
     }else {
      cart = []
     }
      res.render("cart", { cart });
    } catch (err) {
      console.error(err);
      res.render("404");
    }
  },
   clearUserCart : async (req, res) => {
    try {
      const user = req.session.user;
  
      // Find the user's cart
      let cart = await Cart.findOne({ user: user._id }).populate('items.product');
  
      if (cart) {
        // Clear the items array
        cart.items = [];
  
        // Reset the total to zero (if needed)
        cart.total = 0;
  
        // Save the updated cart
        await cart.save();
  
        console.log('Cart cleared successfully');
        res.redirect('/cart'); // Redirect to the cart page or any other desired route after clearing
      } else {
        console.log('Cart not found');
        res.render('404'); // Render a 404 page or handle accordingly if the cart is not found
      }
    } catch (err) {
      console.error(err);
      res.render('500'); // Render a 500 internal server error page or handle accordingly
    }
  },
};

module.exports = cartController;

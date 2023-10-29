const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/userModel');
const express = require('express');
const session = require('express-session');
const cartController = {
  addToCart: async (req, res) => {
    try {
      const { productId } = req.body;
      // const { user } = req.body; 
      const user = req.session.user;
      console.log(user);
      console.log('mmmmmmmmmmm');// You should provide the user ID in the request
console.log(user,"usedr");
      // Find the user's cart or create one if it doesn't exist
      let cart = await Cart.findOne({ user });

      // Find the product
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (!cart) {
        cart = new Cart({ user });
      }

      // Check if the product is already in the cart
      const cartItem = cart.items.find(item => item.product.toString() === productId);

      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cart.items.push({ product: productId });
      }

      await cart.save();
      res.status(201).json({ message: 'Product added to the cart' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  incrementCartItem: async (req, res) => {
    try {
      const { productId } = req.params;
      const { user } = req.body; // You should provide the user ID in the request

      // Find the user's cart
      const cart = await Cart.findOne({ user });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Check if the product is already in the cart
      const cartItem = cart.items.find(item => item.product.toString() === productId);

      if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in the cart' });
      }

      cartItem.quantity += 1;
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  removeItemFromCart: async (req, res) => {
    try {
      const { productId } = req.params;
      const { user } = req.body; // You should provide the user ID in the request

      // Find the user's cart
      const cart = await Cart.findOne({ user });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Filter out the product from the cart
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getUserCart: async (req, res) => {
    try {
      const user = req.session.user; // You should provide the user ID in the request
  
      // Find the user's cart
      let cart = await Cart.findOne({ user }).populate('items.product');
  
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Remove items with a null product (if any)
      cart.items = cart.items.filter(item => item.product !== null);
  
      // Save the updated cart (if needed)
      await cart.save(); // You should save the document instance, not the Cart model
  
      res.render('cart', { cart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};  

module.exports = cartController;

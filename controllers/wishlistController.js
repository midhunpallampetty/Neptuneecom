const Product = require("../models/Product");
const User = require("../models/userModel");
const express = require("express");
const Cart=require('../models/Cart');
const Wishlist=require('../models/Wishlist');
const wishlistController ={


addToWishlist : async (req, res) => {
    try {
      let { productId } = req.body;
      let user = req.session.user; // Assuming you have user authentication
  
      // Find the user's wishlist or create one if it doesn't exist
      let wishlist = await Wishlist.findOne({ user });
  
      // Find the product
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      if (!wishlist) {
        wishlist = new Wishlist({ user });
      }
  
      // Check if the product is already in the wishlist
      const wishlistItem = wishlist.items.find(item => item.product.toString() === productId);
  
      if (wishlistItem) {
        return res.status(400).json({ message: 'Product is already in the wishlist' });
      }
  
      wishlist.items.push({ product: productId });
      await wishlist.save();
      res.status(201).json({ message: 'Product added to the wishlist' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  showWishlist: async (req, res) => {
    try {
      const user = req.session.user;
  
      // If user is not authenticated
      if (!user) {
        return res.render('404'); 
      }
  
      // Try to find the wishlist
      let wishlist = await Wishlist.findOne({ user }).populate('items.product');
  
      // If no wishlist found, render page with empty wishlist
      if (!wishlist) {
        return res.render('wishlist', { wishlist: null, isWishlistEmpty: true });
      }
  
      // Remove invalid product references
      wishlist.items = wishlist.items.filter(item => item.product !== null);
  
      // Save the cleaned-up wishlist
      await wishlist.save();
  
      // Determine if wishlist has any items
      const isWishlistEmpty = wishlist.items.length === 0;
  
      // Always render the wishlist page, even if it's empty
      res.render('wishlist', { wishlist, isWishlistEmpty });
    } catch (err) {
      console.error(err);
      res.render('404');
    }
  },
  
  
  
  
  removeFromWishlist : async (req, res) => {
    try {
      const { productId } = req.params;
      const user = req.session.user; // Assuming you have user authentication
  
      // Find the user's wishlist
      let wishlist = await Wishlist.findOne({ user });
  
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }
  
      // Find the index of the product to remove in the wishlist
      const productIndex = wishlist.items.findIndex(item => item.product.toString() === productId);
  
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found in the wishlist' });
      }
  
      // Remove the product from the wishlist
      wishlist.items.splice(productIndex, 1);
      await wishlist.save();
      res.status(200).json({ message: 'Product removed from the wishlist' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  addToCartFromWishlist: async (req, res) => {
    try {
      let  {productId}  = req.query;
      let user = req.session.user; // Assuming you have user authentication
  console.log(productId,"gdhvcedghcvedgcvdegcewwwwwwwwww");
      // Find the user's cart or create one if it doesn't exist
      let cart = await Cart.findOne({ user });
  
      // Find the product
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      if (!cart) {
        cart = new Cart({ user, items: [] });
      }
  
      // Check if the product is already in the cart
      const cartItem = cart.items.find(item => item.product.toString() === productId);
  
      if (cartItem) {
        // If the product is already in the cart, you can update the quantity
        res.status(203).json({ message: 'Quantity increased in the cart' });  
        } else {
        // If the product is not in the cart, add it
        cart.items.push({ product: productId, quantity: 1 }); // You can also add a quantity
      
  
      await cart.save();
      res.status(201).json({ message: 'Product added to the cart' });
    }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }, 
}
module.exports=wishlistController;
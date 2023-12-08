const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const Category=require('../models/Category');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/"); // Store uploads in 'public/uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  const addProduct = async (req, res) => {
    try {
      const { name,brand, description, price, category, material, weight, color, listprice, stock } = req.body;
  
      // Check if a product with the same name already exists
      const existingProduct = await Product.findOne({ name });
  
      if (existingProduct) {
        const errorMessage = "Product with the same name already exists!";
        res.send(`
          <script>
            alert('${errorMessage}');
            window.location.href = '/adminDash'; // Redirect to the desired page
          </script>
        `);
        return; // Stop execution if a product with the same name is found
      }
  
      const mainImage = req.files.mainImage[0];
      const mainImagePath = mainImage.path.replace('public', '');
      const croppedImageData = req.body.croppedImage;
      const imagePathToSave = croppedImageData || mainImagePath;

      // Handle additional images if any were uploaded
      let additionalImages = [];
      if (req.files.additionalImages) {
        additionalImages = req.files.additionalImages.map(file => file.path.replace('public', ''));
      }
  
      const newProduct = new Product({
        name,
        description,
        brand,
        price,
        material,
        weight,
        color,
        listprice,
        stock,
  mainImage: imagePathToSave, // Use the cropped image data if available
        category,
        additionalImages,
      });
  
      const savedProduct = await newProduct.save();
  
      const successMessage = "Product added successfully!";
      res.send(`
        <script>
          alert('${successMessage}');
          window.location.href = '/adminDash'; // Redirect to the desired page
        </script>
      `);
    } catch (error) {
      const errorMessage = "Product creation failed";
      res.send(`
        <script>
          alert('${errorMessage}');
          window.location.href = '/adminDash'; // Redirect to the desired page
        </script>
      `);
    }
  };
    

const listProducts = async (req, res) => {
    try {
      const itemsPerPage = 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * itemsPerPage;
      const numberofItems = await Product.countDocuments();
      let productQuery = Product.find().populate("category", "description");
  
      if (req.query.search) {
        const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
        productQuery = productQuery.or([{ 'name': searchRegex }, { 'description': searchRegex }]);
      }
  
      const products = await productQuery.skip(skip).limit(itemsPerPage);
      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
      res.render("adminProductList", { products, currentPage: page, totalPages, req,numberofItems }); // Pass req object to the template
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve product list" });
    }
  };

  const getEditProduct = async (req, res) => {
    const productId = req.params.productId;
  
    // Retrieve the product to edit
    let product = await Product.findById(productId);
  
    // Fetch the list of categories
    let categories = await Category.find({ listed: true });
  
    res.render("adminEditProduct", { product, categories });
  };
  
  const postEditProduct = async (req, res) => {
    try {
      const productId = req.body.productId;
  
      // Retrieve the existing product data
      const existingProduct = await Product.findById(productId);
  
      if (!existingProduct) {
        res.status(404).send('Product not found');
        return;
      }
  
      // Handle the main image cropping
      const mainImage = req.body.croppedImage || existingProduct.mainImage;
  
      // Handle additional images
      let additionalImages = existingProduct.additionalImages;
      if (req.files.additionalImages) {
        additionalImages = req.files.additionalImages.map(file => file.path.replace('public', ''));
      }
  
      // Create an object with the updated data
      const updatedData = {
        name: req.body.name,
        brand: req.body.brand,
        description: req.body.description,
        price: req.body.price,
        mainImage,
        additionalImages,
        category: req.body.category,
        material: req.body.material,
        weight: req.body.weight,
        color: req.body.color,
        listprice: req.body.listprice,
        stock: req.body.stock,
      };
  
      // Update the product with the new data from the form
      const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData);
  
      if (!updatedProduct) {
        res.status(500).send('Product update failed');
      } else {
        res.redirect('/adminDash');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while updating the product.');
    }
  };
  
  
  const deleteProduct = async (req, res) => {
    const productId = req.params.productId;
  
    try {
      // Find the product by ID and remove it
      await Product.findByIdAndRemove(productId);
  
      // Redirect to the product list page or respond with a success message
      res.redirect("/admin/products"); // Replace 'products' with the correct route
    } catch (error) {
      res.status(500).json({ error: "Product deletion failed" });
    }
  };


  module.exports = {
    listProducts,
    postEditProduct,
    getEditProduct,
    deleteProduct,
    addProduct,
  };
  
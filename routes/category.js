const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');

// Route to render the category management page
router.get('/', categoryController.getCategoryPage);

// Route to create a new category
router.post('/create', categoryController.createCategory);

// Route to list/unlist a category
router.post('/:id/list', categoryController.listCategory);

// Route to delete a category
router.delete('/:categoryid', categoryController.deleteCategory);

module.exports = router;
// router.get('/delete-product/:productId', adminController.deleteProduct);
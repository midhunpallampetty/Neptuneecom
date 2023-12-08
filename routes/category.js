const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const adminAuth= require('../middleware/adminAuth');
const productController=require('../controllers/productController');
// Route to render the category management page
router.get('/', adminAuth.isAdminLogged,categoryController.getCategoryPage);

// Route to create a new category
router.post('/create', categoryController.createCategory);
router.get('/adminAddproduct'),productController.addProductRender;

// Route to list/unlist a category
router.post('/:id/list', adminAuth.isAdminLogged,categoryController.listCategory);
router.get('/edit', adminAuth.isAdminLogged,categoryController.getEditCategory);
router.post('/update', adminAuth.isAdminLogged,categoryController.postEditCategory);
// Route to delete a category
router.delete('/:categoryid', adminAuth.isAdminLogged,categoryController.deleteCategory);

module.exports = router;
// router.get('/delete-product/:productId', adminController.deleteProduct);
// /category/edit/
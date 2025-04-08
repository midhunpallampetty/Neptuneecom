const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');
const adminAuth= require('../middleware/adminAuth');
const productController=require('../controllers/productController');
router.get('/', adminAuth.isAdminLogged,categoryController.getCategoryPage);
router.post('/create', categoryController.createCategory);
router.get('/adminAddproduct'),productController.addProductRender;
router.post('/:id/list', adminAuth.isAdminLogged,categoryController.listCategory);
router.get('/edit', adminAuth.isAdminLogged,categoryController.getEditCategory);
router.post('/update', adminAuth.isAdminLogged,categoryController.postEditCategory);
router.delete('/:categoryid', adminAuth.isAdminLogged,categoryController.deleteCategory);  

module.exports = router;

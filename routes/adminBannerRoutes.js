// routes/adminBannerRoutes.js
const express = require('express');
const router = express.Router();
const adminBannerController = require('../controllers/adminBannerController');
const userAuth=require('../middleware/userAuth');
router.get('/banners', adminBannerController.listBanners);

router.post('/banners/create', userAuth.isUserLogged,adminBannerController.createBanner);
router.get('/banners/edit/:id', userAuth.isUserLogged,adminBannerController.editBanner);
router.post('/banners/edit/:id', userAuth.isUserLogged,adminBannerController.updateBanner);
router.post('/banners/delete/:id', userAuth.isUserLogged,adminBannerController.deleteBanner);

module.exports = router;

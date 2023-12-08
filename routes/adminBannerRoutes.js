// routes/adminBannerRoutes.js
const express = require('express');
const router = express.Router();
const adminBannerController = require('../controllers/adminBannerController');

router.get('/banners', adminBannerController.listBanners);

router.post('/banners/create', adminBannerController.createBanner);
router.get('/banners/edit/:id', adminBannerController.editBanner);
router.post('/banners/edit/:id', adminBannerController.updateBanner);
router.post('/banners/delete/:id', adminBannerController.deleteBanner);

module.exports = router;

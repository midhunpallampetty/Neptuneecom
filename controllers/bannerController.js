// controllers/bannerController.js

const Banner =require('../models/bannerModel');
const multer = require('multer');


exports.listBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    res.render('manageBanners', { banners });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.disableBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).send('Banner not found');
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.redirect('/admin/manage-banners');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.renderAddBannerForm = (req, res) => {
  res.render('addBanner');
};

// controllers/bannerController.js

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.addBanner = async (req, res) => {
  try {
    const { filename } = req.file;
    const { slogan, startTime, endTime } = req.body;

    const newBanner = new Banner({
      image: `/uploads/${filename}`,
      slogan,
      startTime,
      endTime,
    });

    await newBanner.save();
    res.redirect('/admin/manage-banners');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

// exports.renderMainPage = (req, res) => {
//   console.log("|rouyte calling");
//   const banner=Banner.find();
//   console.log(banner,'()))))))))))))))))))))))))))))))))))regrtgy');
//   res.render('mainpage', { banner });
// };
// Other banner management functions...




// controllers/adminCouponController.js

const Coupon = require('../models/Coupon');

exports.renderCreateCouponForm = (req, res) => {
  res.render('adminCreateCoupon');
};
exports.renderCouponList = async (req, res) => {
  try {
      const coupons = await Coupon.find();
      res.render('adminCouponList', { coupons });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, discount, quantity, expiryDate } = req.body;

    const newCoupon = new Coupon({
      code,
      type,
      discount,
      quantity,
      expiryDate,
    });

    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.deleteCoupon = async (req, res) => {
  try {
    const couponCode = req.query.code;
console.log(couponCode,'code testing..........');
    // Delete the coupon based on the code
    await Coupon.findByIdAndDelete(couponCode);

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

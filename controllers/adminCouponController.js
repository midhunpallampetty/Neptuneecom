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
// editCouponController.js



exports.getEditCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.render('editCoupon', { coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
exports.postEditCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const { code, type, discount, quantity, expiryDate } = req.body;

    // Validation: Check if discount meets the criteria based on type
    if (type === 'percentage' && (discount < 1 || discount > 100)) {
      return res.status(400).json({ alert: 'error', message: 'Percentage discount should be between 1 and 100.' });
    } else if (type === 'fixed' && (discount < 1 || isNaN(discount))) {
      return res.status(400).json({ alert: 'error', message: 'Fixed discount should be a number 1 or greater.' });
    } else if (type !== 'percentage' && type !== 'fixed') {
      return res.status(400).json({ alert: 'error', message: 'Invalid coupon type.' });
    }

    // Validation: Check if quantity is not negative
    if (quantity < 0) {
      return res.status(400).json({ alert: 'error', message: 'Quantity cannot be a negative value.' });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { code, type, discount, quantity, expiryDate },
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ alert: 'error', message: 'Coupon not found' });
    }

    res.status(200).json({ alert: 'success', message: 'Coupon updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ alert: 'error', message: 'Internal server error' });
  }
};




exports.createCoupon = async (req, res) => {
  try {
    const { code, type, discount, quantity, expiryDate } = req.body;

    // Validate coupon code
    if (!/^[A-Z0-9]{3,}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }
    // Validate discount based on coupon type
    if (type === 'percentage') {
      if (!/^\d+$/.test(discount) || discount < 1 || discount > 100) {
        return res.status(400).json({ error: 'Invalid percentage discount value' });
      }
    } else if (type === 'fixed') {
      if (!/^\d+$/.test(discount) || discount < 1) {
        return res.status(400).json({ error: 'Invalid fixed discount value' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid coupon type' });
    }

    // Validate quantity
    if (!/^\d+$/.test(quantity) || quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity value' });
    }

    // Validate expiry date
    if (!expiryDate) {
      return res.status(400).json({ error: 'Expiry date is required' });
    }

    // Other validations as needed

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

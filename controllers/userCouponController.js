// controllers/userCouponController.js
const User=require('../models/userModel');
const Coupon = require('../models/Coupon');


const Cart = require('../models/Cart');

exports.applyCoupon = async (req, res) => {
  const userId = req.session.user._id;
  const couponCode = req.query.code; // Assuming the frontend sends the coupon code

  try {
    // Check if the coupon is valid
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    // Check if the user exists
    const user = await User.findById(userId).populate('couponsApplied');

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if the coupon is already applied
    const isCouponAlreadyApplied = user.couponsApplied.some(appliedCoupon => appliedCoupon._id.equals(coupon._id));

    if (isCouponAlreadyApplied) {
      return res.status(400).json({ error: 'Coupon already applied' });
    }

    // Apply the coupon to the user
    user.couponsApplied.push(coupon);
    await user.save();

    // Fetch the user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(400).json({ error: 'User has no items in the cart' });
    }

    // Calculate the total price before applying the discount
   // Assuming you have req.session.totalPrice and req.session.totalPriceAfterCoupon

// Calculate the total price before applying the discount
let totalPriceBeforeDiscount = cart.items.reduce((total, item) => {
  return total + item.product.price * item.quantity;
}, 0);

// Initialize discountAmount to 0
let discountAmount = 0;

// Apply the discount from the coupon
if (coupon.type === 'percentage') {
  // If the coupon type is percentage, apply the percentage discount
  const percentageDiscount = (coupon.discount / 100) * totalPriceBeforeDiscount;
  totalPriceBeforeDiscount -= percentageDiscount;
  discountAmount = percentageDiscount; // Save the discount amount
} else if (coupon.type === 'fixed') {
  // If the coupon type is fixed, directly subtract the fixed discount
  totalPriceBeforeDiscount -= coupon.discount;
  discountAmount = coupon.discount; // Save the discount amount
}

console.log(totalPriceBeforeDiscount, 'Discounted Total Price:', totalPriceBeforeDiscount);

// Ensure total price is non-negative
cart.totalPrice = Math.max(0, totalPriceBeforeDiscount);

// Save the totalPriceAfterCoupon and discountAmount in the session
req.session.totalPriceAfterCoupon = totalPriceBeforeDiscount;
req.session.discountAmount = discountAmount;

// Save the updated cart
await cart.save();


    // Decrease the coupon quantity in the Coupons collection
    if (coupon.quantity > 0) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { quantity: -1 } });
    }

    // Send the totalPriceBeforeDiscount to the checkout.ejs template
    res.status(200).json({ message: 'Coupon applied successfully', totalPriceBeforeDiscount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



function calculateDiscount(type, discount, cartTotal) {
  if (type === 'percentage') {
    return (discount / 100) * cartTotal;
  } else {
    return discount;
  }
}

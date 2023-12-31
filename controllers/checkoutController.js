const Checkout = require('../models/checkoutModel');
const Cart=require('../models/Cart');
const Coupon=require('../models/Coupon');
const User=require('../models/userModel');
// Define the calculateTotalPrice function
const calculateTotalPrice = (cartItems) => {
  let total = 0;

  cartItems.forEach((item) => {
    const originalPrice = parseFloat(item.product.price);
    const discountPercentage = parseFloat(item.product.offer.discountPercentage);
    const discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
    const itemTotal = discountedPrice * item.quantity;
    total += itemTotal;
  });

  return total;
};



exports.getCheckoutPage = async (req, res) => {
  try {
    
    // Retrieve user details from the request (assumes you have the user data)
    const user = req.session.user; // Adjust this based on your authentication logic
   let  userid=user._id;
   const allCoupon = await Coupon.aggregate([{ $sample: { size: 3 } }]);

    console.log(allCoupon,'fdghdfrtdsdtrds');
    const foundUser = await User.findOne({ _id:userid }).exec();
console.log(foundUser,'i need');
    // Fetch the user's cart items
    const cartItems = await Cart.findOne({ user }).populate('items.product');



    if (!cartItems) {
      return res.redirect('/mainpage'); // Redirect if the cart is empty or not found
    }
// Assuming you have the cart items stored in cartItems variable
for (let i = 0; i < cartItems.items.length; i++) {
  const stock = cartItems.items[i].product.stock;
  const quantity = cartItems.items[i].quantity;

  if (stock < quantity) {
    // Redirect to the cart page with an alert
    const errormsg='Insufficient stock for some items in the cart.';
    return res.send(`
      <script>
        alert('${errormsg}');
        window.location.href = '/cart'; // Redirect to the registration page
      </script>
    `);

  }
}

// Continue with the order or other actions if all items have sufficient stock
console.log('All items in the cart have sufficient stock.');

    // Check if any item is out of stock
    const isOutOfStock = cartItems.items.some(item => item.product.stock < 1);

    if (isOutOfStock) {
      // Display SweetAlert and redirect to the main page
      const errorMessage = 'One of Your Product is outofstock please remove it to proceed Checkout';
      return res.send(`
      <script>
        alert('${errorMessage}');
        window.location.href = '/cart'; // Redirect to the registration page
      </script>
    `);
    }

    // Calculate total price based on cart items
    const totalPrice = calculateTotalPrice(cartItems.items);
    req.session.totalPrice = totalPrice;
    req.session.cartItems = cartItems.items;
    console.log(req.session.totalPrice ,'total priceeeeeeeeeeeeeeeeeeeeee');
console.log(user,'yfuhgewyfgewyftgewyfgtew');
    res.render('checkout', {
      user,additionalAddresses:user.additionalAddresses,foundUser,
      cartItems: cartItems.items,
      totalPrice,
      // Include additional fields in the template
      CustName: user.CustName || '',
      PhoneNum: user.PhoneNum || '',
      companyName: user.companyName || '',
      Zipcode: user.Zipcode || '',allCoupon
    });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.send('404');
  }
};



// The updateDetailCheckout method for the checkout page
exports.updateDetailCheckout = async (req, res) => {
  try {
    const userId = req.session.userId; // Get the user ID from the session
    const { FullName, Phone, HouseName, Pincode } = req.body;
console.log(userId,'meeeenfbvbfbn');
    // Use findOneAndUpdate to update the user's profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          FullName,
          Phone,
          HouseName,
          Pincode,
        },
      },
      { new: true } // Return the updated user
    );
    req.session.user = updatedUser;

    // Redirect to the checkout page after the update
    res.redirect("/checkout");
  } catch (error) {
    // Handle any errors here
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateAddressSet2 = async (req, res) => {
  try {
    const userId = req.session.userId; // Get the user ID from the session
    const { CustName, PhoneNum, Zipcode } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    // Update the fields for Address Set 2
    user.CustName = CustName || '';
    user.PhoneNum = PhoneNum || '';
    user.Zipcode = Zipcode || '';

    // Save the updated user
    const updatedUser = await user.save();
    req.session.user = updatedUser;

    // Redirect to the checkout page after the update
    res.redirect("/checkout");
  } catch (error) {
    // Handle any errors here
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
  
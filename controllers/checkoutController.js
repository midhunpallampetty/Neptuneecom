const Checkout = require('../models/checkoutModel');
const Cart=require('../models/Cart');

const User=require('../models/userModel');
// Define the calculateTotalPrice function
function calculateTotalPrice(cartItems) {
  let totalPrice = 0;

  // Iterate through the cart items and calculate the total price
  for (const cartItem of cartItems) {
    totalPrice += cartItem.quantity * cartItem.product.price;
  }

  return totalPrice;
}



exports.getCheckoutPage = async (req, res) => {
  try {
    // Retrieve user details from the request (assumes you have the user data)
    const user = req.session.user; // Adjust this based on your authentication logic
   let  userid=user._id;
   
    const foundUser = await User.findOne({ _id:userid }).exec();
console.log(foundUser,'i need');
    // Fetch the user's cart items
    const cartItems = await Cart.findOne({ user }).populate('items.product');

    if (!cartItems) {
      return res.redirect('/mainpage'); // Redirect if the cart is empty or not found
    }

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
console.log(user,'yfuhgewyfgewyftgewyfgtew');
    res.render('checkout', {
      user,additionalAddresses:user.additionalAddresses,foundUser,
      cartItems: cartItems.items,
      totalPrice,
      // Include additional fields in the template
      CustName: user.CustName || '',
      PhoneNum: user.PhoneNum || '',
      companyName: user.companyName || '',
      Zipcode: user.Zipcode || '',
    });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.render('404');
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
  
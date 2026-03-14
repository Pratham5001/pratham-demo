const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title images price status seller');
    res.render('cart/index', { cart, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'available') {
      return res.json({ success: false, message: 'Product not available' });
    }
    if (product.seller.toString() === req.user._id.toString()) {
      return res.json({ success: false, message: 'Cannot add your own product to cart' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIdx = cart.items.findIndex(item => item.product.toString() === productId);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), price: product.price });
    }
    cart.calculateTotal();
    await cart.save();
    const count = cart.items.reduce((a, i) => a + i.quantity, 0);
    res.json({ success: true, message: 'Added to cart', cartCount: count });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ success: false });
    const item = cart.items.find(i => i.product.toString() === productId);
    if (item) {
      if (Number(quantity) <= 0) {
        cart.items = cart.items.filter(i => i.product.toString() !== productId);
      } else {
        item.quantity = Number(quantity);
      }
    }
    cart.calculateTotal();
    await cart.save();
    res.json({ success: true, totalPrice: cart.totalPrice });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
      cart.calculateTotal();
      await cart.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.items.reduce((a, i) => a + i.quantity, 0) : 0;
    res.json({ count });
  } catch (err) {
    res.json({ count: 0 });
  }
};

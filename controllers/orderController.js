const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.showCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title images price status seller');
    if (!cart || cart.items.length === 0) return res.redirect('/cart');
    const validItems = cart.items.filter(i => i.product && i.product.status === 'available');
    res.render('orders/checkout', { cart: { ...cart.toObject(), items: validItems }, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const { fullName, address, city, postalCode, phone, paymentMethod, notes } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.redirect('/cart');

    const orderItems = cart.items.filter(i => i.product && i.product.status === 'available').map(item => ({
      product: item.product._id,
      title: item.product.title,
      image: item.product.images[0],
      price: item.price,
      quantity: item.quantity,
      seller: item.product.seller
    }));

    const order = await Order.create({
      buyer: req.user._id,
      items: orderItems,
      shippingAddress: { fullName, address, city, postalCode, phone },
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      totalPrice: cart.totalPrice,
      notes
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { status: 'sold' });
    }
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });

    res.render('orders/confirmation', { order, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.render('orders/index', { orders, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.render('error', { message: 'Order not found', user: req.user });
    res.render('orders/detail', { order, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, categories] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments()
    ]);
    const recentOrders = await Order.find().populate('buyer', 'name').sort({ createdAt: -1 }).limit(5);
    const recentProducts = await Product.find().populate('seller', 'name').sort({ createdAt: -1 }).limit(5);
    const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
    res.render('admin/dashboard', {
      stats: { totalUsers, totalProducts, totalOrders, categories, revenue: revenue[0]?.total || 0 },
      recentOrders, recentProducts, user: req.user
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.render('admin/users', { users, user: req.user });
};

exports.toggleUser = async (req, res) => {
  const u = await User.findById(req.params.id);
  if (u && u.role !== 'admin') { u.isActive = !u.isActive; await u.save(); }
  res.json({ success: true, isActive: u.isActive });
};

exports.getProducts = async (req, res) => {
  const products = await Product.find().populate('seller category', 'name slug').sort({ createdAt: -1 });
  res.render('admin/products', { products, user: req.user });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.toggleFeatured = async (req, res) => {
  const product = await Product.findById(req.params.id);
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json({ success: true, isFeatured: product.isFeatured });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.render('admin/categories', { categories, user: req.user, error: null });
};

exports.addCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await Category.create({ name, slug, icon, description });
    res.redirect('/admin/categories');
  } catch (err) {
    const categories = await Category.find();
    res.render('admin/categories', { categories, user: req.user, error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 });
  res.render('admin/orders', { orders, user: req.user });
};

exports.updateOrderStatus = async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status });
  res.json({ success: true });
};

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const products = await Product.find({ seller: user._id }).sort({ createdAt: -1 });
    const orders = await Order.find({ buyer: user._id }).sort({ createdAt: -1 }).limit(5);
    res.render('user/profile', { profileUser: user, products, orders, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.showEditProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.render('user/edit-profile', { profileUser: user, user: req.user, error: null });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, bio } = req.body;
    const updateData = { name, phone, address, city, bio };
    if (req.file) updateData.avatar = '/uploads/' + req.file.filename;
    const updated = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
    res.render('user/edit-profile', { profileUser: updated, user: updated, error: null, success: 'Profile updated!' });
  } catch (err) {
    const user = await User.findById(req.user._id).select('-password');
    res.render('user/edit-profile', { profileUser: user, user: req.user, error: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const profileUser = await User.findById(req.params.id).select('-password -email');
    if (!profileUser) return res.render('error', { message: 'User not found', user: req.user });
    const products = await Product.find({ seller: profileUser._id, status: 'available' }).populate('category', 'name');
    res.render('user/public-profile', { profileUser, products, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

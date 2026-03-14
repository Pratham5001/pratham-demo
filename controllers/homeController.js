const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getHome = async (req, res) => {
  try {
    const [featured, latest, categories] = await Promise.all([
      Product.find({ isFeatured: true, status: 'available' }).populate('seller category', 'name slug').limit(8),
      Product.find({ status: 'available' }).populate('seller category', 'name slug').sort({ createdAt: -1 }).limit(8),
      Category.find({ isActive: true })
    ]);
    res.render('home', { featured, latest, categories, user: req.user });
  } catch (err) {
    res.render('home', { featured: [], latest: [], categories: [], user: req.user });
  }
};

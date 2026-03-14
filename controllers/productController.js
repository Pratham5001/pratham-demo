const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, condition, search, sort, page = 1 } = req.query;
    const limit = 12;
    let query = { status: 'available' };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (condition) query.condition = condition;
    if (search) query.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { averageRating: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category seller', 'name slug name avatar')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit);

    const categories = await Category.find({ isActive: true });
    let wishlistIds = [];
    if (req.user) {
      const wl = await Wishlist.findOne({ user: req.user._id });
      if (wl) wishlistIds = wl.products.map(p => p.toString());
    }

    res.render('products/index', {
      products, categories, total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      query: req.query, user: req.user, wishlistIds
    });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category seller', 'name slug name avatar joinedAt');
    if (!product) return res.render('error', { message: 'Product not found', user: req.user });
    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const reviews = await Review.find({ product: product._id }).populate('user', 'name avatar').sort({ createdAt: -1 });
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, status: 'available' }).limit(4).populate('seller', 'name');
    let inWishlist = false;
    if (req.user) {
      const wl = await Wishlist.findOne({ user: req.user._id });
      if (wl) inWishlist = wl.products.includes(product._id);
    }
    res.render('products/detail', { product, reviews, related, user: req.user, inWishlist });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.showAddProduct = async (req, res) => {
  const categories = await Category.find({ isActive: true });
  res.render('products/add', { categories, user: req.user, error: null });
};

exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, size, brand, tags } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    if (images.length === 0) images.push('/images/placeholder.jpg');
    const product = await Product.create({
      title, description, price: Number(price), category, condition, size, brand,
      images, seller: req.user._id,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    res.redirect('/products/' + product._id);
  } catch (err) {
    const categories = await Category.find({ isActive: true });
    res.render('products/add', { categories, user: req.user, error: err.message });
  }
};

exports.showEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.seller.toString() !== req.user._id.toString()) return res.redirect('/');
    const categories = await Category.find({ isActive: true });
    res.render('products/edit', { product, categories, user: req.user, error: null });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.seller.toString() !== req.user._id.toString()) return res.redirect('/');
    const { title, description, price, category, condition, size, brand, tags, status } = req.body;
    const newImages = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const images = newImages.length > 0 ? newImages : product.images;
    await Product.findByIdAndUpdate(req.params.id, {
      title, description, price: Number(price), category, condition, size, brand, status,
      images, tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    res.redirect('/products/' + req.params.id);
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && (product.seller.toString() === req.user._id.toString() || req.user.role === 'admin')) {
      await Product.findByIdAndDelete(req.params.id);
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ product: req.params.id, user: req.user._id });
    if (existing) {
      await Review.findByIdAndUpdate(existing._id, { rating, comment });
    } else {
      await Review.create({ product: req.params.id, user: req.user._id, rating: Number(rating), comment });
    }
    const reviews = await Review.find({ product: req.params.id });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.params.id, { averageRating: avg.toFixed(1), numReviews: reviews.length });
    res.redirect('/products/' + req.params.id + '#reviews');
  } catch (err) {
    res.redirect('/products/' + req.params.id);
  }
};

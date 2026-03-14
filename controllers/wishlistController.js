const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products', populate: { path: 'seller category', select: 'name slug' }
    });
    res.render('wishlist/index', { wishlist, user: req.user });
  } catch (err) {
    res.render('error', { message: err.message, user: req.user });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

    const idx = wishlist.products.indexOf(productId);
    let added;
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }
    await wishlist.save();
    res.json({ success: true, added, count: wishlist.products.length });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

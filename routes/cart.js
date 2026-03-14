// routes/cart.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCart, addToCart, updateCart, removeFromCart, getCartCount } = require('../controllers/cartController');

router.get('/', protect, getCart);
router.get('/count', protect, getCartCount);
router.post('/add', protect, addToCart);
router.post('/update', protect, updateCart);
router.delete('/remove/:productId', protect, removeFromCart);

module.exports = router;

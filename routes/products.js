const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts, getProduct, showAddProduct, addProduct,
  showEditProduct, updateProduct, deleteProduct, addReview
} = require('../controllers/productController');

router.get('/', optionalAuth, getProducts);
router.get('/add', protect, showAddProduct);
router.post('/add', protect, upload.array('images', 5), addProduct);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/edit', protect, showEditProduct);
router.post('/:id/edit', protect, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/review', protect, addReview);

module.exports = router;

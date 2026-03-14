const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboard, getUsers, toggleUser, getProducts, deleteProduct,
  toggleFeatured, getCategories, addCategory, deleteCategory, getOrders, updateOrderStatus
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/', getDashboard);
router.get('/users', getUsers);
router.post('/users/:id/toggle', toggleUser);
router.get('/products', getProducts);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/featured', toggleFeatured);
router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/orders', getOrders);
router.post('/orders/:id/status', updateOrderStatus);

module.exports = router;

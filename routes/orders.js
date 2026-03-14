const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { showCheckout, placeOrder, getOrders, getOrder } = require('../controllers/orderController');

router.get('/checkout', protect, showCheckout);
router.post('/place', protect, placeOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

module.exports = router;

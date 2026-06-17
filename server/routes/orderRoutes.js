const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const { createOrder, getOrderById, getOrdersByUserId, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// Customer routes
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getOrdersByUserId);
router.get('/:id', auth, getOrderById);

// Admin routes
router.get('/', auth, adminOnly, getAllOrders);
router.put('/:id/status', auth, adminOnly, updateOrderStatus);

module.exports = router;

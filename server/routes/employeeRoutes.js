const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const employeeOrAdmin = require('../middleware/employeeMiddleware');
const {
    getPendingOrders,
    getMyActiveOrders,
    getMyOrderHistory,
    takeOrder,
    updateMyOrderStatus,
    getMyStats,
} = require('../controllers/employeeController');

// All employee routes require auth + employee/admin role
router.use(auth, employeeOrAdmin);

router.get('/stats',           getMyStats);
router.get('/orders/pending',  getPendingOrders);
router.get('/orders/active',   getMyActiveOrders);
router.get('/orders/history',  getMyOrderHistory);
router.post('/orders/:id/take',        takeOrder);
router.put('/orders/:id/status',       updateMyOrderStatus);

module.exports = router;

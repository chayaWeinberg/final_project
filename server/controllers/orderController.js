const orderService = require('../services/orderService');

// Create a new order
async function createOrder(req, res, next) {
    try {
        const user_id = req.user.id; 
        const { items, delivery_address, phone } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!delivery_address || !phone) {
            return res.status(400).json({ message: 'Delivery address and phone are required' });
        }

        const order = await orderService.createOrder({
            user_id,
            items,
            delivery_address,
            phone
        });

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
}

// Get order by ID
async function getOrderById(req, res, next) {
    try {
        const { id } = req.params;
        const order = await orderService.getOrderById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
}

// Get orders by user ID
async function getOrdersByUserId(req, res, next) {
    try {
        const user_id = req.user.id;
        const orders = await orderService.getOrdersByUserId(user_id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

// Get all orders (admin only)
async function getAllOrders(req, res, next) {
    try {
        const orders = await orderService.getAllOrders();
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

// Update order status (admin only)
async function updateOrderStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const order = await orderService.updateOrderStatus(id, status);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUserId,
    getAllOrders,
    updateOrderStatus
};

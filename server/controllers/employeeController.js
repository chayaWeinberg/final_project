const employeeService = require('../services/employeeService');

async function getPendingOrders(req, res, next) {
    try {
        const orders = await employeeService.getPendingOrders();
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

async function getMyActiveOrders(req, res, next) {
    try {
        const orders = await employeeService.getMyActiveOrders(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

async function getMyOrderHistory(req, res, next) {
    try {
        const orders = await employeeService.getMyOrderHistory(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

async function takeOrder(req, res, next) {
    try {
        const { id } = req.params;
        const order = await employeeService.takeOrder(id, req.user.id);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

async function updateMyOrderStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const result = await employeeService.updateMyOrderStatus(id, req.user.id, status);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getMyStats(req, res, next) {
    try {
        const stats = await employeeService.getMyStats(req.user.id);
        res.json(stats);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getPendingOrders,
    getMyActiveOrders,
    getMyOrderHistory,
    takeOrder,
    updateMyOrderStatus,
    getMyStats,
};

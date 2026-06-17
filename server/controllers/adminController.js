const adminService = require('../services/adminService');
const adminEmployeeService = require('../services/adminEmployeeService');

async function getStats(req, res, next) {
    try {
        const [summary, topItems, ordersByStatus] = await Promise.all([
            adminService.getSummary(),
            adminService.getTopItems(10),
            adminService.getOrdersByStatus()
        ]);

        res.json({ summary, topItems, ordersByStatus });
    } catch (err) {
        next(err);
    }
}

async function createEmployee(req, res, next) {
    try {
        const employee = await adminEmployeeService.createEmployee(req.body);
        res.status(201).json(employee);
    } catch (err) {
        next(err);
    }
}

async function getEmployees(req, res, next) {
    try {
        const employees = await adminEmployeeService.getEmployees();
        res.json(employees);
    } catch (err) {
        next(err);
    }
}

async function deactivateEmployee(req, res, next) {
    try {
        const result = await adminEmployeeService.deactivateEmployee(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function reactivateEmployee(req, res, next) {
    try {
        const result = await adminEmployeeService.reactivateEmployee(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { getStats, createEmployee, getEmployees, deactivateEmployee, reactivateEmployee };

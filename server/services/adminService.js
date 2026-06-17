const db = require('../config/db');

// Top items by order_count (for pie chart)
async function getTopItems(limit = 10) {
    const [rows] = await db.query(
        `SELECT id, name, category, order_count
         FROM menus
         ORDER BY order_count DESC
         LIMIT ?`,
        [limit]
    );
    return rows;
}

// Orders count grouped by status
async function getOrdersByStatus() {
    const [rows] = await db.query(
        `SELECT status, COUNT(*) AS count
         FROM orders
         GROUP BY status`
    );
    return rows;
}

// Summary KPIs
async function getSummary() {
    const [[{ total_orders }]] = await db.query(
        `SELECT COUNT(*) AS total_orders FROM orders`
    );

    const [[{ total_revenue }]] = await db.query(
        `SELECT COALESCE(SUM(total_price), 0) AS total_revenue FROM orders WHERE status != 'cancelled'`
    );

    const [[{ active_orders }]] = await db.query(
        `SELECT COUNT(*) AS active_orders FROM orders WHERE status IN ('pending','confirmed','preparing','ready')`
    );

    const [[{ menu_items }]] = await db.query(
        `SELECT COUNT(*) AS menu_items FROM menus`
    );

    return { total_orders, total_revenue, active_orders, menu_items };
}

module.exports = { getTopItems, getOrdersByStatus, getSummary };

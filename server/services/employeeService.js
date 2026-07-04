const db = require('../config/db');


async function getPendingOrders() {
    const [orders] = await db.query(
        `SELECT o.*, u.name AS customer_name, u.email AS customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.status = 'pending' AND o.assigned_to IS NULL
         ORDER BY o.created_at ASC`
    );

    for (const order of orders) {
        const [items] = await db.query(
            `SELECT oi.*, m.name, m.image_filename
             FROM order_items oi
             JOIN menus m ON oi.menu_item_id = m.id
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;
    }

    return orders;
}


async function getMyActiveOrders(employeeId) {
    const [orders] = await db.query(
        `SELECT o.*, u.name AS customer_name, u.email AS customer_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.assigned_to = ? AND o.status IN ('confirmed', 'preparing', 'ready')
         ORDER BY o.created_at DESC`,
        [employeeId]
    );

    for (const order of orders) {
        const [items] = await db.query(
            `SELECT oi.*, m.name, m.image_filename
             FROM order_items oi
             JOIN menus m ON oi.menu_item_id = m.id
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;
    }

    return orders;
}


async function getMyOrderHistory(employeeId) {
    const [orders] = await db.query(
        `SELECT o.*, u.name AS customer_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.assigned_to = ? AND o.status IN ('delivered', 'cancelled')
         ORDER BY o.updated_at DESC
         LIMIT 50`,
        [employeeId]
    );

    for (const order of orders) {
        const [items] = await db.query(
            `SELECT oi.*, m.name
             FROM order_items oi
             JOIN menus m ON oi.menu_item_id = m.id
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;
    }

    return orders;
}


async function takeOrder(orderId, employeeId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT id, status, assigned_to FROM orders WHERE id = ? FOR UPDATE`,
            [orderId]
        );

        if (rows.length === 0) throw Object.assign(new Error('הזמנה לא נמצאה'), { status: 404 });

        const order = rows[0];

        if (order.status !== 'pending') {
            throw Object.assign(new Error('הזמנה זו כבר לא ממתינה'), { status: 409 });
        }

        if (order.assigned_to !== null) {
            throw Object.assign(new Error('הזמנה זו כבר נלקחה על ידי עובד אחר'), { status: 409 });
        }

        await connection.query(
            `UPDATE orders SET assigned_to = ?, status = 'confirmed', updated_at = NOW() WHERE id = ?`,
            [employeeId, orderId]
        );

        await connection.commit();

        const [updated] = await db.query(
            `SELECT o.*, u.name AS customer_name FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
            [orderId]
        );
        return updated[0];
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

const ALLOWED_TRANSITIONS = {
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready:     ['delivered'],
};

async function updateMyOrderStatus(orderId, employeeId, newStatus) {
    const [rows] = await db.query(
        `SELECT id, status, assigned_to FROM orders WHERE id = ?`,
        [orderId]
    );

    if (rows.length === 0) throw Object.assign(new Error('הזמנה לא נמצאה'), { status: 404 });

    const order = rows[0];

    if (order.assigned_to !== employeeId) {
        throw Object.assign(new Error('אין לך הרשאה לעדכן הזמנה זו'), { status: 403 });
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
        throw Object.assign(
            new Error(`לא ניתן לעבור מסטטוס "${order.status}" ל-"${newStatus}"`),
            { status: 400 }
        );
    }

    await db.query(
        `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [newStatus, orderId]
    );

    return { order_id: orderId, status: newStatus };
}


async function getMyStats(employeeId) {
    const [[{ today_handled }]] = await db.query(
        `SELECT COUNT(*) AS today_handled
         FROM orders
         WHERE assigned_to = ?
           AND DATE(updated_at) = CURDATE()
           AND status IN ('delivered', 'cancelled')`,
        [employeeId]
    );

    const [[{ active_count }]] = await db.query(
        `SELECT COUNT(*) AS active_count
         FROM orders
         WHERE assigned_to = ? AND status IN ('confirmed', 'preparing', 'ready')`,
        [employeeId]
    );

    const [[{ total_handled }]] = await db.query(
        `SELECT COUNT(*) AS total_handled
         FROM orders
         WHERE assigned_to = ? AND status IN ('delivered', 'cancelled')`,
        [employeeId]
    );

    const [ordersByStatus] = await db.query(
        `SELECT status, COUNT(*) AS count
         FROM orders
         WHERE assigned_to = ?
         GROUP BY status`,
        [employeeId]
    );

    return { today_handled, active_count, total_handled, ordersByStatus };
}

module.exports = {
    getPendingOrders,
    getMyActiveOrders,
    getMyOrderHistory,
    takeOrder,
    updateMyOrderStatus,
    getMyStats,
};

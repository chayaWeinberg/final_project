const db = require('../config/db');

async function createOrder(orderData) {
    const { user_id, items, delivery_address, phone } = orderData;
    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('No items provided');
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        let total_price = 0;
        const resolvedItems = [];

        for (const item of items) {
            const menuId = item.menu_item_id;
            const quantity = parseInt(item.quantity, 10) || 1;

            const [menuRows] = await connection.query('SELECT id, price FROM menus WHERE id = ?', [menuId]);
            if (menuRows.length === 0) {
                throw new Error(`Menu item not found: ${menuId}`);
            }

            const menu = menuRows[0];
            const price_at_order = Number(menu.price);
            total_price += price_at_order * quantity;

            resolvedItems.push({
                menu_item_id: menuId,
                quantity,
                price_at_order,
                special_instructions: item.special_instructions || null
            });
        }

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_price, delivery_address, phone) VALUES (?, ?, ?, ?)',
            [user_id, total_price, delivery_address, phone]
        );

        const order_id = orderResult.insertId;

        for (const it of resolvedItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order, special_instructions) VALUES (?, ?, ?, ?, ?)',
                [order_id, it.menu_item_id, it.quantity, it.price_at_order, it.special_instructions]
            );

            await connection.query(
                'UPDATE menus SET order_count = order_count + ? WHERE id = ?',
                [it.quantity, it.menu_item_id]
            );
        }

        await connection.commit();
        connection.release();

        const fullOrder = await getOrderById(order_id);
        return fullOrder;
    } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
    }
}

async function getOrderById(order_id) {
    const [orders] = await db.query(
        `SELECT o.*, u.name AS customer_name,
                e.name AS employee_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN users e ON o.assigned_to = e.id
         WHERE o.id = ?`,
        [order_id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];

    const [items] = await db.query(
        `SELECT oi.*, m.name, m.description 
         FROM order_items oi 
         JOIN menus m ON oi.menu_item_id = m.id 
         WHERE oi.order_id = ?`,
        [order_id]
    );

    return { ...order, items };
}

async function getOrdersByUserId(user_id) {
    const [orders] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [user_id]
    );

    for (const order of orders) {
        const [items] = await db.query(
            `SELECT oi.*, m.name, m.description 
             FROM order_items oi 
             JOIN menus m ON oi.menu_item_id = m.id 
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;
    }

    return orders;
}

async function getAllOrders() {
    const [orders] = await db.query(
        `SELECT o.*, u.name AS customer_name,
                e.name AS employee_name
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN users e ON o.assigned_to = e.id
         ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
        const [items] = await db.query(
            `SELECT oi.*, m.name, m.description 
             FROM order_items oi 
             JOIN menus m ON oi.menu_item_id = m.id 
             WHERE oi.order_id = ?`,
            [order.id]
        );
        order.items = items;
    }

    return orders;
}

async function updateOrderStatus(order_id, status) {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        const err = new Error('Invalid status');
        err.status = 400;
        throw err;
    }

    const [result] = await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, order_id]
    );

    if (result.affectedRows === 0) {
        throw new Error('Order not found');
    }

    return { order_id, status };
}
async function deleteOrder(order_id) {
    const [result] = await db.query(
        'DELETE FROM orders WHERE id = ?',
        [order_id]
    );

    if (result.affectedRows === 0) {
        throw new Error('Order not found');
    }

    return { message: 'Order deleted successfully' };
}


module.exports = {
    deleteOrder,
    createOrder,
    getOrderById,
    getOrdersByUserId,
    getAllOrders,
    updateOrderStatus
};

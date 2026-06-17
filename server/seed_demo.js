/**
 * Demo seed — adds realistic employees, customers and orders.
 * Safe to run multiple times (uses INSERT IGNORE / checks before insert).
 * Run: node seed_demo.js
 */
require('dotenv').config();
const db     = require('./config/db');
const bcrypt = require('bcrypt');

// ── helpers ──────────────────────────────────────────────────────────────────
async function upsertEmployee(conn, { email, name, phone }) {
    const [ex] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return ex[0].id;
    const hash = await bcrypt.hash('Employee123!', 10);
    const [r]  = await conn.query(
        `INSERT INTO users (email, name, phone, role) VALUES (?, ?, ?, 'employee')`,
        [email, name, phone]
    );
    await conn.query(
        'INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)',
        [r.insertId, hash]
    );
    return r.insertId;
}

async function upsertCustomer(conn, { email, name, phone }) {
    const [ex] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length) return ex[0].id;
    const hash = await bcrypt.hash('Customer123!', 10);
    const [r]  = await conn.query(
        `INSERT INTO users (email, name, phone, role) VALUES (?, ?, ?, 'customer')`,
        [email, name, phone]
    );
    await conn.query(
        'INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)',
        [r.insertId, hash]
    );
    await conn.query(
        `INSERT INTO addresses (user_id, city, street, building_number, floor, apartment_number)
         VALUES (?, 'תל אביב', 'הרצל', '10', '2', '4')`,
        [r.insertId]
    );
    return r.insertId;
}

async function createOrder(conn, { user_id, assigned_to, status, address, phone, items }) {
    let total = 0;
    const resolved = [];
    for (const { menu_item_id, quantity, special_instructions } of items) {
        const [[m]] = await conn.query('SELECT price FROM menus WHERE id = ?', [menu_item_id]);
        if (!m) { console.warn(`menu item ${menu_item_id} not found, skipping`); continue; }
        total += Number(m.price) * quantity;
        resolved.push({ menu_item_id, quantity, price_at_order: Number(m.price), special_instructions: special_instructions || null });
    }

    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));

    const [r] = await conn.query(
        `INSERT INTO orders (user_id, total_price, status, delivery_address, phone, assigned_to, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, total, status, address, phone, assigned_to ?? null, createdAt, createdAt]
    );
    const order_id = r.insertId;

    for (const it of resolved) {
        await conn.query(
            `INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order, special_instructions)
             VALUES (?, ?, ?, ?, ?)`,
            [order_id, it.menu_item_id, it.quantity, it.price_at_order, it.special_instructions]
        );
        await conn.query(
            'UPDATE menus SET order_count = order_count + ? WHERE id = ?',
            [it.quantity, it.menu_item_id]
        );
    }

    return order_id;
}

// ── main ─────────────────────────────────────────────────────────────────────
(async () => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        console.log('🌱 Creating employees...');
        const emp1 = await upsertEmployee(conn, {
            email: 'moshe.cohen@yami.co.il',
            name:  'משה כהן',
            phone: '050-1111111',
        });
        const emp2 = await upsertEmployee(conn, {
            email: 'dana.levi@yami.co.il',
            name:  'דנה לוי',
            phone: '052-2222222',
        });
        const emp3 = await upsertEmployee(conn, {
            email: 'oren.david@yami.co.il',
            name:  'אורן דוד',
            phone: '054-3333333',
        });
        console.log(`  ✅ employees: ${emp1}, ${emp2}, ${emp3}`);

        console.log('👥 Creating customers...');
        const cust1 = await upsertCustomer(conn, {
            email: 'yael.shapira@gmail.com',
            name:  'יעל שפירא',
            phone: '053-4444444',
        });
        const cust2 = await upsertCustomer(conn, {
            email: 'noam.bar@gmail.com',
            name:  'נועם בר',
            phone: '058-5555555',
        });
        const cust3 = await upsertCustomer(conn, {
            email: 'maya.green@gmail.com',
            name:  'מאיה גרין',
            phone: '050-6666666',
        });
        const cust4 = await upsertCustomer(conn, {
            email: 'roi.mizrahi@gmail.com',
            name:  'רועי מזרחי',
            phone: '052-7777777',
        });
        console.log(`  ✅ customers: ${cust1}, ${cust2}, ${cust3}, ${cust4}`);

        // menu item ids from DB: 26-42
        console.log('📦 Creating orders...');

        // 1. Pending — waiting for an employee to take
        await createOrder(conn, {
            user_id: cust1, assigned_to: null, status: 'pending',
            address: 'הרצל 22, תל אביב', phone: '053-4444444',
            items: [
                { menu_item_id: 29, quantity: 2, special_instructions: 'ללא גלוטן' },
                { menu_item_id: 36, quantity: 2 },
            ],
        });

        await createOrder(conn, {
            user_id: cust2, assigned_to: null, status: 'pending',
            address: 'ביאליק 5, רמת גן', phone: '058-5555555',
            items: [
                { menu_item_id: 31, quantity: 1 },
                { menu_item_id: 33, quantity: 1 },
                { menu_item_id: 37, quantity: 2 },
            ],
        });

        await createOrder(conn, {
            user_id: cust3, assigned_to: null, status: 'pending',
            address: 'רוטשילד 100, תל אביב', phone: '050-6666666',
            items: [
                { menu_item_id: 26, quantity: 2, special_instructions: 'בלי שום' },
                { menu_item_id: 32, quantity: 1 },
                { menu_item_id: 39, quantity: 2 },
            ],
        });

        // 2. Confirmed — emp1 took the order
        await createOrder(conn, {
            user_id: cust4, assigned_to: emp1, status: 'confirmed',
            address: 'דיזנגוף 88, תל אביב', phone: '052-7777777',
            items: [
                { menu_item_id: 30, quantity: 1 },
                { menu_item_id: 35, quantity: 1 },
                { menu_item_id: 38, quantity: 1 },
            ],
        });

        // 3. Preparing — emp2 is working on it
        await createOrder(conn, {
            user_id: cust1, assigned_to: emp2, status: 'preparing',
            address: 'הרצל 22, תל אביב', phone: '053-4444444',
            items: [
                { menu_item_id: 32, quantity: 1, special_instructions: 'ללא פרמזן' },
                { menu_item_id: 40, quantity: 2 },
                { menu_item_id: 36, quantity: 1 },
            ],
        });

        // 4. Ready — emp1 finished preparing, waiting for pickup
        await createOrder(conn, {
            user_id: cust2, assigned_to: emp1, status: 'ready',
            address: 'ביאליק 5, רמת גן', phone: '058-5555555',
            items: [
                { menu_item_id: 28, quantity: 3 },
                { menu_item_id: 31, quantity: 1 },
                { menu_item_id: 41, quantity: 2 },
            ],
        });

        // 5. Delivered — emp3 completed
        await createOrder(conn, {
            user_id: cust3, assigned_to: emp3, status: 'delivered',
            address: 'רוטשילד 100, תל אביב', phone: '050-6666666',
            items: [
                { menu_item_id: 29, quantity: 1 },
                { menu_item_id: 34, quantity: 1 },
                { menu_item_id: 38, quantity: 2 },
            ],
        });

        await createOrder(conn, {
            user_id: cust4, assigned_to: emp2, status: 'delivered',
            address: 'דיזנגוף 88, תל אביב', phone: '052-7777777',
            items: [
                { menu_item_id: 33, quantity: 2 },
                { menu_item_id: 39, quantity: 1 },
                { menu_item_id: 37, quantity: 1 },
            ],
        });

        await createOrder(conn, {
            user_id: cust1, assigned_to: emp1, status: 'delivered',
            address: 'הרצל 22, תל אביב', phone: '053-4444444',
            items: [
                { menu_item_id: 27, quantity: 2 },
                { menu_item_id: 30, quantity: 1 },
                { menu_item_id: 40, quantity: 1 },
            ],
        });

        // 6. Cancelled
        await createOrder(conn, {
            user_id: cust2, assigned_to: emp3, status: 'cancelled',
            address: 'ביאליק 5, רמת גן', phone: '058-5555555',
            items: [
                { menu_item_id: 31, quantity: 1 },
                { menu_item_id: 41, quantity: 1 },
            ],
        });

        await conn.commit();
        console.log('✅ Seed completed successfully!');
        console.log('');
        console.log('👨‍🍳 Employee logins:');
        console.log('  moshe.cohen@yami.co.il   / Employee123!');
        console.log('  dana.levi@yami.co.il     / Employee123!');
        console.log('  oren.david@yami.co.il    / Employee123!');
        console.log('');
        console.log('👤 Customer logins:');
        console.log('  yael.shapira@gmail.com   / Customer123!');
        console.log('  noam.bar@gmail.com       / Customer123!');
    } catch (err) {
        await conn.rollback();
        console.error('❌ Seed failed:', err.message);
    } finally {
        conn.release();
        process.exit(0);
    }
})();

const db = require('../config/db');
const bcrypt = require('bcrypt');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


async function createEmployee(data) {
    const { email, password, name, phone } = data;

    if (!email || !password || !name) {
        throw Object.assign(new Error('שם, אימייל וסיסמה הם שדות חובה'), { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
        throw Object.assign(new Error('פורמט האימייל אינו תקין'), { status: 400 });
    }
    if (password.length < 8) {
        throw Object.assign(new Error('הסיסמה חייבת להכיל לפחות 8 תווים'), { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [normalizedEmail]
    );
    if (existing.length > 0) {
        throw Object.assign(new Error('כתובת האימייל כבר קיימת במערכת'), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO users (email, name, phone, role) VALUES (?, ?, ?, 'employee')`,
            [normalizedEmail, name.trim(), phone?.trim() || null]
        );

        const userId = result.insertId;

        await connection.query(
            'INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)',
            [userId, hashed]
        );

        await connection.commit();

        return { id: userId, email: normalizedEmail, name: name.trim(), role: 'employee' };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}


async function getEmployees() {
    const [employees] = await db.query(
        `SELECT u.id, u.email, u.name, u.phone, u.created_at,
                COUNT(CASE WHEN o.status IN ('confirmed','preparing','ready') THEN 1 END) AS active_orders,
                COUNT(CASE WHEN o.status = 'delivered' THEN 1 END)                        AS delivered_orders,
                COUNT(o.id)                                                                AS total_orders
         FROM users u
         LEFT JOIN orders o ON o.assigned_to = u.id
         WHERE u.role = 'employee'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
    );
    return employees;
}


async function deactivateEmployee(employeeId) {
    const [rows] = await db.query(
        `SELECT id, role FROM users WHERE id = ? AND role = 'employee'`,
        [employeeId]
    );

    if (rows.length === 0) {
        throw Object.assign(new Error('עובד לא נמצא'), { status: 404 });
    }

    await db.query(
        `UPDATE users SET role = 'customer' WHERE id = ?`,
        [employeeId]
    );

    return { message: 'העובד הוסר בהצלחה' };
}


async function reactivateEmployee(employeeId) {
    const [rows] = await db.query(
        `SELECT id, role FROM users WHERE id = ?`,
        [employeeId]
    );

    if (rows.length === 0) {
        throw Object.assign(new Error('משתמש לא נמצא'), { status: 404 });
    }

    if (rows[0].role === 'admin') {
        throw Object.assign(new Error('לא ניתן לשנות תפקיד של אדמין'), { status: 403 });
    }

    await db.query(
        `UPDATE users SET role = 'employee' WHERE id = ?`,
        [employeeId]
    );

    return { message: 'העובד הופעל מחדש' };
}

module.exports = { createEmployee, getEmployees, deactivateEmployee, reactivateEmployee };

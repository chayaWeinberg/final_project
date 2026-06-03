const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function createAccessToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

function createRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(userId, token) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.promise().query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
}

async function login(data) {
    const email = data.email?.trim().toLowerCase();
    const password = data.password;

    if (!email || !password) throw new Error('Missing email or password');

    const [rows] = await db.promise().query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    if (rows.length === 0) throw new Error('Invalid email or password');

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Invalid email or password');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken();
    await saveRefreshToken(user.id, refreshToken);

    return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, role: user.role }
    };
}

async function register(data) {
    const email = data.email?.trim().toLowerCase();
    const password = data.password;
    const name = data.name?.trim();
    const phone = data.phone?.trim();
    const { city, street, buildingNumber, floor, apartmentNumber } = data;

    if (!email || !password || !name) throw new Error('Missing required fields');
    if (password.length < 8) throw new Error('Password must contain at least 8 characters');

    const [existing] = await db.promise().query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );
    if (existing.length > 0) throw new Error('User already exists');

    const hashed = await bcrypt.hash(password, 10);
    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            'INSERT INTO users (email, password_hash, name, phone) VALUES (?, ?, ?, ?)',
            [email, hashed, name, phone]
        );

        const userId = userResult.insertId;

        await connection.query(
            'INSERT INTO addresses (user_id, city, street, building_number, floor, apartment_number) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, city, street, buildingNumber, floor, apartmentNumber]
        );

        await connection.commit();

        const user = { id: userId, name, role: 'customer' };
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken();
        await saveRefreshToken(userId, refreshToken);

        return { accessToken, refreshToken, user };

    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function refresh(token) {
    if (!token) throw Object.assign(new Error('No refresh token'), { status: 401 });

    const [rows] = await db.promise().query(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [token]
    );

    if (rows.length === 0) throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });

    const { user_id } = rows[0];

    const [users] = await db.promise().query(
        'SELECT id, role FROM users WHERE id = ?',
        [user_id]
    );

    const accessToken = createAccessToken(users[0]);
    return { accessToken };
}

async function logout(token) {
    if (token) {
        await db.promise().query(
            'DELETE FROM refresh_tokens WHERE token = ?',
            [token]
        );
    }
}

module.exports = { login, register, refresh, logout };

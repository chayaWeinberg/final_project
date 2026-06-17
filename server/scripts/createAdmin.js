/**
 * סקריפט ליצירת מנהל ראשון במסד הנתונים.
 * הרצה: node scripts/createAdmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const db = require('../config/db');
const bcrypt = require('bcrypt');

const ADMIN_EMAIL    = 'admin@yami.com';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_NAME     = 'מנהל ראשי';

async function createAdmin() {
    try {
        // Check if admin already exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [ADMIN_EMAIL]
        );

        if (existing.length > 0) {
            console.log(`✅ מנהל כבר קיים: ${ADMIN_EMAIL}`);
            process.exit(0);
        }

        const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [userResult] = await connection.query(
                "INSERT INTO users (email, name, role) VALUES (?, ?, 'admin')",
                [ADMIN_EMAIL, ADMIN_NAME]
            );

            await connection.query(
                'INSERT INTO user_credentials (user_id, password_hash) VALUES (?, ?)',
                [userResult.insertId, hashed]
            );

            await connection.commit();
            console.log('✅ מנהל נוצר בהצלחה!');
            console.log(`   אימייל: ${ADMIN_EMAIL}`);
            console.log(`   סיסמה: ${ADMIN_PASSWORD}`);
            console.log('   ⚠️  שנה את הסיסמה לאחר ההתחברות הראשונה!');
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error('❌ שגיאה:', err.message);
    } finally {
        process.exit(0);
    }
}

createAdmin();

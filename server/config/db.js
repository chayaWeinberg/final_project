require('dotenv').config();

const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
(async () => {
  try {
    const [rows] = await db.query('SELECT 1 as test');
    console.log('✅ Connected to MySQL successfully');
    console.log('Database test result:', rows[0]);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check:');
    console.error('1. MySQL server is running');
    console.error('2. Database credentials in .env file');
    console.error('3. Database exists');
  }
})();

module.exports = db;
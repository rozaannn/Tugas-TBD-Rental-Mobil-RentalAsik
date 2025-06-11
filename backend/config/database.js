const mysql = require('mysql2'); // [cite: 9]
require('dotenv').config(); // [cite: 10]

// Create connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rozanganteng31',
    database: process.env.DB_NAME || 'database_rentalasik',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}); // [cite: 10]

// Promisify for async/await usage
const promisePool = pool.promise(); // [cite: 11]

module.exports = promisePool; // [cite: 11]
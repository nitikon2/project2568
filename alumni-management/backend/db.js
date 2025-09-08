const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'alumni_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection established successfully');
        connection.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit if cannot connect to database
    }
};

testConnection();

module.exports = pool;

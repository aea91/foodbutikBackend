const mysql = require('mysql2/promise');

const pool = mysql.createPool({
      host: '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
});

// Test connection
pool.getConnection()
      .then(connection => {
            console.log('Database connected successfully');
            connection.release();
      })
      .catch(err => {
            console.error('Database connection error:', err);
      });

module.exports = pool;

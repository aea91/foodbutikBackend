const mysql = require('mysql2');

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

// Bağlantıyı test et
pool.getConnection((err, connection) => {
      if (err) {
            console.error('Database connection error:', err);
            throw err;
      } else {
            console.log('Successfully connected to the database.');
            connection.release();
      }
});

module.exports = pool.promise();

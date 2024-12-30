/**
 * MySQL veritabanı bağlantı yapılandırması
 * Connection pool kullanarak veritabanı bağlantılarını yönetir
 */
const mysql = require('mysql2/promise');

// MySQL bağlantı havuzu oluştur
const pool = mysql.createPool({
      host: '127.0.0.1',          // Veritabanı sunucusu
      user: process.env.DB_USER,   // Kullanıcı adı (.env'den)
      password: process.env.DB_PASSWORD, // Şifre (.env'den)
      database: process.env.DB_NAME,     // Veritabanı adı
      port: 3306,                 // MySQL port
      waitForConnections: true,   // Bağlantı beklemede kalabilir
      connectionLimit: 10,        // Maksimum bağlantı sayısı
      queueLimit: 0              // Sınırsız kuyruk
});

// Bağlantıyı test et
pool.getConnection()
      .then(connection => {
            console.log('Database connected successfully');
            connection.release();
      })
      .catch(err => {
            console.error('Database connection error:', err);
      });

module.exports = pool;

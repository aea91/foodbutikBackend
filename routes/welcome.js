/**
 * Karşılama sayfası route tanımlamaları
 * API'nin çalışıp çalışmadığını kontrol etmek için kullanılır
 */
const express = require('express');
const router = express.Router();

/**
 * Karşılama mesajı döndürür
 * @route GET /api/welcome
 * @returns {Object} Karşılama mesajı ve API versiyonu
 */
router.get('/', (req, res) => {
      res.json({
            message: 'Welcome to FoodButik API',
            version: '1.0.0',
            status: 'active',
            timestamp: new Date().toISOString()
      });
});

module.exports = router; 
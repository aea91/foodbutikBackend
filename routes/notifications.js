const express = require('express');
const router = express.Router();

router.post('/register-token', (req, res) => {
      // Token kayıt mantığı buraya gelecek
      res.json({ message: 'Token registration endpoint' });
});

router.post('/send', (req, res) => {
      // Bildirim gönderme mantığı buraya gelecek
      res.json({ message: 'Send notification endpoint' });
});

module.exports = router; 
/**
 * Bildirim işlemleri için route tanımlamaları
 * FCM token kayıt ve bildirim gönderme endpoint'lerini içerir
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// FCM token kaydet
router.post('/register-token', notificationController.registerToken);

// Tekil bildirim gönder
router.post('/send', notificationController.sendNotification);

// Toplu bildirim gönder
router.post('/send-bulk', notificationController.sendBulkNotifications);

module.exports = router; 
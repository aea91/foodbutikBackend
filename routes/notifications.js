const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');

// Validation middleware
const tokenValidation = [
      body('userId').isInt(),
      body('token').notEmpty(),
      body('platform').optional().isIn(['android', 'ios'])
];

const notificationValidation = [
      body('userId').isInt(),
      body('title').notEmpty(),
      body('body').notEmpty(),
      body('data').optional().isObject()
];

const bulkNotificationValidation = [
      body('userIds').isArray(),
      body('title').notEmpty(),
      body('body').notEmpty(),
      body('data').optional().isObject()
];

// Routes
router.post('/register-token', tokenValidation, notificationController.registerToken);
router.post('/send', notificationValidation, notificationController.sendNotification);
router.post('/send-bulk', bulkNotificationValidation, notificationController.sendBulkNotifications);

module.exports = router; 
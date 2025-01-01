/**
 * Ana route yapılandırması
 * Tüm API route'larını tek bir noktadan yönetir
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { body } = require('express-validator');

// Route modüllerini import et
const authController = require('../controllers/authController');
const notificationRoutes = require('./routes/notifications');
const welcomeRoutes = require('./routes/welcome');
const userRoutes = require('./routes/users');

// Public endpoints (token gerektirmez)
router.post('/auth/register', [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);
router.get('/welcome', welcomeRoutes);

// Diğer tüm route'lar için auth middleware'i uygula
router.use(authMiddleware);

// Protected routes (token gerektirir)
router.use('/auth', require('./routes/auth'));  // login, register ve şifre işlemleri dışındaki auth işlemleri
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router; 
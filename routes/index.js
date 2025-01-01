/**
 * Ana route yapılandırması
 * Tüm API route'larını tek bir noktadan yönetir
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { body } = require('express-validator');

// Route modüllerini import et
const authRoutes = require('./auth');
const notificationRoutes = require('./notifications');
const welcomeRoutes = require('./welcome');
const userRoutes = require('./users');
const authController = require('../controllers/authController');

// Public endpoints (token gerektirmez)
router.post('/auth/register', [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('phone')
            .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
            .optional(),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

router.post('/auth/login', authController.login);

// Şifre sıfırlama (public)
router.post('/auth/forgot-password', [
      body('email').isEmail().withMessage('Please enter a valid email')
], authController.forgotPassword);

router.post('/auth/reset-password', [
      body('token').notEmpty().withMessage('Reset token is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.resetPassword);

// Welcome endpoint (public)
router.get('/welcome', welcomeRoutes);

// Facebook OAuth rotaları (public)
router.get('/auth/facebook', authRoutes);
router.get('/auth/facebook/callback', authRoutes);

// Buradan sonraki tüm route'lar için auth middleware'i uygula
router.use(authMiddleware);

// Protected routes (token gerektirir)
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

// Protected auth routes (veri silme gibi işlemler için)
router.post('/auth/facebook/data-deletion', authRoutes);
router.get('/auth/facebook/data-deletion-status', authRoutes);

module.exports = router; 
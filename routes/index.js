/**
 * Ana route yapılandırması
 * Tüm API route'larını tek bir noktadan yönetir
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

// Route modüllerini import et
const authRoutes = require('./auth');
const notificationRoutes = require('./notifications');
const welcomeRoutes = require('./welcome');
const userRoutes = require('./users');

// Public endpoints (token gerektirmez)
router.post('/auth/register', authRoutes);
router.post('/auth/login', authRoutes);
router.post('/auth/forgot-password', authRoutes);
router.post('/auth/reset-password', authRoutes);
router.get('/welcome', welcomeRoutes);

// Diğer tüm route'lar için auth middleware'i uygula
router.use(authMiddleware);

// Protected routes (token gerektirir)
router.use('/auth', authRoutes);  // login, register ve şifre işlemleri dışındaki auth işlemleri
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router; 
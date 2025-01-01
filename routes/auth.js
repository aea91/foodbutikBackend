/**
 * Kimlik doğrulama işlemleri için route tanımlamaları
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const passport = require('../config/passport');

/**
 * Public routes (token gerektirmez)
 */
// Kullanıcı kaydı
router.post('/register', [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

// Şifre sıfırlama isteği
router.post('/forgot-password', [
      body('email').isEmail().withMessage('Please enter a valid email')
], authController.forgotPassword);

// Şifre sıfırlama linki doğrulama
router.post('/reset-password', [
      body('token').notEmpty().withMessage('Reset token is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], authController.resetPassword);

/**
 * Protected routes (token gerektirir)
 */
// Facebook OAuth rotaları
router.get('/facebook', passport.authenticate('facebook', {
      scope: ['email']
}));

// Facebook callback
router.get('/facebook/callback',
      passport.authenticate('facebook', {
            session: false,
            failureRedirect: '/login'
      }),
      authController.facebookCallback
);

// Facebook veri silme webhook'u
router.post('/facebook/data-deletion', authController.handleDataDeletion);

// Facebook veri silme durumu kontrolü
router.get('/facebook/data-deletion-status', authController.getDataDeletionStatus);

module.exports = router; 
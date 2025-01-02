/**
 * Kimlik doğrulama işlemleri için route tanımlamaları
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

/**
 * Public routes (token gerektirmez)
 */
// Kullanıcı kaydı
router.post('/register', [
      body('name').trim().notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Please enter a valid email'),
      body('phone')
            .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits')
            .optional(),
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







module.exports = router; 
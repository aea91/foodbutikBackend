/**
 * Kullanıcı işlemleri için route tanımlamaları
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

// Auth middleware'i ekle
router.use(authMiddleware);

// Tüm kullanıcıları listele (sayfalama ile)
router.get('/', userController.getUsers);

// Kullanıcı ara (sayfalama ile)
router.get('/search', userController.searchUsers);

// Kullanıcı güncelle
router.put('/:userId', [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
      body('email').optional().isEmail().withMessage('Please enter a valid email'),
      body('phone')
            .optional()
            .matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
      body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], userController.updateUser);

// Kullanıcı sil
router.delete('/:userId', userController.deleteUser);

module.exports = router; 
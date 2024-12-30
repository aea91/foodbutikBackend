/**
 * Kullanıcı işlemleri için route tanımlamaları
 * Kullanıcı listeleme ve arama endpoint'lerini içerir
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Tüm kullanıcıları listele (sayfalama ile)
router.get('/', userController.getUsers);

// Kullanıcı ara (sayfalama ile)
router.get('/search', userController.searchUsers);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const passport = require('../config/passport');

// Validation middleware
const registerValidation = [
      body('name').notEmpty().trim(),
      body('email').isEmail(),
      body('password').isLength({ min: 6 })
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.get('/facebook', passport.authenticate('facebook', {
      scope: ['email', 'public_profile']
}));
router.get('/facebook/callback',
      passport.authenticate('facebook', { session: false }),
      authController.facebookCallback
);

// Data deletion routes
router.post('/facebook/data-deletion', authController.handleDataDeletion);
router.get('/facebook/data-deletion-status', authController.getDataDeletionStatus);

module.exports = router; 
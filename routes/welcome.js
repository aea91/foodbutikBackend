const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
      res.json({
            message: 'Welcome to the Authentication API',
            version: '1.0.0',
            endpoints: {
                  auth: {
                        register: '/api/auth/register',
                        login: '/api/auth/login',
                        facebook: '/api/auth/facebook'
                  },
                  notifications: {
                        registerToken: '/api/notifications/register-token',
                        send: '/api/notifications/send'
                  }
            }
      });
});

module.exports = router; 
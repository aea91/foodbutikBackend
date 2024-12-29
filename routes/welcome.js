const express = require('express');
const router = express.Router();
const BaseResponse = require('../models/base/BaseResponse');

router.get('/', (req, res) => {
      res.json(
            BaseResponse.success({
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
            }, 'Welcome to the Authentication API')
      );
});

module.exports = router; 
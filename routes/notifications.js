const express = require('express');
const router = express.Router();
const BaseResponse = require('../models/base/BaseResponse');

router.post('/register-token', (req, res) => {
      res.json(
            BaseResponse.success(null, 'Token registration endpoint')
      );
});

router.post('/send', (req, res) => {
      res.json(
            BaseResponse.success(null, 'Send notification endpoint')
      );
});

module.exports = router; 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
const BaseResponse = require('../models/base/BaseResponse');

exports.register = async (req, res) => {
      try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                  return res.status(400).json(
                        BaseResponse.error(null, errors.array()[0].msg)
                  );
            }

            const { name, email, password } = req.body;
            console.log('Register attempt for:', { name, email });

            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length > 0) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'Email already exists')
                  );
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const [result] = await db.execute(
                  'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                  [name, email, hashedPassword]
            );

            const token = jwt.sign(
                  { userId: result.insertId },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            res.status(201).json(
                  BaseResponse.success({
                        token,
                        userId: result.insertId
                  }, 'User created successfully')
            );
      } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json(
                  BaseResponse.error(error)
            );
      }
};

exports.login = async (req, res) => {
      try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);

            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                  return res.status(401).json(
                        BaseResponse.error(null, 'Authentication failed')
                  );
            }

            const user = users[0];
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                  return res.status(401).json(
                        BaseResponse.error(null, 'Authentication failed')
                  );
            }

            const token = jwt.sign(
                  { userId: user.id },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            res.json(
                  BaseResponse.success({
                        token,
                        userId: user.id
                  }, 'Login successful')
            );
      } catch (error) {
            console.error('Login error:', error);
            res.status(500).json(
                  BaseResponse.error(error)
            );
      }
};

exports.facebookCallback = async (req, res) => {
      // Facebook authentication logic
}; 
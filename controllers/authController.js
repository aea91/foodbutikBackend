const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');

exports.register = async (req, res) => {
      try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                  return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password } = req.body;

            // Check if user exists
            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length > 0) {
                  return res.status(400).json({ message: 'Email already exists' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const [result] = await db.execute(
                  'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                  [name, email, hashedPassword]
            );

            const token = jwt.sign(
                  { userId: result.insertId },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            res.status(201).json({
                  message: 'User created successfully',
                  token,
                  userId: result.insertId
            });
      } catch (error) {
            res.status(500).json({ message: 'Server error' });
      }
};

exports.login = async (req, res) => {
      try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email); // Debug log

            // Find user
            const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            console.log('Found users:', users); // Debug log

            if (users.length === 0) {
                  return res.status(401).json({ message: 'Authentication failed' });
            }

            const user = users[0];

            // Check password
            const isValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isValid); // Debug log

            if (!isValid) {
                  return res.status(401).json({ message: 'Authentication failed' });
            }

            const token = jwt.sign(
                  { userId: user.id },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            res.json({
                  token,
                  userId: user.id
            });
      } catch (error) {
            console.error('Login error:', error); // Detailed error log
            res.status(500).json({
                  message: 'Server error',
                  error: error.message // Hata detayını client'a gönder (development için)
            });
      }
};

exports.facebookCallback = async (req, res) => {
      // Facebook authentication logic
}; 
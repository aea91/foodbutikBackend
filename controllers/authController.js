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
      try {
            const token = jwt.sign(
                  { userId: req.user.id },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            // Başarılı login sonrası yönlendirme URL'i
            const redirectUrl = `foodbutik://login-success?token=${token}&userId=${req.user.id}`;

            res.json(
                  BaseResponse.success({
                        token,
                        userId: req.user.id,
                        user: {
                              name: req.user.name,
                              email: req.user.email,
                              profile_picture: req.user.profile_picture
                        }
                  }, 'Facebook login successful')
            );
      } catch (error) {
            console.error('Facebook callback error:', error);
            res.status(500).json(
                  BaseResponse.error(error)
            );
      }
};

exports.handleDataDeletion = async (req, res) => {
      try {
            const { signed_request } = req.body;

            // Facebook'tan gelen signed request'i doğrula
            if (!signed_request) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'Signed request is required')
                  );
            }

            // User ID'yi al
            const [user] = await db.execute(
                  'SELECT * FROM users WHERE facebook_id = ?',
                  [req.body.user_id]
            );

            if (user) {
                  // Kullanıcı verilerini sil
                  await db.execute('DELETE FROM push_tokens WHERE user_id = ?', [user.id]);
                  await db.execute('DELETE FROM users WHERE id = ?', [user.id]);
            }

            // Facebook'a başarılı yanıt dön
            res.json({
                  url: `http://104.248.36.45/api/auth/facebook/data-deletion-status?id=${req.body.user_id}`,
                  confirmation_code: req.body.user_id
            });
      } catch (error) {
            console.error('Data deletion error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

exports.getDataDeletionStatus = async (req, res) => {
      try {
            const { id } = req.query;

            // Silme işleminin durumunu kontrol et
            const [user] = await db.execute(
                  'SELECT * FROM users WHERE facebook_id = ?',
                  [id]
            );

            const status = user ? 'pending' : 'complete';

            res.json({ status });
      } catch (error) {
            console.error('Data deletion status error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
}; 
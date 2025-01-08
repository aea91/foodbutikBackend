/**
 * Kimlik doğrulama işlemlerini yöneten controller
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
const BaseResponse = require('../models/base/BaseResponse');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const DATA_DELETION_BASE_URL = process.env.NODE_ENV === 'production'
      ? 'https://foodbutik.com'  // Production URL
      : 'http://104.248.36.45';  // Development URL

/**
 * Yeni kullanıcı kaydı
 * @param {Object} req - name, email, phone ve password bilgilerini içerir
 * @param {Object} res - Kayıt sonucunu ve JWT token döner
 */
exports.register = async (req, res) => {
      try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                  return res.status(400).json(
                        BaseResponse.error(null, errors.array()[0].msg)
                  );
            }

            const { name, email, phone, password } = req.body;

            // Email kontrolü
            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'Email already exists')
                  );
            }

            // Telefon kontrolü (eğer telefon varsa)
            if (phone) {
                  const existingPhone = await User.findByPhone(phone);
                  if (existingPhone) {
                        return res.status(400).json(
                              BaseResponse.error(null, 'Phone number already exists')
                        );
                  }
            }

            const user = await User.create({ name, email, phone, password });

            const token = jwt.sign(
                  { userId: user.id },
                  process.env.JWT_SECRET,
                  { expiresIn: '24h' }
            );

            res.status(201).json(
                  BaseResponse.success({
                        token,
                        userId: user.id
                  }, 'User created successfully')
            );
      } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json(
                  BaseResponse.error(error)
            );
      }
};

/**
 * Kullanıcı girişi
 * @param {Object} req - email ve password bilgilerini içerir
 * @param {Object} res - Giriş sonucunu ve JWT token döner
 */
exports.login = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { email, password } = req.body;
            console.log('Login attempt for:', email);

            const [users] = await connection.query(
                  'SELECT * FROM users WHERE email = ?',
                  [email]
            );

            // Kullanıcı bulunamadı veya şifre yanlış
            if (users.length === 0) {
                  return res.json(
                        BaseResponse.error(null, 'Email or password is incorrect')
                  );
            }

            const user = users[0];
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                  return res.json(
                        BaseResponse.error(null, 'Email or password is incorrect')
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
      } finally {
            connection.release();
      }
};

/**
 * Şifre sıfırlama isteği
 * @param {Object} req - email bilgisini içerir
 * @param {Object} res - İşlem sonucunu döner
 */
exports.forgotPassword = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { email } = req.body;

            // Kullanıcıyı kontrol et
            const [users] = await connection.query(
                  'SELECT * FROM users WHERE email = ?',
                  [email]
            );

            if (users.length === 0) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'User not found')
                  );
            }

            // Reset token oluştur
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 saat geçerli

            // Token'ı kaydet
            await connection.query(
                  'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
                  [resetToken, resetTokenExpiry, email]
            );

            // Email gönderimi Promise olarak arka planda çalışacak
            Promise.resolve().then(() => {
                  const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                              user: process.env.SMTP_USER,
                              pass: process.env.SMTP_PASS
                        }
                  });

                  const resetUrl = `http://104.248.36.45/reset-password.html?token=${resetToken}`;

                  const mailOptions = {
                        from: process.env.SMTP_USER,
                        to: email,
                        subject: 'FoodButik - Şifre Sıfırlama',
                        html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333;">Şifre Sıfırlama İsteği</h2>
                            <p>Merhaba,</p>
                            <p>FoodButik hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
                            <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" 
                                   style="background-color: #4CAF50; 
                                          color: white; 
                                          padding: 12px 24px; 
                                          text-decoration: none; 
                                          border-radius: 4px;">
                                    Şifremi Sıfırla
                                </a>
                            </div>
                            <p style="color: #666; font-size: 14px;">
                                Bu link 1 saat süreyle geçerlidir.
                                Eğer şifre sıfırlama talebinde bulunmadıysanız, bu emaili görmezden gelebilirsiniz.
                            </p>
                        </div>
                    `
                  };

                  return transporter.sendMail(mailOptions);
            })
                  .then(() => {
                        console.log('Reset password email sent to:', email);
                  })
                  .catch(error => {
                        console.error('Reset password email error:', error);
                  });

            res.json(
                  BaseResponse.success(
                        null,
                        'Şifre sıfırlama linki email adresinize gönderilecek'
                  )
            );
      } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
};

/**
 * Şifre sıfırlama
 * @param {Object} req - token ve yeni şifre bilgisini içerir
 * @param {Object} res - İşlem sonucunu döner
 */
exports.resetPassword = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { token, password } = req.body;

            // Token'ı kontrol et
            const [users] = await connection.query(
                  'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
                  [token]
            );

            if (users.length === 0) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'Invalid or expired reset token')
                  );
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 12);

            // Şifreyi güncelle ve token'ı temizle
            await connection.query(
                  'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
                  [hashedPassword, token]
            );

            res.json(
                  BaseResponse.success(
                        null,
                        'Password has been reset successfully'
                  )
            );
      } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
}; 
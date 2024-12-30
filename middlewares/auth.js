/**
 * JWT kimlik doğrulama middleware'i
 * Protected route'lar için token kontrolü yapar
 */
const jwt = require('jsonwebtoken');
const BaseResponse = require('../models/base/BaseResponse');

/**
 * JWT token kontrolü yapar
 * @param {Object} req - Express request objesi
 * @param {Object} res - Express response objesi
 * @param {Function} next - Sonraki middleware'e geçiş fonksiyonu
 */
const authMiddleware = (req, res, next) => {
      try {
            // Authorization header'ını kontrol et
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                  return res.status(401).json(
                        BaseResponse.error(null, 'No token provided')
                  );
            }

            // Token'ı ayıkla ve doğrula
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Kullanıcı ID'sini request'e ekle
            req.userId = decoded.userId;
            next();
      } catch (error) {
            return res.status(401).json(
                  BaseResponse.error(error, 'Invalid token')
            );
      }
};

module.exports = authMiddleware; 
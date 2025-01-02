/**
 * Kullanıcı işlemlerini yöneten controller
 * Kullanıcı listeleme ve arama işlemlerini yönetir
 */
const db = require('../config/database');
const BaseResponse = require('../models/base/BaseResponse');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Kullanıcıları listeler (sayfalama ile)
 * @param {Object} req - page, limit ve query parametrelerini içerir
 * @param {Object} res - Kullanıcı listesini döner
 */
exports.getUsers = async (req, res) => {
      try {
            const { query = '' } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const connection = await db.getConnection();
            try {
                  let countQuery = 'SELECT COUNT(*) as total FROM users';
                  let usersQuery = 'SELECT * FROM users';
                  let queryParams = [];

                  // Eğer arama sorgusu varsa
                  if (query.trim()) {
                        const searchTerm = query.trim();
                        // Kelime sınırları ile arama yap
                        countQuery += ' WHERE name REGEXP ?';
                        usersQuery += ' WHERE name REGEXP ?';
                        // \\b ile kelime sınırlarını belirt
                        queryParams.push(`\\b${searchTerm}\\b`);
                  }

                  usersQuery += ' ORDER BY created_at DESC LIMIT ?, ?';
                  queryParams.push(offset, limit);

                  const [countResult] = await connection.query(countQuery, queryParams.slice(0, -2));
                  const [users] = await connection.query(usersQuery, queryParams);

                  res.json(
                        BaseResponse.paginated(
                              users,
                              {
                                    page,
                                    limit,
                                    totalItems: countResult[0].total
                              },
                              'Users retrieved successfully'
                        )
                  );
            } finally {
                  connection.release();
            }
      } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

/**
 * Kullanıcıları arar (sayfalama ile)
 * @param {Object} req - query, page ve limit parametrelerini içerir
 * @param {Object} res - Arama sonuçlarını döner
 */
exports.searchUsers = async (req, res) => {
      try {
            const { query = '' } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Boş sorgu kontrolü
            if (!query.trim()) {
                  return res.json(
                        BaseResponse.paginated([], {
                              page,
                              limit,
                              totalItems: 0
                        }, 'No search query provided')
                  );
            }

            const searchPattern = `%${query.trim()}%`;

            // Önce bağlantıyı al
            const connection = await db.getConnection();

            try {
                  // Case-insensitive arama yap
                  const [countResult] = await connection.query(
                        'SELECT COUNT(*) as total FROM users WHERE LOWER(name) LIKE LOWER(?)',
                        [searchPattern]
                  );
                  const totalItems = countResult[0].total;

                  // Kullanıcıları ara (case-insensitive)
                  const [users] = await connection.query(
                        'SELECT id, name, email, profile_picture, created_at FROM users ' +
                        'WHERE LOWER(name) LIKE LOWER(?) ' +
                        'ORDER BY created_at DESC LIMIT ?, ?',
                        [searchPattern, offset, limit]
                  );

                  res.json(
                        BaseResponse.paginated(users, {
                              page,
                              limit,
                              totalItems
                        }, 'Users search completed')
                  );
            } finally {
                  connection.release();
            }
      } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

/**
 * Kullanıcı güncelleme
 * @param {Object} req - userId ve güncellenecek alanları içerir
 * @param {Object} res - Güncelleme sonucunu döner
 */
exports.updateUser = async (req, res) => {
      try {
            const { userId } = req.params;

            // Sadece kendi hesabını güncelleyebilir
            if (req.userId != userId) {
                  return res.status(403).json(
                        BaseResponse.error(null, 'You can only update your own account')
                  );
            }

            const user = await User.findById(userId);
            if (!user) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'User not found')
                  );
            }

            await user.update(req.body);

            res.json(
                  BaseResponse.success(
                        user,
                        'User updated successfully'
                  )
            );
      } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

/**
 * Kullanıcı silme
 * @param {Object} req - userId içerir
 * @param {Object} res - Silme sonucunu döner
 */
exports.deleteUser = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { userId } = req.params;

            // Kullanıcının varlığını kontrol et
            const [users] = await connection.query(
                  'SELECT * FROM users WHERE id = ?',
                  [userId]
            );

            if (users.length === 0) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'User not found')
                  );
            }

            // Sadece kendi hesabını silebilir
            if (req.userId != userId) {
                  return res.status(403).json(
                        BaseResponse.error(null, 'You can only delete your own account')
                  );
            }

            // İlişkili push token'ları sil
            await connection.query(
                  'DELETE FROM push_tokens WHERE user_id = ?',
                  [userId]
            );

            // Kullanıcıyı sil
            await connection.query(
                  'DELETE FROM users WHERE id = ?',
                  [userId]
            );

            res.json(
                  BaseResponse.success(
                        null,
                        'User deleted successfully'
                  )
            );
      } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
}; 
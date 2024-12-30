const db = require('../config/database');
const BaseResponse = require('../models/base/BaseResponse');

exports.getUsers = async (req, res) => {
      try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Toplam kayıt sayısını al
            const [rows] = await db.execute('SELECT COUNT(*) as total FROM users');
            const totalItems = rows[0].total;

            // Kullanıcıları getir
            const [users] = await db.execute(
                  'SELECT id, name, email, profile_picture, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
                  [limit, offset]
            );

            res.json(
                  BaseResponse.paginated(users, {
                        page,
                        limit,
                        totalItems
                  }, 'Users retrieved successfully')
            );
      } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

exports.searchUsers = async (req, res) => {
      try {
            const { query = '' } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            const searchPattern = `%${query}%`;

            // Arama kriterlerine göre toplam sayıyı al
            const [rows] = await db.execute(
                  'SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?',
                  [searchPattern, searchPattern]
            );
            const totalItems = rows[0].total;

            // Kullanıcıları ara
            const [users] = await db.execute(
                  'SELECT id, name, email, profile_picture, created_at FROM users ' +
                  'WHERE name LIKE ? OR email LIKE ? ' +
                  'ORDER BY created_at DESC LIMIT ? OFFSET ?',
                  [searchPattern, searchPattern, limit, offset]
            );

            res.json(
                  BaseResponse.paginated(users, {
                        page,
                        limit,
                        totalItems
                  }, 'Users search completed')
            );
      } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
}; 
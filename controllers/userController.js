const db = require('../config/database');
const BaseResponse = require('../models/base/BaseResponse');

exports.getUsers = async (req, res) => {
      try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // Önce bağlantıyı al
            const connection = await db.getConnection();

            try {
                  // Toplam kayıt sayısını al
                  const [countResult] = await connection.query('SELECT COUNT(*) as total FROM users');
                  const totalItems = countResult[0].total;

                  // Kullanıcıları getir
                  const [users] = await connection.query(
                        'SELECT id, name, email, profile_picture, created_at FROM users ORDER BY created_at DESC LIMIT ?, ?',
                        [offset, limit]
                  );

                  res.json(
                        BaseResponse.paginated(users, {
                              page,
                              limit,
                              totalItems
                        }, 'Users retrieved successfully')
                  );
            } finally {
                  connection.release(); // Bağlantıyı serbest bırak
            }
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

            // Önce bağlantıyı al
            const connection = await db.getConnection();

            try {
                  // Arama kriterlerine göre toplam sayıyı al
                  const [countResult] = await connection.query(
                        'SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?',
                        [searchPattern, searchPattern]
                  );
                  const totalItems = countResult[0].total;

                  // Kullanıcıları ara
                  const [users] = await connection.query(
                        'SELECT id, name, email, profile_picture, created_at FROM users ' +
                        'WHERE name LIKE ? OR email LIKE ? ' +
                        'ORDER BY created_at DESC LIMIT ?, ?',
                        [searchPattern, searchPattern, offset, limit]
                  );

                  res.json(
                        BaseResponse.paginated(users, {
                              page,
                              limit,
                              totalItems
                        }, 'Users search completed')
                  );
            } finally {
                  connection.release(); // Bağlantıyı serbest bırak
            }
      } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
}; 
/**
 * User Model
 * Kullanıcı ile ilgili tüm veritabanı işlemlerini yönetir
 */
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
      constructor(data) {
            this.id = data.id;
            this.name = data.name;
            this.email = data.email;
            this.phone = data.phone;
            this.password = data.password;
            this.facebook_id = data.facebook_id;
            this.profile_picture = data.profile_picture;
            this.created_at = data.created_at;
            this.reset_token = data.reset_token;
            this.reset_token_expiry = data.reset_token_expiry;
      }

      /**
       * Kullanıcı oluştur
       * @param {Object} userData - name, email, password bilgileri
       * @returns {Promise<User>}
       */
      static async create(userData) {
            const connection = await db.getConnection();
            try {
                  const hashedPassword = await bcrypt.hash(userData.password, 12);

                  const [result] = await connection.query(
                        'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
                        [userData.name, userData.email, userData.phone, hashedPassword]
                  );

                  const [user] = await connection.query(
                        'SELECT * FROM users WHERE id = ?',
                        [result.insertId]
                  );

                  return new User(user[0]);
            } finally {
                  connection.release();
            }
      }

      /**
       * Email ile kullanıcı bul
       * @param {string} email 
       * @returns {Promise<User>}
       */
      static async findByEmail(email) {
            const connection = await db.getConnection();
            try {
                  const [users] = await connection.query(
                        'SELECT * FROM users WHERE email = ?',
                        [email]
                  );
                  return users.length ? new User(users[0]) : null;
            } finally {
                  connection.release();
            }
      }

      /**
       * ID ile kullanıcı bul
       * @param {number} id 
       * @returns {Promise<User>}
       */
      static async findById(id) {
            const connection = await db.getConnection();
            try {
                  const [users] = await connection.query(
                        'SELECT * FROM users WHERE id = ?',
                        [id]
                  );
                  return users.length ? new User(users[0]) : null;
            } finally {
                  connection.release();
            }
      }

      /**
       * Telefon numarasına göre kullanıcı bul
       * @param {string} phone 
       * @returns {Promise<User>}
       */
      static async findByPhone(phone) {
            const connection = await db.getConnection();
            try {
                  const [users] = await connection.query(
                        'SELECT * FROM users WHERE phone = ?',
                        [phone]
                  );
                  return users.length ? new User(users[0]) : null;
            } finally {
                  connection.release();
            }
      }

      /**
       * Kullanıcıları listele
       * @param {number} page - Sayfa numarası
       * @param {number} limit - Sayfa başına kayıt
       * @returns {Promise<{users: User[], total: number}>}
       */
      static async list(page = 1, limit = 10) {
            const connection = await db.getConnection();
            try {
                  const offset = (page - 1) * limit;

                  const [countResult] = await connection.query('SELECT COUNT(*) as total FROM users');
                  const [users] = await connection.query(
                        'SELECT * FROM users ORDER BY created_at DESC LIMIT ?, ?',
                        [offset, limit]
                  );

                  return {
                        users: users.map(user => new User(user)),
                        total: countResult[0].total
                  };
            } finally {
                  connection.release();
            }
      }

      /**
       * Kullanıcı güncelle
       * @param {Object} updates - Güncellenecek alanlar
       * @returns {Promise<User>}
       */
      async update(updates) {
            const connection = await db.getConnection();
            try {
                  const updateFields = [];
                  const values = [];

                  Object.keys(updates).forEach(key => {
                        if (updates[key] !== undefined) {
                              updateFields.push(`${key} = ?`);
                              values.push(updates[key]);
                        }
                  });

                  if (updates.password) {
                        updates.password = await bcrypt.hash(updates.password, 12);
                  }

                  values.push(this.id);

                  await connection.query(
                        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
                        values
                  );

                  const [updatedUser] = await connection.query(
                        'SELECT * FROM users WHERE id = ?',
                        [this.id]
                  );

                  Object.assign(this, updatedUser[0]);
                  return this;
            } finally {
                  connection.release();
            }
      }

      /**
       * Kullanıcı sil
       * @returns {Promise<void>}
       */
      async delete() {
            const connection = await db.getConnection();
            try {
                  await connection.query(
                        'DELETE FROM push_tokens WHERE user_id = ?',
                        [this.id]
                  );
                  await connection.query(
                        'DELETE FROM users WHERE id = ?',
                        [this.id]
                  );
            } finally {
                  connection.release();
            }
      }

      /**
       * Şifre kontrolü
       * @param {string} password 
       * @returns {Promise<boolean>}
       */
      async verifyPassword(password) {
            return await bcrypt.compare(password, this.password);
      }

      /**
       * Şifre sıfırlama token'ı oluştur
       * @returns {Promise<string>}
       */
      async createPasswordResetToken() {
            const connection = await db.getConnection();
            try {
                  const token = crypto.randomBytes(32).toString('hex');
                  const expiry = new Date(Date.now() + 3600000); // 1 saat

                  await connection.query(
                        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
                        [token, expiry, this.id]
                  );

                  return token;
            } finally {
                  connection.release();
            }
      }

      /**
       * JSON dönüşümü için hassas verileri çıkar
       */
      toJSON() {
            const { password, reset_token, reset_token_expiry, ...user } = this;
            return user;
      }
}

module.exports = User; 
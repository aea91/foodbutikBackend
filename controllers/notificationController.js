/**
 * Bildirim işlemlerini yöneten controller
 * FCM token kayıt ve bildirim gönderme işlemlerini yönetir
 */

const db = require('../config/database');
const firebase = require('../config/firebase');
const BaseResponse = require('../models/base/BaseResponse');

/**
 * FCM token'ı kaydeder
 * @param {Object} req - userId, token ve platform bilgilerini içerir
 * @param {Object} res - Kayıt sonucunu döner
 */
exports.registerToken = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { userId, token, platform = 'android' } = req.body;

            // Validate token
            if (!token) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'FCM token is required')
                  );
            }

            // Delete old token if exists
            await connection.query(
                  'DELETE FROM push_tokens WHERE user_id = ?',
                  [userId]
            );

            // Save new token
            await connection.query(
                  'INSERT INTO push_tokens (user_id, token, platform) VALUES (?, ?, ?)',
                  [userId, token, platform]
            );

            // Verify token was saved
            const [savedTokens] = await connection.query(
                  'SELECT * FROM push_tokens WHERE user_id = ?',
                  [userId]
            );

            console.log('Saved token:', savedTokens[0]); // Debug için log

            res.json(
                  BaseResponse.success(
                        { userId, platform, token: savedTokens[0]?.token },
                        'Device token registered successfully'
                  )
            );
      } catch (error) {
            console.error('Token registration error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
};

/**
 * Tekil kullanıcıya bildirim gönderir
 * @param {Object} req - userId, title, body ve data bilgilerini içerir
 * @param {Object} res - Gönderim sonucunu döner
 */
exports.sendNotification = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { userId, title, body, data = {} } = req.body;

            // Get user's FCM token
            const [tokens] = await connection.query(
                  'SELECT token FROM push_tokens WHERE user_id = ?',
                  [userId]
            );

            if (!tokens.length) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'User has no registered device token')
                  );
            }

            // Prepare notification
            const message = {
                  notification: {
                        title,
                        body
                  },
                  data: {
                        ...data,
                        click_action: 'FLUTTER_NOTIFICATION_CLICK'
                  },
                  token: tokens[0].token,
                  android: {
                        priority: 'high',
                        notification: {
                              sound: 'default',
                              priority: 'high',
                              channelId: 'default'
                        }
                  },
                  apns: {
                        payload: {
                              aps: {
                                    sound: 'default',
                                    badge: 1
                              }
                        }
                  }
            };

            // Send notification using Firebase Messaging
            const response = await firebase.messaging().send(message);
            console.log('Successfully sent message:', response);

            res.json(
                  BaseResponse.success(
                        { messageId: response },
                        'Notification sent successfully'
                  )
            );
      } catch (error) {
            console.error('Send notification error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
};

/**
 * Toplu bildirim gönderir
 * @param {Object} req - userIds, title, body ve data bilgilerini içerir
 * @param {Object} res - Gönderim sonucunu döner
 */
exports.sendBulkNotifications = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { userIds, title, body, data = {} } = req.body;

            // Get tokens for all users
            const [tokens] = await connection.query(
                  'SELECT token FROM push_tokens WHERE user_id IN (?)',
                  [userIds]
            );

            if (tokens.length === 0) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'No registered devices found')
                  );
            }

            console.log('Found tokens:', tokens); // Debug için log

            const registrationTokens = tokens.map(t => t.token);

            // Prepare notification
            const message = {
                  notification: {
                        title,
                        body
                  },
                  data: {
                        ...data,
                        click_action: 'FLUTTER_NOTIFICATION_CLICK'
                  },
                  tokens: registrationTokens,
                  android: {
                        priority: 'high',
                        notification: {
                              sound: 'default',
                              priority: 'high',
                              channelId: 'default'
                        }
                  },
                  apns: {
                        payload: {
                              aps: {
                                    sound: 'default',
                                    badge: 1
                              }
                        }
                  }
            };

            console.log('Sending message:', message); // Debug için log

            // Send notifications
            const response = await firebase.messaging().sendMulticast(message);

            console.log('Firebase response:', response); // Debug için log

            res.json(
                  BaseResponse.success(
                        {
                              successCount: response.successCount,
                              failureCount: response.failureCount,
                              responses: response.responses,
                              sentTokens: registrationTokens // Debug için token'ları da dönelim
                        },
                        'Bulk notifications sent'
                  )
            );
      } catch (error) {
            console.error('Bulk notification error:', error);
            res.status(500).json(BaseResponse.error(error));
      } finally {
            connection.release();
      }
}; 
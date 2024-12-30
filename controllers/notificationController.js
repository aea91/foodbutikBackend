const db = require('../config/database');
const firebase = require('../config/firebase');
const BaseResponse = require('../models/base/BaseResponse');

exports.registerToken = async (req, res) => {
      try {
            const { userId, token, platform = 'android' } = req.body;

            // Validate token
            if (!token) {
                  return res.status(400).json(
                        BaseResponse.error(null, 'FCM token is required')
                  );
            }

            // Delete old token if exists
            await db.execute('DELETE FROM push_tokens WHERE user_id = ?', [userId]);

            // Save new token
            await db.execute(
                  'INSERT INTO push_tokens (user_id, token, platform) VALUES (?, ?, ?)',
                  [userId, token, platform]
            );

            res.json(
                  BaseResponse.success(
                        { userId, platform },
                        'Device token registered successfully'
                  )
            );
      } catch (error) {
            console.error('Token registration error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
};

exports.sendNotification = async (req, res) => {
      const connection = await db.getConnection();
      try {
            const { userId, title, body, data = {} } = req.body;

            const [tokens] = await connection.query(
                  'SELECT token FROM push_tokens WHERE user_id = ?',
                  [userId]
            );

            if (tokens.length === 0) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'User has no registered device')
                  );
            }

            const token = tokens[0].token;

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
                  token: token,
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

            // Send notification
            const response = await firebase.messaging().send(message);

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

exports.sendBulkNotifications = async (req, res) => {
      try {
            const { userIds, title, body, data = {} } = req.body;

            // Get tokens for all users
            const [tokens] = await db.execute(
                  'SELECT token FROM push_tokens WHERE user_id IN (?)',
                  [userIds]
            );

            if (tokens.length === 0) {
                  return res.status(404).json(
                        BaseResponse.error(null, 'No registered devices found')
                  );
            }

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

            // Send notifications
            const response = await firebase.messaging().sendMulticast(message);

            res.json(
                  BaseResponse.success(
                        {
                              successCount: response.successCount,
                              failureCount: response.failureCount,
                              responses: response.responses
                        },
                        'Bulk notifications sent'
                  )
            );
      } catch (error) {
            console.error('Bulk notification error:', error);
            res.status(500).json(BaseResponse.error(error));
      }
}; 
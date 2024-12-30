const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('./database');

passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://104.248.36.45/api/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
      const connection = await db.getConnection();
      try {
            const [users] = await connection.query(
                  'SELECT * FROM users WHERE facebook_id = ?',
                  [profile.id]
            );

            if (users.length > 0) {
                  // User exists, return user
                  return done(null, users[0]);
            }

            // Create new user
            const [result] = await connection.query(
                  'INSERT INTO users (name, email, facebook_id, profile_picture) VALUES (?, ?, ?, ?)',
                  [
                        profile.displayName,
                        profile.emails?.[0]?.value || null,
                        profile.id,
                        profile.photos?.[0]?.value || null
                  ]
            );

            const newUser = {
                  id: result.insertId,
                  name: profile.displayName,
                  email: profile.emails?.[0]?.value,
                  facebook_id: profile.id,
                  profile_picture: profile.photos?.[0]?.value
            };

            return done(null, newUser);
      } catch (error) {
            return done(error);
      } finally {
            connection.release();
      }
}));

module.exports = passport; 
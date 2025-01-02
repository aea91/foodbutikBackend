/**
 * Firebase Admin SDK yapılandırması
 */
const admin = require('firebase-admin');
const path = require('path');

// Firebase servis hesabı anahtarını yükle
const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

async function initializeFirebase() {
      try {
            // Eğer önceden başlatılmış uygulama varsa kontrol et
            if (!admin.apps.length) {
                  // Firebase Admin SDK'yı başlat
                  const app = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                  });
                  console.log('Firebase initialized successfully:', app.name);
            } else {
                  console.log('Firebase already initialized:', admin.app().name);
            }

            return admin;
      } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
      }
}

// Firebase'i hemen başlat
initializeFirebase().catch(console.error);

module.exports = {
      initializeFirebase,
      admin
}; 
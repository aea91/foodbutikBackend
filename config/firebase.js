/**
 * Firebase Admin SDK yapılandırması
 * Bu modül Firebase Cloud Messaging (FCM) için gerekli yapılandırmayı sağlar
 */
const admin = require('firebase-admin');
const path = require('path');

// Mevcut uygulamaları temizle
if (admin.apps.length) {
      admin.apps.forEach(app => app.delete());
}

try {
      // Firebase servis hesabı anahtarını yükle
      const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

      // Firebase Admin SDK'yı başlat
      admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
      });

      console.log('Firebase initialized successfully');
} catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
}

module.exports = admin; 
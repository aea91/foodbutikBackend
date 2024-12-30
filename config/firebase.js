/**
 * Firebase Admin SDK yapılandırması
 * Bu modül Firebase Cloud Messaging (FCM) için gerekli yapılandırmayı sağlar
 */
const admin = require('firebase-admin');
const path = require('path');

try {
      // Eğer önceden başlatılmış bir Firebase uygulaması varsa temizle
      if (admin.apps.length) {
            admin.app().delete();
      }

      // Firebase servis hesabı anahtarını yükle
      // Bu anahtar Firebase Console'dan oluşturulan JSON dosyasıdır
      const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

      // Firebase Admin SDK'yı başlat
      // credential: Kimlik doğrulama için servis hesabı kullan
      admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
      });

      console.log('Firebase initialized successfully with new credentials');
} catch (error) {
      console.error('Firebase initialization error:', error);
      throw error; // Uygulama başlatılırken hata olursa fırlat
}

module.exports = admin; 
/**
 * Firebase Admin SDK yapılandırması
 */
const admin = require('firebase-admin');
const path = require('path');

// Eğer önceden başlatılmış uygulama varsa temizle
if (admin.apps.length) {
      admin.apps.forEach(app => app && app.delete());
}

// Firebase servis hesabı anahtarını yükle
const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

// Firebase Admin SDK'yı başlat
const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
}, 'default'); // default app name ekledik

console.log('Firebase initialized successfully:', app.name);

// Başlatılan uygulamayı kontrol et
const initializedApp = admin.app();
if (initializedApp) {
      console.log('Firebase app is ready:', initializedApp.name);
}

module.exports = admin; 
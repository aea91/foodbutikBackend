/**
 * Firebase Admin SDK yapılandırması
 */
const admin = require('firebase-admin');
const path = require('path');

// Firebase servis hesabı anahtarını yükle
const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

// Firebase Admin SDK'yı başlat
const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
});

console.log('Firebase initialized successfully:', app.name);

module.exports = admin; 
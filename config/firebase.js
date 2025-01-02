/**
 * Firebase Admin SDK yapılandırması
 */
const admin = require('firebase-admin');
const path = require('path');

let firebaseApp = null;

// Firebase'i başlat
const initializeFirebase = async () => {
      try {
            // Mevcut uygulamaları temizle
            await Promise.all(admin.apps.map(app => app && app.delete()));

            // Firebase servis hesabı anahtarını yükle
            const serviceAccount = require(path.join(__dirname, 'firebase-key.json'));

            // Firebase Admin SDK'yı başlat
            firebaseApp = admin.initializeApp({
                  credential: admin.credential.cert(serviceAccount),
                  projectId: serviceAccount.project_id
            });

            console.log('Firebase initialized successfully:', firebaseApp.name);
            return firebaseApp;
      } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
      }
};

// Firebase'i başlat ve export et
initializeFirebase();
module.exports = admin; 
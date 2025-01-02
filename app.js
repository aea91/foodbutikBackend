/**
 * Ana uygulama dosyası
 * Express sunucusu yapılandırması ve route tanımlamalarını içerir
 */
const express = require('express');
const cors = require('cors');
const { initializeFirebase } = require('./config/firebase.js');
require('dotenv').config();

// Ana route modülünü import et
const routes = require('./routes');

const app = express();

// Middleware yapılandırması
app.use(cors());                    // Cross-Origin Resource Sharing
app.use(express.json());           // JSON request body parser

// Tüm API route'larını /api prefix'i ile yapılandır
app.use('/api', routes);

// Static dosyaları serve et
app.use(express.static('public'));

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
      try {
            await initializeFirebase();
            console.log(`Server running on port ${PORT}`);
      } catch (error) {
            console.error('Server startup error:', error);
            process.exit(1);
      }
}); 
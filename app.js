/**
 * Ana uygulama dosyası
 * Express sunucusu yapılandırması ve route tanımlamalarını içerir
 */
const express = require('express');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

// Ana route modülünü import et
const routes = require('./routes');

const app = express();

// Middleware yapılandırması
app.use(cors());                    // Cross-Origin Resource Sharing
app.use(express.json());           // JSON request body parser
app.use(passport.initialize());    // Passport kimlik doğrulama

// Tüm API route'larını /api prefix'i ile yapılandır
app.use('/api', routes);

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
}); 
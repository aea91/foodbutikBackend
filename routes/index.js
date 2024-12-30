/**
 * Ana route yapılandırması
 * Tüm API route'larını tek bir noktadan yönetir
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');

// Route modüllerini import et
const authRoutes = require('./auth');
const notificationRoutes = require('./notifications');
const welcomeRoutes = require('./welcome');
const userRoutes = require('./users');

/**
 * Route yapılandırmaları
 * Her endpoint'in prefix ve middleware'lerini tanımlar
 */
const routeConfig = [
      {
            path: '/auth',
            router: authRoutes,
            public: true // Kimlik doğrulama gerektirmez
      },
      {
            path: '/notifications',
            router: notificationRoutes,
            public: false // Kimlik doğrulama gerektirir
      },
      {
            path: '/users',
            router: userRoutes,
            public: false
      },
      {
            path: '/welcome',
            router: welcomeRoutes,
            public: true
      }
];

// Route'ları yapılandır
routeConfig.forEach(config => {
      if (config.public) {
            router.use(config.path, config.router);
      } else {
            router.use(config.path, authMiddleware, config.router);
      }
});

module.exports = router; 
# FoodButik Backend API

Node.js ve Express ile geliştirilmiş REST API.

## Proje Yapısı

foodbutikBackend/
├── config/
│ ├── database.js # MySQL bağlantı yapılandırması
│ ├── firebase.js # Firebase Admin SDK yapılandırması
│ ├── firebase-key.json # Firebase servis hesabı anahtarı
│ └── passport.js # Facebook OAuth yapılandırması
├── controllers/
│ ├── authController.js # Kimlik doğrulama işlemleri
│ ├── notificationController.js # Bildirim işlemleri
│ └── userController.js # Kullanıcı işlemleri
├── middlewares/
│ └── auth.js # JWT doğrulama middleware
├── models/
│ └── base/
│ └── BaseResponse.js # Standart API yanıt formatı
├── routes/
│ ├── auth.js # Kimlik doğrulama rotaları
│ ├── index.js # Ana rota yapılandırması
│ ├── notifications.js # Bildirim rotaları
│ ├── users.js # Kullanıcı rotaları
│ └── welcome.js # Karşılama rotası
├── .env # Ortam değişkenleri
├── app.js # Ana uygulama dosyası
└── README.md # Proje dokümantasyonu

## Özellikler

- JWT tabanlı kimlik doğrulama
- Facebook OAuth 2.0 entegrasyonu
- Firebase Cloud Messaging (FCM) bildirimleri
- MySQL veritabanı entegrasyonu
- Sayfalama ve arama desteği
- CORS güvenlik yapılandırması

## Kurulum

1. **Bağımlılıkları Yükle:**
bash
npm install


2. **Ortam Değişkenlerini Ayarla:**

bash
.env dosyasını düzenle
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ishez5601
DB_NAME=auth_system
JWT_SECRET=your_jwt_secret
FACEBOOK_APP_ID=464487789772307
FACEBOOK_APP_SECRET=3f662a1bfd2c6c0fb9c351be325e816a


3. **Firebase Yapılandırması:**
- Firebase Console'dan yeni servis hesabı anahtarı oluştur
- `config/firebase-key.json` dosyasına kaydet

4. **Veritabanını Oluştur:**

sql
-- users tablosu
CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(255),
email VARCHAR(255) UNIQUE,
password VARCHAR(255),
facebook_id VARCHAR(255),
profile_picture VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- push_tokens tablosu
CREATE TABLE push_tokens (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT,
token TEXT,
platform VARCHAR(10),
app_version VARCHAR(20),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);


5. **Uygulamayı Başlat:**


## API Endpoints

### Auth Endpoints
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/facebook` - Facebook ile giriş başlat
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

### Bildirim Endpoints
- `POST /api/notifications/register-token` - FCM token kaydet
- `POST /api/notifications/send` - Tekil bildirim gönder
- `POST /api/notifications/send-bulk` - Toplu bildirim gönder

### Kullanıcı Endpoints
- `GET /api/users` - Kullanıcıları listele (sayfalama ile)
- `GET /api/users/search` - Kullanıcı ara (sayfalama ile)

## Güvenlik

- JWT token doğrulaması
- Facebook OAuth güvenliği
- CORS yapılandırması
- SQL injection koruması
- Password hashing (bcrypt)
- Input validation

## Deployment

bash
PM2 ile yönetim
pm2 start app.js # Başlat
pm2 logs # Logları izle
pm2 restart app # Yeniden başlat
pm2 status # Durum kontrolü

## Hata Ayıklama

MySQL bağlantı testi
mysql -u root -p auth_system
Firebase bağlantı kontrolü
pm2 logs | grep "Firebase"
Token doğrulama testi
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://104.248.36.45/api/users

## Lisans

MIT
EOL




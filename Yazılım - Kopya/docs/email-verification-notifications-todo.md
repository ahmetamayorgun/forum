# Email Verification ve Bildirim Sistemi - To-Do List

## 📧 Email Verification Sistemi (Mailgun ile)

### 1. Mailgun Kurulumu ve Konfigürasyonu
- [ ] Mailgun hesabı oluşturma ve domain doğrulama
- [ ] Mailgun API key'lerini environment variables'a ekleme
- [ ] Mailgun SDK'sını projeye ekleme (`mailgun.js` veya `@mailgun/mailgun-js`)
- [ ] Email template'lerini hazırlama (HTML ve text versiyonları)
- [ ] Email gönderme servisini oluşturma (`src/lib/email.ts`)

### 2. Database Schema Güncellemeleri
- [ ] `profiles` tablosuna `email_verified` ve `verification_code` kolonları ekleme
- [ ] `verification_codes` tablosu oluşturma:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key)
  - `code` (VARCHAR, 6 karakter)
  - `expires_at` (TIMESTAMP)
  - `created_at` (TIMESTAMP)
  - `used_at` (TIMESTAMP, nullable)
- [ ] `notifications` tablosu oluşturma:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key)
  - `type` (VARCHAR: 'comment', 'like', 'mention', etc.)
  - `title` (VARCHAR)
  - `message` (TEXT)
  - `data` (JSONB, ek bilgiler için)
  - `read_at` (TIMESTAMP, nullable)
  - `created_at` (TIMESTAMP)
  - `email_sent` (BOOLEAN, default false)
  - `email_sent_at` (TIMESTAMP, nullable)

### 3. Backend Servisleri
- [ ] Email verification servisi oluşturma (`src/lib/emailVerification.ts`)
- [ ] Verification code oluşturma ve gönderme fonksiyonu
- [ ] Code doğrulama fonksiyonu (15 dakika geçerlilik kontrolü)
- [ ] Notification servisi oluşturma (`src/lib/notifications.ts`)
- [ ] Notification oluşturma ve gönderme fonksiyonları
- [ ] Email notification gönderme fonksiyonu

### 4. Frontend Güncellemeleri

#### AuthContext Güncellemeleri
- [ ] `signUp` fonksiyonunu güncelleme (email verification gerektir)
- [ ] `signIn` fonksiyonunu güncelleme (email verification kontrolü)
- [ ] `verifyEmail` fonksiyonu ekleme
- [ ] `resendVerificationCode` fonksiyonu ekleme
- [ ] User state'ine `email_verified` ekleme

#### Yeni Sayfalar ve Componentler
- [ ] `EmailVerification.tsx` sayfası oluşturma
- [ ] `VerificationCodeInput.tsx` componenti oluşturma
- [ ] `NotificationCenter.tsx` componenti oluşturma
- [ ] `NotificationBadge.tsx` componenti oluşturma
- [ ] `NotificationSettings.tsx` sayfası oluşturma

#### Mevcut Sayfaların Güncellenmesi
- [ ] `Register.tsx` - Email verification akışını entegre etme
- [ ] `Login.tsx` - Email verification kontrolü ekleme
- [ ] `Navbar.tsx` - Notification badge ekleme
- [ ] `Profile.tsx` - Email verification durumu gösterme

## 🔔 Bildirim Sistemi

### 1. Real-time Bildirimler
- [ ] Supabase real-time subscription kurulumu
- [ ] WebSocket bağlantısı için context oluşturma (`src/contexts/NotificationContext.tsx`)
- [ ] Browser notification API entegrasyonu
- [ ] Desktop notification izinleri yönetimi

### 2. Bildirim Türleri ve Tetikleyicileri
- [ ] **Yorum bildirimleri**: Kullanıcının başlığına yorum yapıldığında
- [ ] **Beğeni bildirimleri**: Kullanıcının başlığı/yorumu beğenildiğinde
- [ ] **Mention bildirimleri**: Kullanıcı bir yorumda @username ile etiketlendiğinde
- [ ] **Takip bildirimleri**: Kullanıcı takip edildiğinde
- [ ] **Sistem bildirimleri**: Admin tarafından gönderilen bildirimler

### 3. Bildirim Gösterimi
- [ ] Toast notification sistemi güncelleme
- [ ] Notification dropdown menüsü
- [ ] Notification listesi sayfası
- [ ] Bildirim okundu/okunmadı durumu
- [ ] Bildirim filtreleme (tümü, okunmamış, tür bazında)

### 4. Email Bildirimleri
- [ ] Email notification template'leri oluşturma
- [ ] Email gönderme zamanlaması (anında, günlük özet, haftalık özet)
- [ ] Email notification tercihleri (kullanıcı bazında)
- [ ] Email unsubscribe link'leri

## 🛠️ Teknik Implementasyon

### 1. Environment Variables
```env
# Mailgun Configuration
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_FROM_EMAIL=noreply@yourdomain.com

# Email Templates
EMAIL_VERIFICATION_TEMPLATE=email_verification
NOTIFICATION_TEMPLATE=notification

# Notification Settings
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_BROWSER_NOTIFICATIONS=true
ENABLE_DESKTOP_NOTIFICATIONS=true
```

### 2. Database Functions ve Triggers
- [ ] `create_verification_code()` function
- [ ] `cleanup_expired_codes()` function
- [ ] `create_notification()` function
- [ ] `send_email_notification()` function
- [ ] Triggers for automatic notification creation

### 3. API Endpoints (Supabase Functions)
- [ ] `/api/send-verification-email` - Email verification gönderme
- [ ] `/api/verify-email` - Email verification doğrulama
- [ ] `/api/resend-verification` - Verification code yeniden gönderme
- [ ] `/api/notifications` - Bildirimleri alma/güncelleme
- [ ] `/api/notification-preferences` - Bildirim tercihleri

### 4. Güvenlik ve Performans
- [ ] Rate limiting (email gönderme için)
- [ ] Email verification code brute force koruması
- [ ] Notification spam koruması
- [ ] Database index'leri (performans için)
- [ ] Email queue sistemi (büyük ölçek için)

## 📱 Kullanıcı Deneyimi

### 1. Email Verification Flow
- [ ] Kayıt sonrası email verification sayfası
- [ ] Verification code input formu
- [ ] Code yeniden gönderme seçeneği
- [ ] Verification başarılı/başarısız mesajları
- [ ] Email verification olmadan giriş yapma engeli

### 2. Notification UX
- [ ] Notification badge animasyonları
- [ ] Notification sound effects
- [ ] Notification grouping (aynı türdeki bildirimler)
- [ ] Notification mark as read/unread
- [ ] Notification deletion
- [ ] Notification preferences page

### 3. Responsive Design
- [ ] Mobile notification center
- [ ] Tablet notification layout
- [ ] Desktop notification positioning
- [ ] Notification accessibility (screen readers)

## 🧪 Test ve Deployment

### 1. Testing
- [ ] Email verification unit testleri
- [ ] Notification system integration testleri
- [ ] Email template testleri
- [ ] Browser notification testleri
- [ ] Mobile notification testleri

### 2. Monitoring ve Analytics
- [ ] Email delivery tracking
- [ ] Notification engagement metrics
- [ ] Email verification success rate
- [ ] Notification click-through rates
- [ ] Error logging ve monitoring

### 3. Deployment
- [ ] Environment variables production setup
- [ ] Email service production configuration
- [ ] Database migration scripts
- [ ] Rollback plan
- [ ] Performance monitoring

## 📋 Öncelik Sırası

### Faz 1 (Temel Email Verification)
1. Mailgun kurulumu
2. Database schema güncellemeleri
3. Email verification servisi
4. Basic email verification flow

### Faz 2 (Temel Bildirimler) ✅
1. ✅ Notification database
2. ✅ Real-time notification context
3. ✅ Basic notification UI
4. ✅ Comment ve like bildirimleri

### Faz 3 (Gelişmiş Özellikler)
1. Email notifications
2. Browser/Desktop notifications
3. Notification preferences
4. Advanced notification types

### Faz 4 (Optimizasyon)
1. Performance optimizations
2. Advanced analytics
3. A/B testing
4. User feedback integration

## 🔗 Faydalı Kaynaklar
- [Mailgun API Documentation](https://documentation.mailgun.com/)
- [Supabase Real-time Documentation](https://supabase.com/docs/guides/realtime)
- [Browser Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Email Template Best Practices](https://www.emailonacid.com/blog/article/email-development/email-coding-best-practices/)

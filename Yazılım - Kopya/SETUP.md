# 🚀 Forum Uygulaması Kurulum Rehberi

Bu rehber, Forum Uygulamasını sıfırdan kurmanız için adım adım talimatları içerir.

## 📋 Gereksinimler

- Node.js (v16 veya üzeri)
- npm veya yarn
- Supabase hesabı
- Git

## ⚡ Hızlı Kurulum

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd forum-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Supabase Projesi Oluşturun
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Proje URL'sini ve API anahtarını not edin

### 4. Veritabanını Kurun
Supabase SQL Editor'de sırasıyla şu dosyaları çalıştırın:

1. **`docs/supabase-setup.sql`** - Temel tablolar
2. **`docs/add-likes-system.sql`** - Beğeni sistemi  
3. **`docs/add-points-system.sql`** - Puan sistemi
4. **`docs/insert-sample-points.sql`** - Örnek veriler (opsiyonel)

### 5. Uygulamayı Başlatın
```bash
npm start
```

### 6. Tarayıcıda Açın
`http://localhost:3000` adresine gidin.

## 🔧 Detaylı Kurulum

### Supabase Konfigürasyonu

1. **Proje Ayarları**
   - Supabase Dashboard'da projenizi açın
   - Settings > API bölümüne gidin
   - Project URL ve anon public key'i kopyalayın

2. **Environment Variables**
   - `.env` dosyası oluşturun (gerekirse)
   - Supabase bilgilerini ekleyin

3. **Authentication**
   - Authentication > Settings
   - Site URL'yi `http://localhost:3000` olarak ayarlayın
   - Email confirmations'ı etkinleştirin

### Veritabanı Tabloları

Kurulum sonrasında şu tablolar oluşturulacak:

- `profiles` - Kullanıcı profilleri
- `topics` - Forum başlıkları
- `comments` - Yorumlar
- `topic_likes` - Başlık beğenileri
- `comment_likes` - Yorum beğenileri
- `user_points` - Kullanıcı puanları
- `points_history` - Puan geçmişi
- `member_level_history` - Üye seviyesi geçmişi

## 🧪 Test Etme

Puan sistemini test etmek için:
```bash
cd docs
node test-points-system.js
```

## 🚨 Sorun Giderme

### Yaygın Sorunlar

1. **"column reference is ambiguous"**
   - SQL dosyalarını güncel versiyonla değiştirin

2. **"function does not exist"**
   - Fonksiyonların tanımlandığı dosyayı tekrar çalıştırın

3. **Authentication hatası**
   - Supabase URL ve API anahtarını kontrol edin
   - Site URL ayarlarını kontrol edin

4. **RLS Policy hatası**
   - RLS politikalarının doğru çalıştırıldığından emin olun

## 📚 Ek Kaynaklar

- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [React Dokümantasyonu](https://reactjs.org/docs)
- [TypeScript Dokümantasyonu](https://www.typescriptlang.org/docs)

## 🤝 Destek

Sorun yaşarsanız:
1. Bu rehberi tekrar kontrol edin
2. Supabase ve React dokümantasyonlarını inceleyin
3. GitHub Issues'da sorun bildirin 
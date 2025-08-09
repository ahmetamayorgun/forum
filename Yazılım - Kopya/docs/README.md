# 📚 Dokümantasyon ve SQL Dosyaları

Bu klasör, Forum Uygulaması için gerekli tüm SQL dosyalarını ve dokümantasyonu içerir.

## 📋 Dosya Açıklamaları

### 🗄️ Veritabanı Kurulum Dosyaları

#### `supabase-setup.sql`
- **Açıklama**: Temel Supabase kurulumu
- **İçerik**: 
  - `profiles` tablosu
  - `topics` tablosu  
  - `comments` tablosu
  - Temel RLS politikaları
- **Kullanım**: İlk kurulumda çalıştırılmalı

#### `add-likes-system.sql`
- **Açıklama**: Beğeni sistemi kurulumu
- **İçerik**:
  - `topic_likes` tablosu
  - `comment_likes` tablosu
  - Beğeni fonksiyonları ve trigger'ları
- **Kullanım**: `supabase-setup.sql` sonrasında çalıştırılmalı

#### `add-points-system.sql`
- **Açıklama**: Puan sistemi kurulumu
- **İçerik**:
  - `user_points` tablosu
  - `points_history` tablosu
  - `member_level_history` tablosu
  - Puan hesaplama fonksiyonları
  - Üye seviyesi fonksiyonları
  - Otomatik trigger'lar
- **Kullanım**: `add-likes-system.sql` sonrasında çalıştırılmalı

### 📊 Veri Dosyaları

#### `insert-sample-points.sql`
- **Açıklama**: Örnek puan verileri
- **İçerik**: Mevcut kullanıcılar için rastgele puanlar
- **Kullanım**: Test amaçlı, opsiyonel

### 🧪 Test Dosyaları

#### `test-points-system.js`
- **Açıklama**: Puan sistemi test dosyası
- **İçerik**: Puan sisteminin tüm özelliklerini test eder
- **Kullanım**: `node test-points-system.js`

## 🚀 Kurulum Sırası

1. **`supabase-setup.sql`** - Temel tablolar
2. **`add-likes-system.sql`** - Beğeni sistemi
3. **`add-points-system.sql`** - Puan sistemi
4. **`insert-sample-points.sql`** - Örnek veriler (opsiyonel)

## ⚠️ Önemli Notlar

- SQL dosyalarını Supabase SQL Editor'de sırasıyla çalıştırın
- Her dosya bir öncekine bağımlıdır
- Test dosyasını çalıştırmadan önce `npm install @supabase/supabase-js` komutunu çalıştırın
- Supabase URL ve API anahtarlarını test dosyasında güncelleyin

## 🔧 Sorun Giderme

### Yaygın Hatalar

1. **"column reference is ambiguous"**
   - Çözüm: SQL dosyalarını güncel versiyonla değiştirin

2. **"column does not exist"**
   - Çözüm: Dosyaları doğru sırada çalıştırdığınızdan emin olun

3. **"function does not exist"**
   - Çözüm: Fonksiyonların tanımlandığı dosyayı tekrar çalıştırın

### Test Etme

Puan sistemini test etmek için:
```bash
cd docs
node test-points-system.js
```

Bu komut:
- Kullanıcı puanlarını kontrol eder
- Puan geçmişini görüntüler
- Üye seviyesi geçmişini kontrol eder
- İstatistikleri gösterir
- En yüksek puanlı kullanıcıları listeler 
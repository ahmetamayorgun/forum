# Bildirim Sistemi Hatası Düzeltme Rehberi

## Sorun
Üst menüdeki bildirimler kısmında "Bildirimler yüklenirken hata oluştu" mesajı görünüyor.

## Çözüm Adımları

### 1. Veritabanı Kurulumu
Supabase SQL Editor'da aşağıdaki scripti çalıştırın:

```sql
-- docs/fix-notification-error.sql dosyasının içeriğini buraya kopyalayın
```

Bu script:
- Gerekli tabloları oluşturur (`notifications`, `notification_preferences`)
- Index'leri oluşturur
- RLS (Row Level Security) politikalarını ayarlar
- PostgreSQL fonksiyonlarını oluşturur
- Trigger'ları ayarlar
- View'ları oluşturur
- Gerekli yetkileri verir

### 2. Test Etme
Kurulum tamamlandıktan sonra test scriptini çalıştırın:

```sql
-- docs/test-notification-fix.sql dosyasının içeriğini buraya kopyalayın
```

### 3. Uygulama Güncellemeleri
Aşağıdaki dosyalar güncellenmiştir:

#### `src/contexts/NotificationContext.tsx`
- Hata yakalama iyileştirildi
- Her bir API çağrısı ayrı ayrı yakalanıyor
- Daha detaylı hata mesajları

#### `src/lib/notifications.ts`
- Fallback mekanizmaları eklendi
- RPC fonksiyonları yoksa direkt sorgular kullanılıyor
- View yoksa manuel hesaplama yapılıyor

### 4. Olası Hata Nedenleri

#### A. Veritabanı Tabloları Eksik
- `notifications` tablosu yok
- `notification_preferences` tablosu yok
- Gerekli index'ler eksik

#### B. RLS Politikaları Eksik
- Kullanıcılar kendi bildirimlerini göremiyor
- Yetki sorunları

#### C. PostgreSQL Fonksiyonları Eksik
- `get_unread_notification_count()` fonksiyonu yok
- `mark_notification_as_read()` fonksiyonu yok
- `mark_all_notifications_as_read()` fonksiyonu yok

#### D. View Eksik
- `user_notification_summary` view'ı yok

### 5. Manuel Kontrol

#### A. Tabloları Kontrol Et
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_preferences');
```

#### B. Fonksiyonları Kontrol Et
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_unread_notification_count', 'mark_notification_as_read', 'mark_all_notifications_as_read');
```

#### C. View'ı Kontrol Et
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'user_notification_summary';
```

### 6. Tarayıcı Konsol Kontrolü
1. F12 tuşuna basın
2. Console sekmesine gidin
3. Aşağıdaki hata mesajlarını arayın:
   - "Error fetching notifications"
   - "Error getting unread count"
   - "Error fetching notification summary"
   - "RPC function failed"
   - "View query failed"

### 7. Test Bildirimi Oluşturma
Test için manuel bildirim oluşturmak isterseniz:

```sql
-- Mevcut kullanıcı ID'sini alın
SELECT id FROM auth.users LIMIT 1;

-- Test bildirimi oluşturun (YOUR_USER_ID yerine gerçek ID'yi yazın)
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
    'YOUR_USER_ID',
    'system',
    'Test Bildirimi',
    'Bu bir test bildirimidir!',
    '{"test": true}'
);
```

### 8. Sorun Devam Ederse

#### A. Supabase Logları Kontrol Edin
- Supabase Dashboard > Logs
- SQL hatalarını arayın

#### B. Network Tab Kontrol Edin
- F12 > Network sekmesi
- Supabase API çağrılarını kontrol edin
- 401, 403, 500 hatalarını arayın

#### C. RLS Politikalarını Kontrol Edin
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('notifications', 'notification_preferences');
```

### 9. Geliştirici Notları

#### Fallback Mekanizmaları
- RPC fonksiyonları yoksa direkt SQL sorguları kullanılır
- View yoksa manuel hesaplama yapılır
- Her hata ayrı ayrı yakalanır ve raporlanır

#### Hata Mesajları
- Türkçe hata mesajları eklendi
- Detaylı console logları
- Kullanıcı dostu hata gösterimi

#### Performans
- Index'ler eklendi
- Optimize edilmiş sorgular
- Gereksiz API çağrıları önlendi

## Sonuç
Bu adımları takip ettikten sonra bildirim sistemi düzgün çalışmalıdır. Eğer sorun devam ederse, tarayıcı konsolundaki hata mesajlarını paylaşın.

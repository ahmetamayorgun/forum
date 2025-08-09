# 🔧 Kullanıcı Kayıt Sorunu Debug Rehberi

## 🚨 Sorun: "Yeni kullanıcı girişi yapılırken database e kaydedilmedi hatası"

## 📋 Adım Adım Çözüm:

### 1. **Supabase SQL Editor'de Fix Scriptini Çalıştırın**

```sql
-- docs/fix-user-registration.sql dosyasındaki scripti çalıştırın
-- Bu script:
-- - Profiles tablosunu kontrol eder
-- - RLS politikalarını düzeltir
-- - Trigger oluşturur
-- - Eksik profilleri oluşturur
```

### 2. **Test Sayfasını Kullanın**

```
http://localhost/test-registration
```

Bu sayfada:
- ✅ Veritabanı bağlantısını test edin
- ✅ Kayıt işlemini test edin
- ✅ Console loglarını kontrol edin

### 3. **Browser Console'u Kontrol Edin**

F12 → Console sekmesinde şu logları arayın:
```
Starting signup process for: email@example.com
Auth signup successful, user: [user-id]
Creating profile for user: [user-id]
Profile created successfully
```

### 4. **Supabase Dashboard Kontrolleri**

#### A. **Authentication > Users**
- Yeni kullanıcı auth.users tablosunda var mı?
- Email confirmed mu?

#### B. **Database > Tables > profiles**
- Kullanıcının profili var mı?
- RLS politikaları doğru mu?

#### C. **Database > Policies**
```
profiles tablosu için:
- "Users can view all profiles" (SELECT)
- "Users can update own profile" (UPDATE)  
- "Users can insert own profile" (INSERT)
```

### 5. **Olası Hata Kodları ve Çözümleri**

#### ❌ **PGRST116 - Profile not found**
```sql
-- Trigger çalışmıyor, manuel profil oluştur
INSERT INTO profiles (id, username, email)
VALUES ('user-id', 'username', 'email@example.com');
```

#### ❌ **23505 - Duplicate key error**
```sql
-- Kullanıcı zaten var, normal
-- Profil oluşturma işlemi atlanır
```

#### ❌ **42501 - Permission denied**
```sql
-- RLS politikası sorunu
-- INSERT politikasını kontrol et
```

#### ❌ **42P01 - Table does not exist**
```sql
-- Profiles tablosu yok
-- supabase-setup.sql çalıştır
```

### 6. **Manuel Test Sorguları**

#### A. **Profiles Tablosunu Kontrol Et**
```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';
```

#### B. **RLS Politikalarını Kontrol Et**
```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

#### C. **Trigger'ı Kontrol Et**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';
```

#### D. **Kullanıcı ve Profil Sayılarını Kontrol Et**
```sql
SELECT 
  'Auth users' as type,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Profiles' as type,
  COUNT(*) as count
FROM profiles;
```

### 7. **Environment Variables Kontrolü**

`.env` dosyasında:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 8. **AuthContext Debug Logları**

Kodda console.log'lar ekledik:
- Kayıt işlemi başlangıcı
- Auth başarılı
- Profil oluşturma
- Hata durumları

### 9. **Alternatif Çözümler**

#### A. **Trigger'ı Devre Dışı Bırak**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

#### B. **Manuel Profil Oluşturma**
AuthContext'te profil oluşturma işlemi zaten var.

#### C. **RLS'yi Geçici Olarak Kapat**
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- Test ettikten sonra tekrar açın
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 10. **Production Kontrol Listesi**

- [ ] Supabase URL ve Key doğru
- [ ] Profiles tablosu mevcut
- [ ] RLS politikaları doğru
- [ ] Trigger çalışıyor
- [ ] AuthContext hata yönetimi
- [ ] Console logları temiz

### 11. **Yaygın Hatalar**

1. **Email confirmation gerekli** - Supabase ayarlarında email confirmation'ı kapatın
2. **RLS politikası yanlış** - INSERT politikasını kontrol edin
3. **Trigger çalışmıyor** - Trigger fonksiyonunu yeniden oluşturun
4. **Network hatası** - Supabase URL'ini kontrol edin

### 12. **Test Senaryoları**

#### Senaryo 1: Yeni Kullanıcı
1. Test sayfasında yeni email ile kayıt ol
2. Console loglarını kontrol et
3. Supabase Dashboard'da kullanıcıyı kontrol et

#### Senaryo 2: Mevcut Kullanıcı
1. Var olan email ile kayıt olmayı dene
2. Duplicate key hatası almalısın

#### Senaryo 3: Profil Yok
1. Auth.users'da kullanıcı var ama profiles'da yok
2. Giriş yap, profil otomatik oluşturulmalı

## 🎯 Sonuç

Bu rehberi takip ederek sorunu çözebilirsiniz. En yaygın sorun RLS politikaları ve trigger'dır. Test sayfasını kullanarak adım adım debug edin.

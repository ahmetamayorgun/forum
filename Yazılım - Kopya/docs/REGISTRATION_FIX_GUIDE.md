# 🔧 Kullanıcı Kayıt Sorunu Çözüm Rehberi

## 🚨 Sorun: "Database error saving new user" Hatası

Bu rehber, yeni kullanıcı kaydı sırasında alınan veritabanı hatasını çözmek için adım adım talimatlar içerir.

## 📋 Çözüm Adımları

### 1. **Debug Sayfasını Kullanın**

Önce debug sayfasını kullanarak sorunu tespit edin:

```
http://localhost:3000/debug-registration
```

Bu sayfa:
- ✅ Veritabanı bağlantısını test eder
- ✅ RLS politikalarını kontrol eder
- ✅ Mevcut kullanıcıları kontrol eder
- ✅ Kayıt işlemini detaylı olarak test eder
- ✅ Hata mesajlarını detaylı olarak gösterir

### 2. **Supabase SQL Editor'de Scriptleri Çalıştırın**

#### A. Veritabanı Durumunu Kontrol Edin
```sql
-- docs/check-database-status.sql dosyasını çalıştırın
```

#### B. RLS Politikalarını Düzeltin
```sql
-- docs/fix-rls-policies.sql dosyasını çalıştırın
```

#### C. Geçici Çözüm (Gerekirse)
```sql
-- docs/temporary-fix.sql dosyasını çalıştırın
```

### 3. **Olası Sorunlar ve Çözümleri**

#### ❌ **RLS Politikası Sorunu**
**Belirti:** "permission denied" hatası
**Çözüm:** 
```sql
-- RLS'yi geçici olarak kapat
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test ettikten sonra tekrar aç
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

#### ❌ **Trigger Sorunu**
**Belirti:** Profil otomatik oluşturulmuyor
**Çözüm:**
```sql
-- Trigger'ı yeniden oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

#### ❌ **Duplicate Key Hatası**
**Belirti:** "duplicate key value violates unique constraint"
**Çözüm:** Farklı email/kullanıcı adı kullanın

#### ❌ **Network Hatası**
**Belirti:** "fetch failed" veya "connection error"
**Çözüm:** 
- Supabase URL'ini kontrol edin
- İnternet bağlantısını kontrol edin
- Supabase servisinin çalışır durumda olduğunu kontrol edin

### 4. **Test Senaryoları**

#### Senaryo 1: Yeni Kullanıcı Kaydı
1. Debug sayfasını açın
2. Yeni email ve kullanıcı adı girin
3. "Tam Test Başlat" butonuna tıklayın
4. Logları kontrol edin

#### Senaryo 2: Mevcut Kullanıcı
1. Var olan email ile kayıt olmayı deneyin
2. "Bu email adresi zaten kullanılıyor" hatası almalısınız

#### Senaryo 3: Geçersiz Veriler
1. Geçersiz email formatı girin
2. Çok kısa şifre girin
3. Uygun hata mesajları almalısınız

### 5. **Console Logları**

Browser console'da (F12) şu logları arayın:

```
✅ Başarılı kayıt:
Starting signup process for: email@example.com
Auth signup successful, user: [user-id]
Creating profile for user: [user-id]
Profile created successfully
Signup process completed successfully

❌ Hata durumları:
Profile creation error: [error-details]
INSERT hatası: [error-message]
```

### 6. **Supabase Dashboard Kontrolleri**

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

### 7. **Environment Variables**

`.env` dosyasında şunları kontrol edin:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 8. **Yaygın Hatalar ve Çözümleri**

| Hata | Çözüm |
|------|-------|
| "Database error saving new user" | RLS politikalarını düzelt |
| "permission denied" | RLS'yi geçici olarak kapat |
| "duplicate key" | Farklı email/kullanıcı adı kullan |
| "invalid email" | Geçerli email formatı kullan |
| "weak password" | Daha güçlü şifre kullan |

### 9. **Son Kontrol Listesi**

- [ ] Debug sayfası çalışıyor mu?
- [ ] Veritabanı bağlantısı başarılı mı?
- [ ] RLS politikaları doğru mu?
- [ ] Trigger çalışıyor mu?
- [ ] Console'da hata var mı?
- [ ] Supabase Dashboard'da kullanıcı oluşuyor mu?

### 10. **Yardım**

Eğer sorun devam ederse:

1. **Debug sayfasının loglarını** paylaşın
2. **Console hatalarını** paylaşın
3. **Supabase Dashboard** ekran görüntülerini paylaşın
4. **Hangi adımda** hata aldığınızı belirtin

## 🎯 Sonuç

Bu rehberi takip ederek kayıt sorununu çözebilirsiniz. En yaygın sorun RLS politikaları ve trigger'dır. Debug sayfasını kullanarak adım adım sorunu tespit edin.

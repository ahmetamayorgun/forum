# 🔧 Kayıt Hatalarını Çözme Rehberi

## 🚨 Sorun: "Database error saving new user" ve HTTP 406 Hataları

Bu rehber, yeni kullanıcı kaydı sırasında alınan veritabanı hatalarını çözmek için adım adım talimatlar içerir.

## 📋 Hata Analizi

### Alınan Hatalar:
1. **HTTP 406 hatası**: Username ve email kontrolü sırasında
2. **HTTP 500 hatası**: Kullanıcı kaydı sırasında "Database error saving new user"

### Olası Nedenler:
- RLS (Row Level Security) politikaları sorunu
- Trigger fonksiyonu sorunu
- Veritabanı tablosu yapısı sorunu
- Supabase konfigürasyon sorunu

## 🛠️ Çözüm Adımları

### 1. **Supabase SQL Editor'de Script Çalıştırın**

Supabase Dashboard > SQL Editor'e gidin ve şu scripti çalıştırın:

```sql
-- docs/fix-registration-errors.sql dosyasını çalıştırın
```

Bu script:
- ✅ Profiles tablosunu yeniden oluşturur
- ✅ RLS politikalarını düzeltir
- ✅ Trigger fonksiyonunu yeniden oluşturur
- ✅ Mevcut kullanıcılar için eksik profilleri oluşturur

### 2. **Debug Sayfasını Kullanın**

Uygulamada debug sayfasını açın:
```
http://localhost:3000/debug-registration
```

Bu sayfa:
- ✅ Veritabanı bağlantısını test eder
- ✅ RLS politikalarını kontrol eder
- ✅ Kayıt işlemini detaylı olarak test eder
- ✅ Hata mesajlarını detaylı olarak gösterir

### 3. **Manuel Test**

Debug sayfasında:
1. Yeni bir email adresi girin
2. Yeni bir kullanıcı adı girin
3. Güçlü bir şifre girin (en az 6 karakter)
4. "Tam Test Başlat" butonuna tıklayın
5. Logları kontrol edin

### 4. **Olası Sorunlar ve Çözümleri**

#### ❌ **RLS Politikası Sorunu**
**Belirti:** "permission denied" veya HTTP 406 hatası
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
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
      new.id,
      'user_' || substr(new.id::text, 1, 8) || '_' || floor(random() * 1000),
      new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### ❌ **Duplicate Key Hatası**
**Belirti:** "duplicate key value violates unique constraint"
**Çözüm:** Farklı email/kullanıcı adı kullanın

### 5. **Console Logları Kontrolü**

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
| HTTP 406 | RLS politikalarını kontrol et |

### 9. **Son Kontrol Listesi**

- [ ] SQL scripti çalıştırıldı mı?
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

## 📞 Ek Destek

Eğer sorun devam ederse:
1. Supabase Discord topluluğuna katılın
2. Supabase GitHub issues'da arama yapın
3. Stack Overflow'da benzer sorunları arayın

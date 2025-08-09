# 🔐 Giriş Yapma Sorunları - Sorun Giderme Rehberi

## 🚨 Yaygın Sorunlar ve Çözümleri

### 1. **"Giriş yapılırken bir hata oluştu" Hatası**

**Olası Nedenler:**
- Supabase bağlantı sorunu
- Yanlış email/şifre
- Email onaylanmamış
- Network bağlantı sorunu

**Çözümler:**
```bash
# 1. Debug sayfasını ziyaret edin
http://localhost:3000/debug

# 2. Browser console'u kontrol edin (F12)
# 3. Network sekmesinde hataları kontrol edin
```

### 2. **"Geçersiz email veya şifre" Hatası**

**Test Kullanıcısı:**
```
Email: test@example.com
Şifre: test123456
```

**Çözümler:**
1. Test kullanıcısı ile giriş yapmayı deneyin
2. Şifrenizi sıfırlayın
3. Email adresinizi kontrol edin

### 3. **"Email adresinizi onaylamanız gerekiyor" Hatası**

**Çözümler:**
1. Email'inizi kontrol edin
2. Spam klasörünü kontrol edin
3. Supabase dashboard'dan manuel onay yapın

### 4. **Session Sorunları**

**Belirtiler:**
- Giriş yapıyor ama hemen çıkış yapıyor
- Sayfa yenilendiğinde giriş kayboluyor

**Çözümler:**
```javascript
// Browser console'da test edin
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 🔧 Debug Adımları

### Adım 1: Debug Sayfasını Kullanın
```
http://localhost:3000/debug
```

Bu sayfa şunları kontrol eder:
- Supabase bağlantısı
- Session durumu
- Database bağlantısı
- LocalStorage durumu
- Cookie durumu

### Adım 2: Browser Console'u Kontrol Edin
```javascript
// F12 tuşuna basın ve Console sekmesine gidin
// Login yaparken çıkan hataları not edin
```

### Adım 3: Network Sekmesini Kontrol Edin
```javascript
// F12 > Network sekmesi
// Login yaparken başarısız istekleri kontrol edin
// Status code'ları not edin
```

### Adım 4: Supabase Dashboard'u Kontrol Edin
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin
3. Authentication > Users bölümünü kontrol edin
4. Database > Tables bölümünü kontrol edin

## 🛠️ Manuel Test Adımları

### 1. Test Kullanıcısı Oluşturma
```sql
-- Supabase SQL Editor'da çalıştırın
-- docs/test-login-setup.sql dosyasındaki script'i kullanın
```

### 2. Supabase Bağlantı Testi
```javascript
// Browser console'da test edin
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'test123456'
});
console.log({ data, error });
```

### 3. Database Bağlantı Testi
```javascript
// Browser console'da test edin
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);
console.log({ data, error });
```

## 🔍 Detaylı Hata Analizi

### Hata Kodları ve Anlamları

| Hata Kodu | Anlamı | Çözüm |
|-----------|--------|-------|
| 400 | Bad Request | Email/şifre formatını kontrol edin |
| 401 | Unauthorized | Kimlik bilgilerini kontrol edin |
| 403 | Forbidden | RLS politikalarını kontrol edin |
| 404 | Not Found | Supabase URL'ini kontrol edin |
| 500 | Server Error | Supabase durumunu kontrol edin |

### RLS (Row Level Security) Sorunları

**Kontrol Edilecek Politikalar:**
```sql
-- Profiles tablosu için RLS politikaları
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- User_points tablosu için RLS politikaları  
SELECT * FROM pg_policies WHERE tablename = 'user_points';
```

**Temel RLS Politikaları:**
```sql
-- Profiles tablosu için
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User_points tablosu için
CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);
```

## 🌐 Network ve CORS Sorunları

### CORS Hatası
**Belirtiler:**
- Browser console'da CORS hatası
- Network sekmesinde OPTIONS isteği başarısız

**Çözümler:**
1. Supabase URL'ini kontrol edin
2. Supabase dashboard'da CORS ayarlarını kontrol edin
3. Localhost'u authorized origins'e ekleyin

### Network Timeout
**Belirtiler:**
- İstekler zaman aşımına uğruyor
- Yavaş yanıt süreleri

**Çözümler:**
1. İnternet bağlantınızı kontrol edin
2. Supabase status sayfasını kontrol edin
3. VPN kullanıyorsanız kapatın

## 🍪 Cookie ve Storage Sorunları

### Cloudflare Cookie Sorunları
**Belirtiler:**
- Cloudflare challenge sayfası
- Cookie temizleme sorunları

**Çözümler:**
```javascript
// Cookie'leri temizle
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### LocalStorage Sorunları
**Belirtiler:**
- Session kayboluyor
- Giriş yapıyor ama hatırlanmıyor

**Çözümler:**
```javascript
// LocalStorage'ı temizle
localStorage.clear();
sessionStorage.clear();
```

## 📱 Mobil ve Farklı Browser Sorunları

### Safari Sorunları
- Third-party cookie ayarlarını kontrol edin
- Private browsing modunu kapatın

### Chrome Sorunları
- Extensions'ları geçici olarak devre dışı bırakın
- Incognito modunda test edin

### Mobile Sorunları
- Browser cache'ini temizleyin
- App'i yeniden yükleyin

## 🔄 Sistem Güncellemeleri

### Supabase Güncellemeleri
```bash
# Package.json'da Supabase versiyonunu kontrol edin
npm list @supabase/supabase-js

# Güncelleme
npm update @supabase/supabase-js
```

### React Güncellemeleri
```bash
# React versiyonunu kontrol edin
npm list react react-dom

# Güncelleme
npm update react react-dom
```

## 📞 Destek

### Hata Raporlama
Hata raporlarken şu bilgileri ekleyin:
1. Browser ve versiyonu
2. İşletim sistemi
3. Hata mesajı (tam metin)
4. Console logları
5. Network sekmesi ekran görüntüsü
6. Debug sayfası çıktısı

### İletişim
- GitHub Issues: [Proje Repository'si]
- Email: [Destek Email'i]
- Discord: [Discord Sunucusu]

---

## ✅ Hızlı Kontrol Listesi

- [ ] Debug sayfasını ziyaret ettiniz mi? (`/debug`)
- [ ] Test kullanıcısı ile giriş yapmayı denediniz mi?
- [ ] Browser console'da hata var mı?
- [ ] Network sekmesinde başarısız istek var mı?
- [ ] Supabase dashboard'da kullanıcı mevcut mu?
- [ ] RLS politikaları doğru ayarlanmış mı?
- [ ] CORS ayarları doğru mu?
- [ ] Cookie'ler temizlendi mi?
- [ ] LocalStorage temizlendi mi?
- [ ] Farklı browser'da test ettiniz mi?

# 👤 Manuel Test Kullanıcısı Oluşturma Rehberi

## 🎯 Amaç
Giriş yapma sorununu test etmek için Supabase'de manuel olarak test kullanıcısı oluşturmak.

## 📋 Adım Adım Talimatlar

### 1. Supabase Dashboard'a Giriş
1. https://supabase.com/dashboard adresine gidin
2. Projenizi seçin
3. Sol menüden **Authentication** > **Users** bölümüne gidin

### 2. Test Kullanıcısı Oluştur
1. **"Add User"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:
   - **Email**: `test@example.com`
   - **Password**: `test123456`
   - **User Metadata**: 
     ```json
     {
       "username": "testuser"
     }
     ```
3. **"Create User"** butonuna tıklayın

### 3. Kullanıcıyı Onayla
1. Oluşturulan kullanıcıyı listede bulun
2. **"Confirm"** butonuna tıklayın (email onayını atla)
3. Kullanıcının **"Confirmed"** durumunda olduğunu kontrol edin

### 4. SQL Script'i Çalıştır
1. Sol menüden **SQL Editor**'a gidin
2. `docs/test-login-setup.sql` dosyasındaki script'i yapıştırın
3. **"Run"** butonuna tıklayın

### 5. Sonuçları Kontrol Et
Script çalıştıktan sonra şu sonuçları görmelisiniz:
- ✅ Test kullanıcısı auth.users tablosunda
- ✅ Profil profiles tablosunda oluşturuldu
- ✅ User points user_points tablosunda oluşturuldu

## 🔍 Test Etme

### 1. Debug Sayfasını Ziyaret Et
```
http://localhost:3000/debug
```

### 2. Test Login Butonuna Tıkla
- Debug sayfasındaki **"Test Login (test@example.com)"** butonuna tıklayın
- Başarılı olursa "Login test successful!" mesajı görmelisiniz

### 3. Manuel Giriş Testi
- `/login` sayfasına gidin
- Email: `test@example.com`
- Şifre: `test123456`
- Giriş yapmayı deneyin

## 🚨 Sorun Giderme

### Kullanıcı Oluşturulamıyorsa:
1. Supabase projenizin aktif olduğundan emin olun
2. Authentication ayarlarını kontrol edin
3. Email confirmation'ı devre dışı bırakın

### SQL Script Hatası Alıyorsanız:
1. RLS politikalarını kontrol edin
2. Tabloların mevcut olduğundan emin olun
3. Gerekli izinlerin olduğunu kontrol edin

### Giriş Yapılamıyorsa:
1. Debug sayfasındaki hata mesajlarını kontrol edin
2. Browser console'da hataları kontrol edin
3. Network sekmesinde başarısız istekleri kontrol edin

## 📊 Beklenen Sonuçlar

### Debug Sayfası Çıktısı:
```json
{
  "session": {
    "hasSession": true,
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "metadata": {
        "username": "testuser"
      }
    }
  },
  "database": {
    "connected": true
  },
  "localStorage": {
    "hasAuthData": true
  }
}
```

### Test Kullanıcısı Bilgileri:
- **Email**: test@example.com
- **Şifre**: test123456
- **Kullanıcı Adı**: testuser
- **Durum**: Onaylanmış
- **Puanlar**: 0

## ✅ Başarı Kriterleri

- [ ] Test kullanıcısı Supabase'de oluşturuldu
- [ ] Kullanıcı onaylandı
- [ ] Profil ve puanlar oluşturuldu
- [ ] Debug sayfası başarılı bağlantı gösteriyor
- [ ] Test login butonu çalışıyor
- [ ] Manuel giriş yapılabiliyor

## 🔄 Sonraki Adımlar

Test kullanıcısı başarıyla oluşturulduktan sonra:
1. Giriş yapma sorununu test edin
2. Hata varsa debug bilgilerini toplayın
3. Sorun giderme rehberini takip edin
4. Gerekirse ek düzeltmeler yapın

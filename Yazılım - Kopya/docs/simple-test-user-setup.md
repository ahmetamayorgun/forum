# 🧪 Basit Test Kullanıcısı Oluşturma

## 🎯 Alternatif Test Kullanıcısı

Eğer `test@example.com` çalışmıyorsa, bu alternatif kullanıcıyı deneyin:

### **Kullanıcı Bilgileri:**
- **Email**: `demo@test.com`
- **Password**: `demo123`
- **Username**: `demouser`

## 📋 Oluşturma Adımları:

### 1. Supabase Dashboard'da Kullanıcı Oluştur
1. **Authentication** > **Users** > **"Add User"**
2. **Email**: `demo@test.com`
3. **Password**: `demo123`
4. **User Metadata**: 
   ```json
   {
     "username": "demouser"
   }
   ```
5. **"Create User"** butonuna tıklayın

### 2. Kullanıcıyı Onayla
1. **"Confirm"** butonuna tıklayın
2. Durumun **"Confirmed"** olduğunu kontrol edin

### 3. Debug Sayfasını Güncelle
Debug sayfasındaki test login butonunu güncelleyin:

```javascript
// Debug.tsx dosyasında testLogin fonksiyonunu güncelle
const testLogin = async () => {
  try {
    console.log('Testing login with demo credentials...');
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@test.com',
      password: 'demo123'
    });
    
    if (error) {
      alert(`Login test failed: ${error.message}`);
    } else {
      alert('Login test successful!');
      window.location.reload();
    }
  } catch (error) {
    alert(`Login test error: ${(error as Error).message}`);
  }
};
```

## 🔍 Test Etme:

### 1. Manuel Giriş Testi
- `/login` sayfasına gidin
- Email: `demo@test.com`
- Şifre: `demo123`
- Giriş yapmayı deneyin

### 2. Debug Sayfası Testi
- `/debug` sayfasını ziyaret edin
- Test login butonunu güncelleyin
- Test edin

## 🚨 Sorun Giderme:

### Kullanıcı Oluşturulamıyorsa:
1. Supabase projenizin aktif olduğundan emin olun
2. Email confirmation'ı devre dışı bırakın
3. Farklı bir email adresi deneyin

### Giriş Yapılamıyorsa:
1. Şifreyi sıfırlayın
2. Kullanıcının onaylandığından emin olun
3. Browser console'da hataları kontrol edin

## 📊 Beklenen Sonuç:

Başarılı giriş sonrası:
- ✅ "Login test successful!" mesajı
- ✅ Ana sayfaya yönlendirme
- ✅ Kullanıcı bilgileri navbar'da görünme

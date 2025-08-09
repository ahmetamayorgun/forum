# 🛡️ Admin Paneli Kurulum Rehberi

Bu rehber, forum uygulamasına admin paneli ekleme sürecini açıklar.

## 📋 Gereksinimler

- Supabase projesi kurulu
- React uygulaması çalışır durumda
- En az bir kullanıcı hesabı mevcut

## 🚀 Kurulum Adımları

### 1. Veritabanı Kurulumu

Supabase SQL Editor'da sırasıyla şu dosyaları çalıştırın:

```sql
-- 1. Admin sistemi tabloları ve fonksiyonları
-- docs/create-admin-system.sql dosyasını çalıştırın

-- 2. İlk admin kullanıcısını oluşturun
SELECT create_first_admin('admin@example.com');
-- Yukarıdaki email'i kendi admin email'iniz ile değiştirin
```

### 2. Frontend Kurulumu

Tüm gerekli dosyalar zaten oluşturulmuştur:

- ✅ `src/lib/admin.ts` - Admin API fonksiyonları
- ✅ `src/hooks/useAdmin.ts` - Admin hook'u
- ✅ `src/pages/AdminPanel.tsx` - Ana admin sayfası
- ✅ `src/components/admin/` - Admin bileşenleri
- ✅ CSS dosyaları

### 3. Route Ekleme

`src/App.tsx` dosyasına admin route'u eklenmiştir:

```tsx
<Route path="/admin" element={<AdminPanel />} />
```

### 4. Navbar Güncelleme

`src/components/Navbar.tsx` dosyasına admin linki eklenmiştir:

```tsx
{(isAdmin || isModerator) && (
  <Link to="/admin" className="nav-link admin-link">
    <span className="nav-icon">🛡️</span>
    <span className="nav-text">Admin</span>
  </Link>
)}
```

## 🎯 Admin Paneli Özellikleri

### 📊 Dashboard
- **İstatistik Kartları**: Toplam kullanıcı, başlık, yorum sayıları
- **En İyi Kullanıcılar**: Puan sıralaması
- **En Popüler Kategoriler**: Başlık sayısına göre
- **Son Admin Aktiviteleri**: Admin logları

### 👥 Kullanıcı Yönetimi
- **Kullanıcı Arama**: Email veya kullanıcı adı ile
- **Rol Atama**: Admin, Moderator, User rolleri
- **Rol Kaldırma**: Mevcut rolleri kaldırma
- **Süreli Roller**: Belirli süre için rol atama

### 🚨 Rapor Yönetimi
- **Bekleyen Raporlar**: Kullanıcı raporlarını görüntüleme
- **Rapor İnceleme**: Detaylı rapor inceleme
- **Moderation Eylemleri**: Uyarı, askıya alma, yasaklama
- **Rapor Çözümleme**: Raporları çözme veya reddetme

### ⚙️ Sistem Ayarları (Sadece Admin)
- **Site Ayarları**: Site adı, açıklama
- **Limit Ayarları**: Günlük başlık/yorum limitleri
- **Onay Ayarları**: Otomatik onay seçenekleri
- **Bakım Modu**: Site bakım modu
- **Kayıt Ayarları**: Kayıt olma izinleri

### 📋 Admin Logları
- **Aktivite Takibi**: Tüm admin eylemlerinin logları
- **Detaylı Bilgiler**: Eylem türü, hedef, detaylar
- **Zaman Damgası**: Eylem tarihleri

## 🔐 Yetki Seviyeleri

### 👑 Admin
- Tüm özelliklere erişim
- Kullanıcı rolleri atama/kaldırma
- Sistem ayarları değiştirme
- Moderation eylemleri
- Rapor yönetimi

### 🛡️ Moderator
- Dashboard görüntüleme
- Rapor yönetimi
- Moderation eylemleri
- Admin logları görüntüleme
- Kullanıcı arama

### 👤 User
- Admin paneline erişim yok

## 🎨 Özellikler

### 📱 Responsive Tasarım
- Mobil uyumlu arayüz
- Tablet ve desktop optimizasyonu
- Touch-friendly butonlar

### 🌙 Dark Mode Desteği
- Otomatik dark mode algılama
- Tema değişikliklerinde uyum

### ⚡ Performans
- Lazy loading bileşenler
- Optimize edilmiş API çağrıları
- Debounced arama

### 🔒 Güvenlik
- Row Level Security (RLS)
- Yetki kontrolü
- Admin action logging

## 🛠️ Kullanım

### Admin Olma
1. Supabase SQL Editor'da admin email'inizi belirtin
2. `create_first_admin()` fonksiyonunu çalıştırın
3. Uygulamaya giriş yapın
4. Navbar'da "Admin" linkini görün

### Kullanıcı Yönetimi
1. Admin panelinde "Kullanıcılar" sekmesine gidin
2. Kullanıcı arayın veya mevcut kullanıcıları görüntüleyin
3. "Rol Ata" butonuna tıklayın
4. Rol ve süre seçin
5. Onaylayın

### Rapor Yönetimi
1. "Raporlar" sekmesine gidin
2. Bekleyen raporları görüntüleyin
3. "İncele" butonuna tıklayın
4. Moderation eylemi uygulayın veya raporu çözün

### Sistem Ayarları
1. "Ayarlar" sekmesine gidin (sadece admin)
2. İstediğiniz ayarı düzenleyin
3. Kaydet butonuna tıklayın

## 🔧 Sorun Giderme

### Admin Yetkisi Alamıyorum
```sql
-- Kullanıcının admin olup olmadığını kontrol edin
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';

-- Manuel olarak admin rolü atayın
INSERT INTO user_roles (user_id, role, granted_by)
VALUES ('YOUR_USER_ID', 'admin', 'YOUR_USER_ID');
```

### Admin Paneli Görünmüyor
- Kullanıcının giriş yapmış olduğundan emin olun
- Admin veya moderator rolünün atandığını kontrol edin
- Tarayıcı konsolunda hata olup olmadığını kontrol edin

### Veritabanı Hataları
- Supabase RLS politikalarının doğru çalıştığını kontrol edin
- Fonksiyonların oluşturulduğunu kontrol edin
- Tablo yapılarının doğru olduğunu kontrol edin

## 📝 Notlar

- Admin paneli sadece giriş yapmış admin/moderator kullanıcılar tarafından görülebilir
- Tüm admin eylemleri loglanır
- Rol değişiklikleri anında etkili olur
- Sistem ayarları değişiklikleri anında uygulanır

## 🔄 Güncellemeler

Admin paneli sürekli geliştirilmektedir. Yeni özellikler için:

1. Bu rehberi kontrol edin
2. GitHub repository'sini takip edin
3. Yeni SQL dosyalarını çalıştırın

---

**Admin paneli başarıyla kuruldu!** 🎉

Artık forum uygulamanızı profesyonel bir şekilde yönetebilirsiniz. 
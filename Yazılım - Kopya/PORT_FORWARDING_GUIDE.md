# 🌐 Port Forwarding ile Dış Dünyaya Açma Rehberi

## 📋 Gereksinimler:
- Router erişimi
- Statik IP (önerilen)
- Domain name (opsiyonel)

## 🔧 Adımlar:

### 1. Router'a Giriş
```
1. Tarayıcıda router IP'sine gidin (genellikle 192.168.1.1)
2. Admin kullanıcı adı/şifre ile giriş yapın
3. "Port Forwarding" veya "Port Mapping" bölümünü bulun
```

### 2. Port Forwarding Ayarları
```
Service Name: React Notification App
Protocol: TCP
External Port: 80 (veya 8080)
Internal Port: 80
Internal IP: [Bilgisayarınızın IP'si]
Status: Enabled
```

### 3. Bilgisayarınızın IP'sini Bulun
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

### 4. Firewall Ayarları
```
Windows Firewall'da port 80'yi açın:
1. Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules
4. New Rule
5. Port: 80, TCP
6. Allow the connection
```

### 5. Test
```
Dış IP'nizi öğrenin: whatismyipaddress.com
Test URL: http://[DIŞ_IP]:80
```

## 🔒 Güvenlik Önerileri:
- Sadece gerekli portları açın
- Güçlü şifreler kullanın
- Düzenli güncellemeler yapın
- VPN kullanmayı düşünün

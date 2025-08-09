# 🌐 Cloudflare Kurulum ve Ayarlar Rehberi

## 📋 Genel Bakış

Bu doküman, projenizin Cloudflare ile entegrasyonu için gerekli tüm ayarları içerir.

## 🚀 1. DNS Ayarları

### A Record
```
Type: A
Name: yourdomain.com
Content: YOUR_SERVER_IP
Proxy status: Proxied (Orange Cloud)
TTL: Auto
```

### CNAME Record
```
Type: CNAME
Name: www
Content: yourdomain.com
Proxy status: Proxied (Orange Cloud)
TTL: Auto
```

## 🔒 2. SSL/TLS Ayarları

### SSL/TLS Mode
- **Mode**: Full (strict)
- **Edge Certificates**: Always Use HTTPS
- **HSTS**: Enabled
- **Minimum TLS Version**: TLS 1.2

### SSL/TLS Rules
```
# Force HTTPS
Rule: (http.request.scheme eq "http")
Action: Redirect to HTTPS
```

## ⚡ 3. Performance Ayarları

### Caching
- **Cache Level**: Standard
- **Browser Cache TTL**: 4 hours
- **Always Online**: On

### Page Rules
```
# Cache static assets
URL: yourdomain.com/static/*
Settings: Cache Level: Cache Everything

# Bypass cache for API
URL: yourdomain.com/api/*
Settings: Cache Level: Bypass Cache

# Force HTTPS
URL: yourdomain.com/*
Settings: Always Use HTTPS
```

## 🛡️ 4. Security Ayarları

### Security Level
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes

### WAF (Web Application Firewall)
- **WAF**: On
- **Managed Rules**: On
- **Rate Limiting**: On

### Custom Rules
```
# Block bad bots
Rule: (http.user_agent contains "bot" and not http.user_agent contains "googlebot")
Action: Block

# Protect admin panel
Rule: (http.request.uri.path contains "/admin")
Action: Challenge (Captcha)
```

## 📊 5. Analytics ve Monitoring

### Web Analytics
- **Web Analytics**: On
- **Real User Monitoring**: On

### Alerts
```
# High traffic alert
Rule: (http.requests_per_sec > 100)
Action: Email notification

# Error rate alert
Rule: (http.response.status_code >= 500)
Action: Email notification
```

## 🔧 6. Nginx Konfigürasyonu

Projenizde `nginx.conf` dosyası Cloudflare için optimize edilmiştir:

```nginx
# Cloudflare Real IP Configuration
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
# ... diğer IP aralıkları
real_ip_header CF-Connecting-IP;

# Cloudflare specific headers
add_header X-Forwarded-For $proxy_add_x_forwarded_for;
add_header X-Real-IP $remote_addr;
add_header CF-Connecting-IP $http_cf_connecting_ip;
```

## 🍪 7. Cookie Yönetimi

Projenizde Cloudflare cookie sorunlarını çözmek için özel fonksiyonlar mevcuttur:

```typescript
// src/utils/cookieUtils.ts
export const clearCloudflareCookies = () => {
  // Cloudflare cookie'lerini temizle
  // __cf ve cf_ prefix'li cookie'ler
};

export const initializeCookieHandling = () => {
  clearCloudflareCookies();
  setSecureCookie('cf_clearance_bypass', 'true', 1);
};
```

## 🔍 8. Test ve Doğrulama

### DNS Test
```bash
# DNS propagation kontrolü
nslookup yourdomain.com
dig yourdomain.com

# Cloudflare proxy kontrolü
curl -I https://yourdomain.com
# X-Powered-By: Cloudflare header'ı görünmeli
```

### SSL Test
```bash
# SSL sertifika kontrolü
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Online SSL test
# https://www.ssllabs.com/ssltest/
```

### Performance Test
```bash
# Page speed test
# https://pagespeed.web.dev/
# https://gtmetrix.com/
```

## 🚨 9. Sorun Giderme

### Yaygın Sorunlar

**1. SSL Certificate Error**
```
Çözüm: SSL/TLS mode'u "Full" veya "Full (strict)" yapın
```

**2. Mixed Content Error**
```
Çözüm: Always Use HTTPS'i aktif edin
```

**3. Cache Issues**
```
Çözüm: Page Rules'da cache ayarlarını kontrol edin
```

**4. Real IP Not Working**
```
Çözüm: Nginx konfigürasyonunda real_ip_header ayarını kontrol edin
```

### Debug Komutları
```bash
# Cloudflare IP kontrolü
curl -H "CF-Connecting-IP: 1.2.3.4" https://yourdomain.com

# Headers kontrolü
curl -I https://yourdomain.com

# Cache status kontrolü
curl -I https://yourdomain.com/static/file.js
# CF-Cache-Status header'ını kontrol edin
```

## 📈 10. Monitoring ve Alerts

### Cloudflare Dashboard
- **Analytics**: Traffic, bandwidth, requests
- **Security**: Threats blocked, WAF events
- **Performance**: Cache hit ratio, response times

### Custom Alerts
```
# High error rate
Rule: (http.response.status_code >= 500 and http.requests_per_sec > 10)
Action: Email + Slack notification

# DDoS attack
Rule: (http.requests_per_sec > 1000)
Action: Email + SMS notification
```

## 🔄 11. Güncelleme ve Bakım

### Regular Maintenance
- **Monthly**: SSL certificate renewal check
- **Weekly**: Security rule review
- **Daily**: Performance monitoring

### Backup Strategy
- **DNS Records**: Export and backup
- **Page Rules**: Document all rules
- **SSL Certificates**: Monitor expiration

---

## 📞 Destek

Sorun yaşarsanız:
1. Cloudflare Status: https://www.cloudflarestatus.com/
2. Cloudflare Community: https://community.cloudflare.com/
3. Documentation: https://developers.cloudflare.com/

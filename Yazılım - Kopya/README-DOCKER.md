# 🐳 Docker ile Canlıya Alma Rehberi

## 📋 Gereksinimler

1. **Docker Desktop** kurulu olmalı
2. **Supabase** projesi hazır olmalı
3. **Environment variables** ayarlanmış olmalı

## 🚀 Hızlı Başlangıç

### 1. Docker Kurulumu

#### Windows için:
```bash
# Docker Desktop'ı indirin ve kurun
# https://www.docker.com/products/docker-desktop/
```

#### Linux için:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Environment Variables Ayarlama

```bash
# .env dosyasını oluşturun
cp env.example .env

# .env dosyasını düzenleyin
# Supabase bilgilerinizi ekleyin
```

### 3. Docker ile Deploy

```bash
# Docker image'ını build edin
docker-compose build

# Uygulamayı başlatın
docker-compose up -d

# Logları kontrol edin
docker-compose logs -f
```

## 🌐 Erişim

- **Ana Sayfa**: http://localhost
- **Demo Sayfası**: http://localhost/demo
- **Bildirimler**: http://localhost/notifications
- **Ayarlar**: http://localhost/notification-settings
- **Health Check**: http://localhost/health

## 📁 Dosya Yapısı

```
├── Dockerfile              # Production Docker image
├── docker-compose.yml      # Multi-service orchestration
├── nginx.conf             # Nginx configuration
├── .dockerignore          # Docker ignore rules
├── deploy.sh              # Deployment script
└── env.example            # Environment variables template
```

## 🔧 Yönetim Komutları

```bash
# Uygulamayı başlat
docker-compose up -d

# Uygulamayı durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f

# Yeniden başlat
docker-compose restart

# Güncelleme
docker-compose build --no-cache
docker-compose up -d

# Container durumunu kontrol et
docker-compose ps
```

## 🚀 Production Deployment

### 1. VPS/Server'a Deploy

```bash
# Projeyi server'a kopyalayın
git clone your-repo-url
cd your-project

# Environment variables'ları ayarlayın
nano .env

# Deploy edin
docker-compose up -d
```

### 2. Cloud Platform'a Deploy

#### Heroku:
```bash
# Heroku CLI kurun
npm install -g heroku

# Login
heroku login

# Container registry'yi etkinleştirin
heroku container:login

# Deploy
heroku container:push web
heroku container:release web
```

#### DigitalOcean App Platform:
- GitHub repo'nuzu bağlayın
- Dockerfile'ı otomatik algılayacak
- Environment variables'ları ayarlayın

#### AWS ECS:
```bash
# ECR'ye push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker tag your-app:latest your-account.dkr.ecr.us-east-1.amazonaws.com/your-app:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/your-app:latest
```

## 🔒 Güvenlik

### Environment Variables
```bash
# .env dosyasını güvenli tutun
chmod 600 .env

# Production'da secrets management kullanın
# - Docker Secrets
# - Kubernetes Secrets
# - Cloud provider secrets
```

### SSL/HTTPS
```bash
# Nginx SSL configuration ekleyin
# Let's Encrypt kullanın
certbot --nginx -d yourdomain.com
```

## 📊 Monitoring

### Health Check
```bash
# Health check endpoint'i
curl http://localhost/health
```

### Logs
```bash
# Application logs
docker-compose logs -f frontend

# Nginx logs
docker exec -it container_name tail -f /var/log/nginx/access.log
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && git pull && docker-compose up -d"
```

## 🐛 Troubleshooting

### Common Issues:

1. **Port 80 already in use**
   ```bash
   # Port'u değiştirin
   docker-compose up -d -p 8080:80
   ```

2. **Environment variables not loading**
   ```bash
   # .env dosyasını kontrol edin
   cat .env
   
   # Container'ı yeniden başlatın
   docker-compose restart
   ```

3. **Build fails**
   ```bash
   # Cache'i temizleyin
   docker-compose build --no-cache
   
   # Node modules'ı temizleyin
   rm -rf node_modules
   npm install
   ```

## 📈 Performance Optimization

### Nginx Configuration:
- Gzip compression
- Static file caching
- Security headers

### Docker Optimization:
- Multi-stage builds
- Alpine Linux base images
- Layer caching

## 🎯 Next Steps

1. **Domain Name** ayarlayın
2. **SSL Certificate** ekleyin
3. **CDN** (Cloudflare) ekleyin
4. **Monitoring** (Prometheus/Grafana) ekleyin
5. **Backup** stratejisi oluşturun

---

## 🆘 Yardım

Sorun yaşarsanız:
1. Logları kontrol edin: `docker-compose logs`
2. Container durumunu kontrol edin: `docker-compose ps`
3. Health check yapın: `curl http://localhost/health`
4. Issue açın veya destek alın

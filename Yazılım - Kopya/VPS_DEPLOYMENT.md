# 🖥️ VPS/Server'a Deploy Rehberi

## 📋 Gereksinimler:
- VPS/Server (DigitalOcean, Linode, Vultr, AWS EC2, vb.)
- SSH erişimi
- Docker kurulu
- Domain name (opsiyonel)

## 🚀 Adımlar:

### 1. **Server'a Bağlanın**
```bash
ssh root@your-server-ip
```

### 2. **Docker Kurulumu**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose kurulumu
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. **Projeyi Kopyalayın**
```bash
# Git ile
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Veya SCP ile
scp -r /local/path/to/project root@your-server-ip:/root/
```

### 4. **Environment Variables Ayarlayın**
```bash
# .env dosyasını oluşturun
nano .env

# Supabase bilgilerinizi ekleyin
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 5. **Deploy Edin**
```bash
# Build ve başlat
docker compose build
docker compose up -d

# Durumu kontrol edin
docker compose ps
```

### 6. **Nginx Reverse Proxy (Opsiyonel)**
```bash
# Nginx kurun
sudo apt update
sudo apt install nginx

# Konfigürasyon
sudo nano /etc/nginx/sites-available/notification-app

# İçerik:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Etkinleştirin
sudo ln -s /etc/nginx/sites-available/notification-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. **SSL Sertifikası (Let's Encrypt)**
```bash
# Certbot kurun
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası alın
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme
sudo crontab -e
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Yönetim Komutları:

### Docker Yönetimi:
```bash
# Uygulamayı başlat
docker compose up -d

# Uygulamayı durdur
docker compose down

# Logları görüntüle
docker compose logs -f

# Yeniden başlat
docker compose restart

# Güncelleme
git pull
docker compose build --no-cache
docker compose up -d
```

### Sistem Yönetimi:
```bash
# Disk kullanımı
df -h

# Memory kullanımı
free -h

# CPU kullanımı
htop

# Docker disk kullanımı
docker system df
```

## 🔒 Güvenlik:

### Firewall Ayarları:
```bash
# UFW kurun
sudo apt install ufw

# SSH
sudo ufw allow ssh

# HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# UFW'yi etkinleştirin
sudo ufw enable
```

### Fail2ban (Brute Force Koruması):
```bash
# Fail2ban kurun
sudo apt install fail2ban

# Konfigürasyon
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Servisi başlatın
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📊 Monitoring:

### Systemd Service (Opsiyonel):
```bash
# Service dosyası oluşturun
sudo nano /etc/systemd/system/notification-app.service

# İçerik:
[Unit]
Description=Notification App
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/root/your-repo
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target

# Etkinleştirin
sudo systemctl enable notification-app
sudo systemctl start notification-app
```

### Log Rotation:
```bash
# Docker log rotation
sudo nano /etc/docker/daemon.json

# İçerik:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Docker'ı yeniden başlatın
sudo systemctl restart docker
```

## 🔄 Backup:

### Otomatik Backup Script:
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Docker volumes backup
docker run --rm -v your-app_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/data_$DATE.tar.gz -C /data .

# Code backup
tar czf $BACKUP_DIR/code_$DATE.tar.gz /root/your-repo

# Eski backup'ları temizle (7 günden eski)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 💰 Maliyet Örnekleri:
- DigitalOcean: $5-12/ay
- Linode: $5-12/ay
- Vultr: $2.50-12/ay
- AWS EC2: $3-15/ay
- Google Cloud: $5-15/ay

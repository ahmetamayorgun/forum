# ☁️ Cloud Platform'a Deploy Rehberi

## 🚀 Hızlı Deploy Seçenekleri:

### 1. **Vercel (En Kolay)**
```bash
# Vercel CLI kurun
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2. **Netlify**
```bash
# Netlify CLI kurun
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=build
```

### 3. **DigitalOcean App Platform**
```yaml
# .do/app.yaml
name: notification-app
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  dockerfile_path: Dockerfile
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### 4. **Heroku**
```bash
# Heroku CLI kurun
npm install -g heroku

# Login
heroku login

# Container registry
heroku container:login

# Deploy
heroku container:push web
heroku container:release web
```

### 5. **AWS Amplify**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 6. **Google Cloud Run**
```bash
# Google Cloud CLI kurun
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Build ve push
gcloud builds submit --tag gcr.io/PROJECT_ID/notification-app

# Deploy
gcloud run deploy notification-app \
  --image gcr.io/PROJECT_ID/notification-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Environment Variables:

### Supabase Ayarları:
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Production Ayarları:
```bash
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

## 📊 Monitoring:

### Health Check:
```bash
curl https://your-app.vercel.app/health
```

### Logs:
```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Heroku
heroku logs --tail
```

## 🔒 SSL/HTTPS:
- Vercel: Otomatik
- Netlify: Otomatik
- Heroku: Otomatik
- DigitalOcean: Otomatik
- AWS: Otomatik

## 💰 Maliyet:
- Vercel: Ücretsiz (Hobby)
- Netlify: Ücretsiz (Starter)
- Heroku: $7/ay (Basic)
- DigitalOcean: $5/ay (Basic)
- AWS: Kullanıma göre

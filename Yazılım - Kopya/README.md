# Forum Uygulaması

Modern bir forum uygulaması. Supabase backend ile React ve TypeScript kullanılarak geliştirilmiştir.

## 🚀 Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Başlık oluşturma ve yönetimi
- ✅ Başlıklara yorum yapma
- ✅ Beğeni sistemi (like/dislike)
- ✅ **🏆 Puan Sistemi ve Üye Seviyeleri**
- ✅ **📝 Markdown Desteği** (başlık ve yorumlarda)
- ✅ **📂 Kategori Sistemi** (15 farklı kategori)
- ✅ **🔍 Arama Sistemi** (gelişmiş arama ve filtreleme)
- ✅ Responsive tasarım
- ✅ Modern UI/UX

## 🏆 Puan Sistemi

Forum uygulamasında kullanıcılar aktivitelerine göre puan kazanır ve üye seviyeleri elde eder:

### Puan Kazanma
- **📝 Başlık oluşturma**: 100 puan
- **💬 Yorum yapma**: 30 puan  
- **👍 Beğeni alma**: 10 puan (başlık veya yorum için)

### Üye Seviyeleri
- **🥉 Bronz Üye**: 0-999 puan
- **🥈 Gümüş Üye**: 1000-1999 puan
- **🥇 Altın Üye**: 2000-2999 puan
- **💠 Elmas Üye**: 3000-3999 puan
- **💎 Zümrüt Üye**: 4000+ puan

### Özellikler
- Kullanıcı isimlerinin yanında üye seviyesi emojileri görünür
- Profil sayfasında detaylı puan istatistikleri
- Puan geçmişi takibi
- Üye seviyesi değişiklik geçmişi
- En yüksek puanlı kullanıcılar listesi

## 🛠️ Teknolojiler

- **Frontend**: React 18, TypeScript
- **Backend**: Supabase
- **Styling**: CSS3
- **Routing**: React Router DOM
- **Markdown**: react-markdown, remark-gfm, rehype-highlight

## 📁 Proje Yapısı

```
forum-app/
├── src/                    # React uygulama kaynak kodları
│   ├── components/         # React bileşenleri
│   │   ├── MarkdownEditor.tsx    # Markdown editör bileşeni
│   │   ├── MarkdownRenderer.tsx  # Markdown renderer bileşeni
│   │   ├── MarkdownDemo.tsx      # Markdown demo sayfası
│   │   └── ...                   # Diğer bileşenler
│   ├── contexts/          # React context'leri
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Kütüphane dosyaları
│   ├── pages/             # Sayfa bileşenleri
│   └── utils/             # Yardımcı fonksiyonlar
├── public/                # Statik dosyalar
├── docs/                  # Dokümantasyon ve SQL dosyaları
│   ├── supabase-setup.sql # Temel Supabase kurulumu
│   ├── add-likes-system.sql # Beğeni sistemi
│   ├── add-points-system.sql # Puan sistemi
│   ├── insert-sample-points.sql # Örnek puan verileri
│   └── test-points-system.js # Puan sistemi test dosyası
├── package.json           # NPM bağımlılıkları
├── tsconfig.json          # TypeScript konfigürasyonu
└── README.md              # Bu dosya
```

## ⚡ Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Supabase Kurulumu
1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'de sırasıyla şu dosyaları çalıştırın:
   - `docs/supabase-setup.sql` - Temel tablolar
   - `docs/create-categories.sql` - Kategori sistemi
   - `docs/add-likes-system.sql` - Beğeni sistemi
   - `docs/add-points-system.sql` - Puan sistemi
   - `docs/create-storage-bucket.sql` - Profil fotoğrafı storage
   - `docs/insert-sample-points.sql` - Örnek veriler (opsiyonel)

### 3. Uygulamayı Başlatın
```bash
npm start
```

### 4. Tarayıcınızda Açın
`http://localhost:3000` adresine gidin.

## 📋 Supabase Kurulum Detayları

### Gerekli Tablolar
- `profiles` - Kullanıcı profilleri
- `topics` - Forum başlıkları
- `comments` - Yorumlar
- `categories` - Forum kategorileri
- `topic_likes` - Başlık beğenileri
- `comment_likes` - Yorum beğenileri
- `user_points` - Kullanıcı puanları
- `points_history` - Puan geçmişi
- `member_level_history` - Üye seviyesi geçmişi

### RLS (Row Level Security) Politikaları
Tüm tablolar için güvenlik politikaları otomatik olarak oluşturulur.

## 🎯 Kullanım

1. **Kayıt Ol**: Yeni bir hesap oluşturun
2. **Giriş Yap**: Mevcut hesabınızla giriş yapın
3. **Kategorileri Keşfet**: Ana sayfada veya "Kategoriler" menüsünden kategorileri görüntüleyin
4. **Başlık Oluştur**: "Yeni Başlık" butonuna tıklayarak yeni bir başlık oluşturun (+100 puan)
5. **Kategori Seç**: Başlık oluştururken uygun kategoriyi seçin
6. **Yorum Yap**: Başlıklara tıklayarak detaylarını görüntüleyin ve yorum yapın (+30 puan)
7. **Beğeni Al**: Başlık ve yorumlarınız beğeni aldığında puan kazanın (+10 puan)
8. **Seviye Atla**: Puanlarınızı artırarak üye seviyenizi yükseltin
9. **Markdown Kullan**: Başlık ve yorumlarda Markdown formatını kullanarak zengin içerik oluşturun

## 📂 Kategori Sistemi

Forum uygulamasında **15 farklı kategori** bulunmaktadır:

### Mevcut Kategoriler
- **💻 Teknoloji** - Bilgisayar, telefon, tablet ve diğer teknolojik ürünler
- **🎮 Oyun** - Video oyunları, konsol oyunları ve oyun dünyası
- **📱 Mobil** - Akıllı telefonlar, tabletler ve mobil uygulamalar
- **💡 Yazılım** - Programlama, yazılım geliştirme ve teknoloji haberleri
- **🛒 Alışveriş** - İndirimler, fırsatlar ve alışveriş tavsiyeleri
- **🎬 Eğlence** - Film, müzik, spor ve eğlence dünyası
- **🏠 Yaşam** - Günlük yaşam, sağlık ve kişisel gelişim
- **📚 Eğitim** - Eğitim, öğrenme ve kişisel gelişim konuları
- **💼 İş Dünyası** - Kariyer, iş hayatı ve profesyonel gelişim
- **🌍 Dünya** - Güncel olaylar, haberler ve dünya meseleleri
- **🚗 Otomotiv** - Araçlar, modifiye ve otomotiv dünyası
- **🏠 Emlak** - Emlak, konut ve gayrimenkul konuları
- **💰 Finans** - Ekonomi, yatırım ve finansal konular
- **🏥 Sağlık** - Sağlık, spor ve fitness konuları
- **🍔 Yemek** - Yemek tarifleri, restoranlar ve gastronomi

### Kategori Özellikleri
- **Kategori İstatistikleri** - Her kategori için başlık sayısı
- **Kategori Sayfaları** - `/category/[slug]` URL'leri ile kategori bazlı görüntüleme
- **Kategori Seçici** - Başlık oluştururken kategori seçimi
- **Responsive Tasarım** - Mobil uyumlu kategori kartları
- **Otomatik Sayım** - Başlık sayıları otomatik güncellenir

## 📝 Markdown Desteği

Forum uygulamasında başlık ve yorumlarda **Markdown** formatını kullanabilirsiniz:

### Desteklenen Özellikler
- **Başlıklar**: `# H1`, `## H2`, `### H3` vb.
- **Metin Formatları**: `**kalın**`, `*italik*`, `~~üstü çizili~~`
- **Linkler**: `[metin](url)`
- **Resimler**: `![alt](url)`
- **Kod Blokları**: `\`\`\`javascript` ve satır içi `\`kod\``
- **Listeler**: `- liste` ve `1. numaralı liste`
- **Alıntılar**: `> alıntı metni`
- **Tablolar**: `| sütun1 | sütun2 |`
- **Task Listeleri**: `[ ] görev` ve `[x] tamamlanmış`

### Editör Özellikleri
- ✏️ **Düzenle/Önizleme** modları
- 🎯 **Markdown kısayolları** (toolbar)
- ❓ **Yardım paneli** (tüm komutlar)
- 📊 **Karakter sayacı**
- 🎨 **Syntax highlighting** (kod bloklarında)
- 📱 **Responsive tasarım**
- 🌙 **Dark mode** desteği

Demo için: `/markdown-demo` sayfasını ziyaret edin!

## 🔍 Arama Sistemi

Forum uygulamasında **gelişmiş arama ve filtreleme** özellikleri bulunmaktadır:

### Arama Özellikleri
- **🔍 Tam Metin Arama** - Başlık ve içeriklerde arama
- **💡 Akıllı Öneriler** - Arama sırasında otomatik öneriler
- **🕒 Arama Geçmişi** - Son aramaları kaydetme ve tekrar kullanma
- **🎯 Sonuç Vurgulama** - Arama terimlerini sonuçlarda vurgulama
- **📊 Sonuç İstatistikleri** - Bulunan sonuç sayısı gösterimi

### Gelişmiş Filtreler
- **📂 Kategori Filtresi** - Belirli kategorilerde arama
- **📅 Tarih Filtresi** - Bugün, bu hafta, bu ay, bu yıl
- **👤 Yazar Filtresi** - Belirli kullanıcıların başlıklarını arama
- **💬 Yorum Filtresi** - Yorumu olan başlıkları filtreleme
- **👍 Beğeni Filtresi** - Beğenisi olan başlıkları filtreleme

### Sıralama Seçenekleri
- **🎯 İlgi Sırası** - Arama terimine en uygun sonuçlar
- **🆕 En Yeni** - Oluşturulma tarihine göre sıralama
- **📈 En Popüler** - Beğeni sayısına göre sıralama
- **📅 En Eski** - Eski başlıklardan başlayarak sıralama

### Kullanım
1. **Ana Sayfa** - Üst kısımdaki arama çubuğunu kullanın
2. **Arama Sayfası** - `/search` sayfasından gelişmiş arama yapın
3. **Filtreler** - Arama sonuçlarını filtrelemek için sol paneli kullanın
4. **Sonuçlar** - Arama sonuçlarını inceleyin ve istediğiniz başlığa tıklayın

### Özellikler
- **📱 Responsive Tasarım** - Mobil uyumlu arama arayüzü
- **⚡ Hızlı Arama** - Gerçek zamanlı sonuçlar
- **🔄 Sayfalama** - "Daha Fazla Yükle" ile sonsuz kaydırma
- **🎨 Modern UI** - Kullanıcı dostu arama deneyimi
- **🌙 Dark Mode** - Karanlık tema desteği

## 🧪 Test

Puan sistemini test etmek için:
```bash
cd docs
node test-points-system.js
```

## 🚀 Geliştirme

```bash
# Geliştirme sunucusunu başlat
npm start

# Production build oluştur
npm run build

# Testleri çalıştır
npm test
```

## 📝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. 
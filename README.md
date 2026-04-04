# CalAndLens 📸🥗 — v4.0

AI destekli yemek takip PWA. Kamerayla yemek çek, Claude AI ile analiz et, tüm besin değerlerini takip et.

**Canlı:** https://calandlens2.vercel.app

---

## ✨ v4.0 Yeni Özellikler

| # | Özellik | Detay |
|---|---------|-------|
| 1 | 🌍 **Çok Dilli Destek** | TR, EN, ES, FR, DE — harici kütüphane yok, saf Context API |
| 2 | 🔍 **Barkod Veritabanı** | Open Food Facts API (4M+ ürün) + manuel ürün arama |
| 3 | ⚖️ **Porsiyon Tahmini** | AI görüntüden gramaj tahmin eder, kullanıcı slider ile onaylar |
| 4 | 🔬 **Mikro Besinler** | Fiber, sodyum, potasyum, kalsiyum, demir, A/C/D vitamini — GDV yüzdesi |
| 5 | 📅 **Geçmiş Günler** | Renk kodlu aylık takvim + gün detay ekranı |
| 6 | 📷 **Öğün Fotoğrafları** | Canvas ile sıkıştırma, localStorage'a FIFO kayıt, thumbnail göster |

---

## 🔧 Kurulum

### Gereksinimler
- **Node.js 18+**
- **Claude API Anahtarı** → https://console.anthropic.com

### 1. Bağımlılıkları yükle

```bash
npm install
```

> **Yeni eklenen paketler:**
> - `@zxing/library` — kameradan barkod okuma

### 2. `.env` dosyası oluştur

```env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
VITE_DAILY_CALORIE_GOAL=2000
```

### 3. Geliştirme sunucusu

```bash
npm run dev
# → http://localhost:5173
```

### 4. Production build

```bash
npm run build
npm run preview
```

### 5. Vercel'e deploy

```bash
# Vercel CLI ile (varsa):
vercel --prod

# Vercel Dashboard'dan environment variable ekle:
# VITE_ANTHROPIC_API_KEY = sk-ant-...
```

---

## 📁 Proje Yapısı

```
src/
├── locales/
│   ├── tr.json          # Türkçe çeviriler
│   ├── en.json          # İngilizce
│   ├── es.json          # İspanyolca
│   ├── fr.json          # Fransızca
│   └── de.json          # Almanca
│
├── hooks/
│   ├── useLanguage.js   # 🌍 Dil Context + tarayıcı algılama
│   ├── useLocalStorage.js  # Veri katmanı (öğünler, hedef, profil)
│   └── useMealPhotos.js    # 📷 Fotoğraf kayıt/okuma
│
├── services/
│   ├── aiService.js        # Claude API (analiz, gramaj, öneri)
│   ├── openFoodFacts.js    # 🔍 Barkod + arama servisi
│   └── nutritionDB.js      # 🔬 60+ yemek, mikro besinler dahil
│
└── components/
    ├── Camera/
    │   └── CameraView.jsx      # Kamera, galeri, ses, barkod butonu
    ├── Analysis/
    │   ├── ResultModal.jsx     # Analiz sonuç modalı
    │   ├── PortionEstimator.jsx # ⚖️ Gramaj onay ekranı
    │   └── MicroNutrientsPanel.jsx  # 🔬 Mikro besin gösterimi
    ├── Barcode/
    │   └── BarcodeScanner.jsx  # 🔍 ZXing + Open Food Facts UI
    ├── Dashboard/
    │   ├── DailySummary.jsx    # Ana özet + haftalık grafik
    │   ├── GoalWizard.jsx      # Hedef sihirbazı
    │   ├── EatingSpeedCoach.jsx
    │   └── WeeklyReport.jsx
    ├── History/
    │   ├── HistoryCalendar.jsx # 📅 Aylık takvim
    │   ├── DayDetail.jsx       # Gün özeti + öğün listesi
    │   └── HistoryPage.jsx     # Takvim + detay birleşimi
    ├── Meal/
    │   └── MealPhotoThumb.jsx  # 📷 Thumbnail + yükleme
    └── Settings/
        └── LanguageSelector.jsx # 🌍 Dil seçici dropdown
```

---

## 🌍 Çok Dilli Destek — Nasıl Çalışır?

`i18next` gibi harici kütüphane **kullanılmadı**. Saf React Context:

```js
import { useLanguage } from './hooks/useLanguage';
const { t, lang, setLang } = useLanguage();
// t('nutrition.calories') → "Kalori" / "Calories" / "Calorías" ...
```

Tarayıcı dili `navigator.language` ile algılanır, `localStorage`'a kaydedilir.

---

## 🔍 Barkod — Open Food Facts

```js
import { fetchByBarcode, searchByName } from './services/openFoodFacts';

// Barkod ile ara
const product = await fetchByBarcode('8690508100326');

// İsimle ara
const results = await searchByName('elmalı turta');
```

Sonuç `scaleToGrams(product, 150)` ile porsiyona ölçeklenir.

---

## ⚖️ Porsiyon Akışı

1. Kullanıcı fotoğraf çeker → AI analiz eder
2. `portionEstimateGrams` döner (örn. 200g)
3. `PortionEstimator` açılır → kullanıcı onayla / değiştir
4. `rescaleNutrition(result, original, confirmed)` çalışır
5. Öğün kaydedilir

---

## 🔬 Mikro Besinler

Her AI analizi şu alanları döndürür:
`fiber, sodium, potassium, calcium, iron, vitaminA, vitaminC, vitaminD`

Günlük değer yüzdesi (GDV) `DAILY_REFERENCE` ile hesaplanır.

---

## 📷 Öğün Fotoğrafları

- Kaydedilen fotoğraf canvas ile **360px'e** sıkıştırılır (JPEG 0.72)
- `localStorage`'da `calandlens_photo_{mealId}` anahtarıyla tutulur
- En fazla **40 fotoğraf** (FIFO, eski otomatik silinir)
- `MealPhotoThumb` editable modda fotoğraf değiştirmeye izin verir

---

## 🔐 Güvenlik Notu

Bu uygulama Claude API'yi **doğrudan tarayıcıdan** çağırır.
Production'da API anahtarını korumak için **Vercel Edge Function** kullanılması önerilir.

---

## 📦 Teknolojiler

| Paket | Versiyon | Amaç |
|-------|----------|------|
| React | 18 | UI |
| Vite | 5 | Build |
| TailwindCSS | 3 | Stil |
| @zxing/library | 0.21 | Barkod okuma |
| react-webcam | 7 | Kamera |
| recharts | 2 | Grafik |
| vite-plugin-pwa | 0.19 | PWA/Service Worker |
| Claude API | claude-opus-4-5 | AI analiz |
| Open Food Facts | — | Barkod DB (ücretsiz) |

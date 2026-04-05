/**
 * CalAndLens AI Service v5
 * Google Vision API + Mock mod (Claude API yok)
 */

const VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Besin veritabanı (Google Vision'dan gelen etiketi kalori bilgisine çevirmek için)
const FOOD_DB = {
  'kebap': { calories: 350, protein: 25, carbs: 15, fat: 20, sugar: 2, name: 'Kebap', icon: '🍖' },
  'tavuk': { calories: 250, protein: 30, carbs: 0, fat: 12, sugar: 0, name: 'Tavuk', icon: '🍗' },
  'pilav': { calories: 200, protein: 4, carbs: 45, fat: 1, sugar: 0, name: 'Pilav', icon: '🍚' },
  'makarna': { calories: 300, protein: 10, carbs: 50, fat: 5, sugar: 2, name: 'Makarna', icon: '🍝' },
  'salata': { calories: 50, protein: 2, carbs: 8, fat: 1, sugar: 3, name: 'Salata', icon: '🥗' },
  'çorba': { calories: 100, protein: 5, carbs: 15, fat: 3, sugar: 2, name: 'Çorba', icon: '🥣' },
  'pizza': { calories: 280, protein: 12, carbs: 30, fat: 12, sugar: 3, name: 'Pizza', icon: '🍕' },
  'hamburger': { calories: 500, protein: 25, carbs: 40, fat: 25, sugar: 8, name: 'Hamburger', icon: '🍔' },
  'balık': { calories: 200, protein: 25, carbs: 0, fat: 10, sugar: 0, name: 'Balık', icon: '🐟' },
  'köfte': { calories: 300, protein: 20, carbs: 10, fat: 20, sugar: 1, name: 'Köfte', icon: '🍘' },
  'patates': { calories: 150, protein: 3, carbs: 35, fat: 0, sugar: 2, name: 'Patates', icon: '🥔' },
  'yumurta': { calories: 70, protein: 6, carbs: 1, fat: 5, sugar: 0, name: 'Yumurta', icon: '🥚' },
  'meyve': { calories: 60, protein: 1, carbs: 15, fat: 0, sugar: 12, name: 'Meyve', icon: '🍎' },
  'tatlı': { calories: 350, protein: 5, carbs: 50, fat: 15, sugar: 30, name: 'Tatlı', icon: '🍰' },
  'ekmek': { calories: 80, protein: 3, carbs: 15, fat: 1, sugar: 1, name: 'Ekmek', icon: '🍞' },
  'peynir': { calories: 120, protein: 7, carbs: 1, fat: 10, sugar: 0, name: 'Peynir', icon: '🧀' },
  'zeytin': { calories: 115, protein: 1, carbs: 3, fat: 11, sugar: 0, name: 'Zeytin', icon: '🫒' },
  'yoğurt': { calories: 60, protein: 5, carbs: 4, fat: 3, sugar: 4, name: 'Yoğurt', icon: '🥄' },
};

const DEFAULT_FOOD = { calories: 200, protein: 10, carbs: 20, fat: 8, sugar: 5, name: 'Yemek', icon: '🍽️' };

// ── Yardımcı fonksiyonlar ──────────────────────────────────────────────────
function isFoodRelated(label) {
  const foodKeywords = [
    'food', 'meal', 'dish', 'cuisine', 'dinner', 'lunch', 'breakfast',
    'kebap', 'tavuk', 'pilav', 'makarna', 'salata', 'çorba', 'pizza', 'hamburger',
    'balık', 'köfte', 'patates', 'yumurta', 'meyve', 'tatlı', 'ekmek', 'peynir',
    'cheese', 'meat', 'vegetable', 'fruit', 'rice', 'noodle', 'soup', 'salad',
    'chicken', 'fish', 'cake', 'dessert', 'bread', 'egg', 'potato', 'pasta'
  ];
  return foodKeywords.some(k => label.toLowerCase().includes(k));
}

function matchFoodToNutrition(foodLabel) {
  const label = foodLabel.toLowerCase();
  for (const [key, value] of Object.entries(FOOD_DB)) {
    if (label.includes(key)) return { ...value, portionEstimateGrams: 200, confidence: 0.85 };
  }
  for (const [key, value] of Object.entries(FOOD_DB)) {
    if (key.includes(label) || label.includes(key)) return { ...value, portionEstimateGrams: 200, confidence: 0.7 };
  }
  return { ...DEFAULT_FOOD, portionEstimateGrams: 200, confidence: 0.5 };
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : Math.round(n * 10) / 10;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fotoğraf analizi (Google Vision API)
 */
export async function analyzeFood(base64, mediaType = 'image/jpeg', lang = 'tr') {
  // API anahtarı yoksa mock mod
  if (!VISION_API_KEY || VISION_API_KEY === 'AIzaSy...') {
    console.log('🔧 Mock mod: Google Vision API anahtarı yok');
    return getMockAnalysis();
  }

  try {
    const base64Data = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
    const requestBody = {
      requests: [{
        image: { content: base64Data },
        features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
      }]
    };

    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`API ${response.status}`);

    const data = await response.json();
    const labels = data.responses[0]?.labelAnnotations || [];
    const foodLabels = labels.filter(l => isFoodRelated(l.description));

    if (foodLabels.length === 0) {
      return matchFoodToNutrition(labels[0]?.description || 'yemek');
    }

    const bestMatch = foodLabels.reduce((a, b) => a.score > b.score ? a : b);
    return matchFoodToNutrition(bestMatch.description);

  } catch (error) {
    console.error('Google Vision hatası:', error);
    return getMockAnalysis();
  }
}

/**
 * Sesli giriş / metin analizi (mock mod)
 */
export async function analyzeFoodByText(text, lang = 'tr') {
  console.log('🎤 Sesli giriş analizi (mock):', text);
  
  const keywords = {
    'elma': { name: 'Elma', calories: 80, protein: 0.5, carbs: 21, fat: 0.3, sugar: 17, icon: '🍎' },
    'muz': { name: 'Muz', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, sugar: 14, icon: '🍌' },
    'portakal': { name: 'Portakal', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, sugar: 12, icon: '🍊' },
    'çorba': { name: 'Çorba', calories: 150, protein: 6, carbs: 20, fat: 5, sugar: 3, icon: '🥣' },
    'tavuk': { name: 'Tavuk', calories: 250, protein: 30, carbs: 0, fat: 14, sugar: 0, icon: '🍗' },
    'salata': { name: 'Salata', calories: 80, protein: 3, carbs: 10, fat: 3, sugar: 4, icon: '🥗' },
    'pilav': { name: 'Pilav', calories: 200, protein: 4, carbs: 44, fat: 1, sugar: 0, icon: '🍚' },
    'makarna': { name: 'Makarna', calories: 300, protein: 10, carbs: 50, fat: 5, sugar: 2, icon: '🍝' },
    'ekmek': { name: 'Ekmek', calories: 80, protein: 3, carbs: 15, fat: 1, sugar: 1, icon: '🍞' },
    'peynir': { name: 'Peynir', calories: 120, protein: 7, carbs: 1, fat: 10, sugar: 0, icon: '🧀' },
  };

  for (const [key, value] of Object.entries(keywords)) {
    if (text.toLowerCase().includes(key)) {
      return {
        name: value.name,
        portionEstimateGrams: 150,
        calories: value.calories,
        protein: value.protein,
        carbs: value.carbs,
        fat: value.fat,
        sugar: value.sugar,
        fiber: 0,
        sodium: 0,
        potassium: 0,
        calcium: 0,
        iron: 0,
        vitaminA: 0,
        vitaminC: 0,
        vitaminD: 0,
        confidence: 0.9,
        icon: value.icon,
        source: 'voice'
      };
    }
  }

  return {
    name: text.slice(0, 30),
    portionEstimateGrams: 150,
    calories: 150,
    protein: 5,
    carbs: 20,
    fat: 5,
    sugar: 3,
    fiber: 0,
    sodium: 0,
    potassium: 0,
    calcium: 0,
    iron: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    confidence: 0.6,
    icon: '🍽️',
    source: 'voice'
  };
}

/**
 * AI beslenme önerisi (template tabanlı, API yok)
 */
export async function getDailyTip(totals, goal, lang = 'tr') {
  const remaining = Math.max(0, goal - totals.calories);
  const proteinPct = Math.round((totals.protein / 50) * 100);
  
  const tips = {
    tr: [
      `🥗 Bugün ${Math.round(totals.calories)} kcal aldın. Hedefine ${Math.round(remaining)} kcal kaldı.`,
      `💪 Protein hedefine %${proteinPct} ulaştın. Dengeli beslenmeye devam et!`,
      `🍎 Sebze ve meyve tüketimini artırarak bağışıklığını güçlendirebilirsin.`,
      `💧 Gün boyu su içmeyi unutma! Susuzluk bazen açlık hissi yaratabilir.`,
      `🌙 Akşam yemeğini hafif tutmak kaliteli uyku için önemlidir.`,
    ],
    en: [
      `🥗 You've consumed ${Math.round(totals.calories)} kcal today. ${Math.round(remaining)} kcal left to reach your goal.`,
      `💪 You've reached ${proteinPct}% of your protein goal. Keep up the balanced diet!`,
      `🍎 Eating more fruits and vegetables can boost your immune system.`,
      `💧 Don't forget to drink water throughout the day! Thirst can sometimes feel like hunger.`,
      `🌙 Keeping dinner light is important for quality sleep.`,
    ]
  };
  
  const tipList = tips[lang] || tips.tr;
  return tipList[Math.floor(Math.random() * tipList.length)];
}

/**
 * Porsiyon değiştiğinde besin değerlerini orantıyla güncelle
 */
export function rescaleNutrition(nutrition, fromGrams, toGrams) {
  if (!fromGrams || fromGrams === toGrams) return { ...nutrition, portionGrams: toGrams };
  const f = toGrams / fromGrams;
  const keys = ['calories', 'protein', 'carbs', 'fat', 'sugar', 'fiber', 'sodium', 'potassium', 'calcium', 'iron', 'vitaminA', 'vitaminC', 'vitaminD'];
  const out = { ...nutrition };
  for (const k of keys) {
    if (out[k] != null) out[k] = Math.round(out[k] * f * 10) / 10;
  }
  out.portionGrams = toGrams;
  return out;
}

/**
 * Mock analiz (API anahtarı yokken veya hata durumunda)
 */
function getMockAnalysis() {
  const mockFoods = [
    { name: 'Tavuklu Pilav', calories: 450, protein: 28, carbs: 52, fat: 15, sugar: 2, icon: '🍗', portionEstimateGrams: 250 },
    { name: 'Izgara Somon', calories: 380, protein: 34, carbs: 2, fat: 26, sugar: 1, icon: '🐟', portionEstimateGrams: 200 },
    { name: 'Mercimek Çorbası', calories: 150, protein: 8, carbs: 22, fat: 4, sugar: 3, icon: '🥣', portionEstimateGrams: 300 },
    { name: 'Sebzeli Makarna', calories: 420, protein: 12, carbs: 68, fat: 12, sugar: 6, icon: '🍝', portionEstimateGrams: 280 },
    { name: 'Yoğurtlu Kebap', calories: 520, protein: 32, carbs: 35, fat: 28, sugar: 5, icon: '🍖', portionEstimateGrams: 300 },
    { name: 'Kahvaltı Tabağı', calories: 350, protein: 15, carbs: 40, fat: 15, sugar: 8, icon: '🍳', portionEstimateGrams: 200 },
  ];
  const random = Math.floor(Math.random() * mockFoods.length);
  return { ...mockFoods[random], confidence: 0.8, source: 'mock' };
}

// Eski fonksiyon isimleriyle uyumluluk (alias)
export const analyzeFoodImage = analyzeFood;
export const parseVoiceInput = analyzeFoodByText;

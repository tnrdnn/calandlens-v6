/**
 * CalAndLens AI Service v4
 * Claude API entegrasyonu — mikro besin + gramaj tahmini + çok dil desteği
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-5';

const SYSTEM_PROMPT = `Sen uzman bir beslenme analisti yapay zekasısın.
Yemek fotoğraflarını veya yazılı besin açıklamalarını analiz edip JSON formatında kesin besin değerleri döndürürsün.

ZORUNLU ÇIKTI — sadece geçerli JSON, başka hiçbir şey:
{
  "name": "Yemek adı",
  "portionEstimateGrams": 200,
  "calories": 350,
  "protein": 25.0,
  "carbs": 30.0,
  "fat": 12.0,
  "sugar": 5.0,
  "fiber": 4.0,
  "sodium": 480,
  "potassium": 320,
  "calcium": 85,
  "iron": 2.5,
  "vitaminA": 120,
  "vitaminC": 8.0,
  "vitaminD": 0.5,
  "confidence": 0.85,
  "icon": "🍽️"
}

KURALLAR:
- portionEstimateGrams: Görüntüdeki GERÇEK porsiyon gramajı (50-800 arası). Fotoğraf yoksa 150 kullan.
- Tüm besin değerleri TAHMİN EDİLEN PORSİYON içindir (100g bazında DEĞİL).
- sodium, potassium, calcium: mg cinsinden
- iron, vitaminC, vitaminD: mg cinsinden  
- vitaminA: µg cinsinden
- Bilinmeyen mikro besinler için 0 yaz, asla uydurma.
- confidence: 0.0–1.0 (görüntü kalitesi ve netliğe göre)
- icon: uygun emoji
- Sadece JSON döndür. Markdown yok, açıklama yok, kod bloğu yok.`;

const LANG_PROMPTS = {
  tr: 'Bu yemek fotoğrafını analiz et. Tahmini gramajı ve tüm besin değerlerini JSON formatında ver.',
  en: 'Analyze this food photo. Return estimated grams and all nutrition values in JSON format.',
  es: 'Analiza esta foto de comida. Devuelve los gramos estimados y todos los valores nutricionales en formato JSON.',
  fr: 'Analyse cette photo de nourriture. Retourne les grammes estimés et toutes les valeurs nutritionnelles en JSON.',
  de: 'Analysiere dieses Lebensmittelfoto. Gib geschätzte Gramm und alle Nährwerte im JSON-Format zurück.',
};

const TEXT_PROMPTS = {
  tr: (text) => `Şu yiyeceği analiz et: "${text}". Tahmini gramajı ve besin değerlerini JSON formatında ver.`,
  en: (text) => `Analyze this food: "${text}". Return estimated grams and nutrition values in JSON format.`,
  es: (text) => `Analiza este alimento: "${text}". Devuelve los gramos estimados y los valores nutricionales en JSON.`,
  fr: (text) => `Analyse cet aliment: "${text}". Retourne les grammes estimés et les valeurs nutritionnelles en JSON.`,
  de: (text) => `Analysiere dieses Lebensmittel: "${text}". Gib geschätzte Gramm und Nährwerte im JSON-Format zurück.`,
};

const TIP_PROMPTS = {
  tr: (stats, goal) => `Bugünkü besin alımım: ${Math.round(stats.calories)} kcal (hedef: ${goal}), protein: ${Math.round(stats.protein)}g, karbonhidrat: ${Math.round(stats.carbs)}g, yağ: ${Math.round(stats.fat)}g. 2-3 cümlelik kişisel, pozitif bir beslenme tavsiyesi ver. Türkçe yaz.`,
  en: (stats, goal) => `Today's intake: ${Math.round(stats.calories)} kcal (goal: ${goal}), protein: ${Math.round(stats.protein)}g, carbs: ${Math.round(stats.carbs)}g, fat: ${Math.round(stats.fat)}g. Give a 2-3 sentence personal, positive nutrition tip. Write in English.`,
  es: (stats, goal) => `Ingesta de hoy: ${Math.round(stats.calories)} kcal (meta: ${goal}), proteínas: ${Math.round(stats.protein)}g, carbohidratos: ${Math.round(stats.carbs)}g, grasas: ${Math.round(stats.fat)}g. Da un consejo nutricional positivo de 2-3 frases. Escribe en español.`,
  fr: (stats, goal) => `Apport d'aujourd'hui: ${Math.round(stats.calories)} kcal (objectif: ${goal}), protéines: ${Math.round(stats.protein)}g, glucides: ${Math.round(stats.carbs)}g, lipides: ${Math.round(stats.fat)}g. Donne un conseil nutritionnel positif en 2-3 phrases. Écris en français.`,
  de: (stats, goal) => `Heutige Aufnahme: ${Math.round(stats.calories)} kcal (Ziel: ${goal}), Protein: ${Math.round(stats.protein)}g, Kohlenhydrate: ${Math.round(stats.carbs)}g, Fett: ${Math.round(stats.fat)}g. Gib einen 2-3-seitigen persönlichen, positiven Ernährungstipp. Schreibe auf Deutsch.`,
};

// ── Core fetch helper ──────────────────────────────────────────────────────
async function callClaude(messages, maxTokens = 1024) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY tanımlı değil');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system: SYSTEM_PROMPT, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API ${res.status}`);
  }

  return res.json();
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Fotoğraf analizi
 * @param {string} base64 - data URL'den ayrılmış saf base64
 * @param {string} mediaType
 * @param {string} lang
 */
export async function analyzeFood(base64, mediaType = 'image/jpeg', lang = 'tr') {
  const data = await callClaude([{
    role: 'user',
    content: [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
      { type: 'text', text: LANG_PROMPTS[lang] || LANG_PROMPTS.tr },
    ],
  }]);
  return parseResult(data);
}

/**
 * Metin/ses analizi
 * @param {string} text
 * @param {string} lang
 */
export async function analyzeFoodByText(text, lang = 'tr') {
  const promptFn = TEXT_PROMPTS[lang] || TEXT_PROMPTS.tr;
  const data = await callClaude([{
    role: 'user',
    content: promptFn(text),
  }]);
  return parseResult(data);
}

/**
 * Günlük beslenme önerisi
 * @param {{ calories, protein, carbs, fat }} totals
 * @param {number} goal
 * @param {string} lang
 */
export async function getDailyTip(totals, goal, lang = 'tr') {
  const promptFn = TIP_PROMPTS[lang] || TIP_PROMPTS.tr;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: promptFn(totals, goal) }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || '';
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseResult(data) {
  const text = data.content?.map(b => b.text || '').join('') || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('JSON bulunamadı: ' + text.slice(0, 200));

  const raw = JSON.parse(match[0]);
  return {
    name: String(raw.name || 'Yemek'),
    portionEstimateGrams: Math.max(10, Number(raw.portionEstimateGrams) || 150),
    calories: num(raw.calories),
    protein: num(raw.protein),
    carbs: num(raw.carbs),
    fat: num(raw.fat),
    sugar: num(raw.sugar),
    fiber: num(raw.fiber),
    sodium: num(raw.sodium),
    potassium: num(raw.potassium),
    calcium: num(raw.calcium),
    iron: num(raw.iron),
    vitaminA: num(raw.vitaminA),
    vitaminC: num(raw.vitaminC),
    vitaminD: num(raw.vitaminD),
    confidence: Math.min(1, Math.max(0, Number(raw.confidence) || 0.7)),
    icon: String(raw.icon || '🍽️'),
    source: 'ai',
  };
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : Math.round(n * 10) / 10;
}

/**
 * Porsiyon değiştiğinde besin değerlerini orantıyla güncelle
 */
export function rescaleNutrition(nutrition, fromGrams, toGrams) {
  if (!fromGrams || fromGrams === toGrams) return { ...nutrition, portionGrams: toGrams };
  const f = toGrams / fromGrams;
  const keys = ['calories','protein','carbs','fat','sugar','fiber','sodium','potassium','calcium','iron','vitaminA','vitaminC','vitaminD'];
  const out = { ...nutrition };
  for (const k of keys) {
    if (out[k] != null) out[k] = Math.round(out[k] * f * 10) / 10;
  }
  out.portionGrams = toGrams;
  return out;
}

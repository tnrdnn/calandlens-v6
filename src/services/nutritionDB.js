/**
 * CalAndLens Nutrition Database v4
 * All values per 100g unless noted.
 * Micronutrients: fiber(g), sodium(mg), potassium(mg), calcium(mg),
 *                 iron(mg), vitaminA(µg), vitaminC(mg), vitaminD(µg)
 */

export const NUTRITION_DB = {
  // ── Grains & Pasta ──────────────────────────────────────────────────────
  'pirinç': { calories: 130, protein: 2.7, carbs: 28.7, fat: 0.3, sugar: 0, fiber: 0.4, sodium: 1, potassium: 35, calcium: 10, iron: 0.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍚' },
  'makarna': { calories: 131, protein: 5.0, carbs: 25.0, fat: 1.1, sugar: 0.6, fiber: 1.8, sodium: 1, potassium: 44, calcium: 7, iron: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍝' },
  'ekmek': { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, sugar: 5.0, fiber: 2.7, sodium: 491, potassium: 115, calcium: 107, iron: 2.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍞' },
  'bulgur': { calories: 83, protein: 3.1, carbs: 18.6, fat: 0.2, sugar: 0.1, fiber: 4.5, sodium: 5, potassium: 68, calcium: 10, iron: 1.0, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🌾' },
  'yulaf': { calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, sugar: 1.0, fiber: 10.6, sodium: 2, potassium: 429, calcium: 54, iron: 4.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🥣' },

  // ── Legumes ─────────────────────────────────────────────────────────────
  'mercimek': { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, sugar: 1.8, fiber: 7.9, sodium: 2, potassium: 369, calcium: 19, iron: 3.3, vitaminA: 8, vitaminC: 1.5, vitaminD: 0, icon: '🫘' },
  'nohut': { calories: 164, protein: 8.9, carbs: 27.4, fat: 2.6, sugar: 4.8, fiber: 7.6, sodium: 7, potassium: 291, calcium: 49, iron: 2.9, vitaminA: 1, vitaminC: 1.3, vitaminD: 0, icon: '🫘' },
  'fasulye': { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, sugar: 0.3, fiber: 6.4, sodium: 2, potassium: 405, calcium: 28, iron: 2.2, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🫘' },

  // ── Meat & Poultry ───────────────────────────────────────────────────────
  'tavuk göğsü': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, sugar: 0, fiber: 0, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, vitaminA: 9, vitaminC: 0, vitaminD: 0.1, icon: '🍗' },
  'kıyma': { calories: 250, protein: 26.0, carbs: 0, fat: 15.0, sugar: 0, fiber: 0, sodium: 75, potassium: 318, calcium: 18, iron: 2.7, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, icon: '🥩' },
  'dana eti': { calories: 217, protein: 26.1, carbs: 0, fat: 11.8, sugar: 0, fiber: 0, sodium: 72, potassium: 318, calcium: 18, iron: 2.6, vitaminA: 0, vitaminC: 0, vitaminD: 0.1, icon: '🥩' },
  'balık': { calories: 206, protein: 22.0, carbs: 0, fat: 12.0, sugar: 0, fiber: 0, sodium: 61, potassium: 480, calcium: 16, iron: 0.9, vitaminA: 15, vitaminC: 0, vitaminD: 16.0, icon: '🐟' },
  'somon': { calories: 208, protein: 20.4, carbs: 0, fat: 13.4, sugar: 0, fiber: 0, sodium: 59, potassium: 363, calcium: 9, iron: 0.8, vitaminA: 50, vitaminC: 3.9, vitaminD: 11.0, icon: '🐟' },

  // ── Dairy & Eggs ─────────────────────────────────────────────────────────
  'yumurta': { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, sugar: 1.1, fiber: 0, sodium: 124, potassium: 126, calcium: 56, iron: 1.8, vitaminA: 149, vitaminC: 0, vitaminD: 2.0, icon: '🥚' },
  'süt': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, sugar: 5.1, fiber: 0, sodium: 44, potassium: 132, calcium: 113, iron: 0.1, vitaminA: 46, vitaminC: 0, vitaminD: 1.0, icon: '🥛' },
  'yoğurt': { calories: 59, protein: 3.5, carbs: 5.0, fat: 3.3, sugar: 5.0, fiber: 0, sodium: 46, potassium: 141, calcium: 121, iron: 0.1, vitaminA: 27, vitaminC: 0.5, vitaminD: 0, icon: '🥛' },
  'peynir': { calories: 402, protein: 25.0, carbs: 1.3, fat: 33.0, sugar: 0.5, fiber: 0, sodium: 621, potassium: 98, calcium: 721, iron: 0.7, vitaminA: 262, vitaminC: 0, vitaminD: 0.6, icon: '🧀' },

  // ── Vegetables ───────────────────────────────────────────────────────────
  'domates': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, sugar: 2.6, fiber: 1.2, sodium: 5, potassium: 237, calcium: 10, iron: 0.3, vitaminA: 42, vitaminC: 14, vitaminD: 0, icon: '🍅' },
  'salatalık': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, sugar: 1.7, fiber: 0.5, sodium: 2, potassium: 147, calcium: 16, iron: 0.3, vitaminA: 5, vitaminC: 2.8, vitaminD: 0, icon: '🥒' },
  'brokoli': { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, sugar: 1.7, fiber: 2.6, sodium: 33, potassium: 316, calcium: 47, iron: 0.7, vitaminA: 31, vitaminC: 89.2, vitaminD: 0, icon: '🥦' },
  'ıspanak': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sugar: 0.4, fiber: 2.2, sodium: 79, potassium: 558, calcium: 99, iron: 2.7, vitaminA: 469, vitaminC: 28.1, vitaminD: 0, icon: '🥬' },
  'havuç': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, sugar: 4.7, fiber: 2.8, sodium: 69, potassium: 320, calcium: 33, iron: 0.3, vitaminA: 835, vitaminC: 5.9, vitaminD: 0, icon: '🥕' },
  'patates': { calories: 77, protein: 2.0, carbs: 17.5, fat: 0.1, sugar: 0.8, fiber: 2.1, sodium: 6, potassium: 421, calcium: 12, iron: 0.8, vitaminA: 0, vitaminC: 19.7, vitaminD: 0, icon: '🥔' },
  'soğan': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, sugar: 4.2, fiber: 1.7, sodium: 4, potassium: 146, calcium: 23, iron: 0.2, vitaminA: 0, vitaminC: 7.4, vitaminD: 0, icon: '🧅' },

  // ── Fruits ───────────────────────────────────────────────────────────────
  'elma': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, sugar: 10.4, fiber: 2.4, sodium: 1, potassium: 107, calcium: 6, iron: 0.1, vitaminA: 3, vitaminC: 4.6, vitaminD: 0, icon: '🍎' },
  'muz': { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, sugar: 12.2, fiber: 2.6, sodium: 1, potassium: 358, calcium: 5, iron: 0.3, vitaminA: 3, vitaminC: 8.7, vitaminD: 0, icon: '🍌' },
  'portakal': { calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, sugar: 9.4, fiber: 2.4, sodium: 0, potassium: 181, calcium: 40, iron: 0.1, vitaminA: 11, vitaminC: 53.2, vitaminD: 0, icon: '🍊' },
  'çilek': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, sugar: 4.9, fiber: 2.0, sodium: 1, potassium: 153, calcium: 16, iron: 0.4, vitaminA: 1, vitaminC: 58.8, vitaminD: 0, icon: '🍓' },

  // ── Nuts & Seeds ─────────────────────────────────────────────────────────
  'badem': { calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, sugar: 4.4, fiber: 12.5, sodium: 1, potassium: 733, calcium: 264, iron: 3.7, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🌰' },
  'ceviz': { calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, sugar: 2.6, fiber: 6.7, sodium: 2, potassium: 441, calcium: 98, iron: 2.9, vitaminA: 1, vitaminC: 1.3, vitaminD: 0, icon: '🌰' },
  'fındık': { calories: 628, protein: 15.0, carbs: 16.7, fat: 60.8, sugar: 4.3, fiber: 9.7, sodium: 0, potassium: 680, calcium: 114, iron: 4.7, vitaminA: 1, vitaminC: 6.3, vitaminD: 0, icon: '🌰' },

  // ── Turkish Dishes ────────────────────────────────────────────────────────
  'köfte': { calories: 242, protein: 18.0, carbs: 8.0, fat: 16.0, sugar: 1.0, fiber: 0.5, sodium: 320, potassium: 270, calcium: 30, iron: 2.5, vitaminA: 5, vitaminC: 0, vitaminD: 0, icon: '🥙' },
  'döner': { calories: 260, protein: 20.0, carbs: 8.0, fat: 17.0, sugar: 2.0, fiber: 0.8, sodium: 380, potassium: 290, calcium: 25, iron: 2.0, vitaminA: 5, vitaminC: 1, vitaminD: 0, icon: '🌯' },
  'pilav': { calories: 150, protein: 3.0, carbs: 31.0, fat: 2.0, sugar: 0, fiber: 0.5, sodium: 5, potassium: 55, calcium: 12, iron: 0.5, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍚' },
  'çorba': { calories: 45, protein: 2.5, carbs: 7.0, fat: 1.2, sugar: 1.0, fiber: 1.5, sodium: 450, potassium: 180, calcium: 20, iron: 0.8, vitaminA: 20, vitaminC: 2, vitaminD: 0, icon: '🍲' },
  'salata': { calories: 25, protein: 1.5, carbs: 4.0, fat: 0.5, sugar: 2.0, fiber: 2.0, sodium: 10, potassium: 200, calcium: 40, iron: 0.5, vitaminA: 80, vitaminC: 15, vitaminD: 0, icon: '🥗' },
  'börek': { calories: 320, protein: 10.0, carbs: 32.0, fat: 18.0, sugar: 1.5, fiber: 1.2, sodium: 480, potassium: 120, calcium: 180, iron: 1.8, vitaminA: 40, vitaminC: 0, vitaminD: 0.2, icon: '🥧' },
  'lahmacun': { calories: 265, protein: 12.0, carbs: 34.0, fat: 9.0, sugar: 3.0, fiber: 2.0, sodium: 420, potassium: 200, calcium: 45, iron: 2.2, vitaminA: 20, vitaminC: 5, vitaminD: 0, icon: '🫓' },
  'pide': { calories: 280, protein: 12.0, carbs: 38.0, fat: 9.0, sugar: 2.0, fiber: 1.5, sodium: 400, potassium: 180, calcium: 90, iron: 2.0, vitaminA: 10, vitaminC: 0, vitaminD: 0, icon: '🫓' },

  // ── Fast Food / Common ────────────────────────────────────────────────────
  'pizza': { calories: 266, protein: 11.4, carbs: 33.0, fat: 10.0, sugar: 3.6, fiber: 2.3, sodium: 598, potassium: 172, calcium: 188, iron: 2.5, vitaminA: 66, vitaminC: 1.2, vitaminD: 0.2, icon: '🍕' },
  'hamburger': { calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, sugar: 5.0, fiber: 1.3, sodium: 396, potassium: 256, calcium: 60, iron: 2.8, vitaminA: 15, vitaminC: 1, vitaminD: 0.1, icon: '🍔' },
  'sandviç': { calories: 250, protein: 12.0, carbs: 30.0, fat: 9.0, sugar: 4.0, fiber: 2.0, sodium: 550, potassium: 200, calcium: 80, iron: 2.0, vitaminA: 10, vitaminC: 2, vitaminD: 0, icon: '🥪' },

  // ── Sweets & Snacks ───────────────────────────────────────────────────────
  'çikolata': { calories: 546, protein: 4.9, carbs: 60.0, fat: 31.0, sugar: 48.0, fiber: 7.0, sodium: 24, potassium: 559, calcium: 56, iron: 11.9, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍫' },
  'baklava': { calories: 428, protein: 8.0, carbs: 48.0, fat: 23.0, sugar: 22.0, fiber: 2.0, sodium: 150, potassium: 180, calcium: 90, iron: 2.5, vitaminA: 10, vitaminC: 0, vitaminD: 0, icon: '🍮' },
  'dondurma': { calories: 207, protein: 3.5, carbs: 23.6, fat: 11.0, sugar: 21.0, fiber: 0, sodium: 80, potassium: 199, calcium: 128, iron: 0.1, vitaminA: 105, vitaminC: 0.6, vitaminD: 0.1, icon: '🍦' },

  // ── Beverages ────────────────────────────────────────────────────────────
  'çay': { calories: 2, protein: 0, carbs: 0.4, fat: 0, sugar: 0, fiber: 0, sodium: 3, potassium: 37, calcium: 0, iron: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '🍵' },
  'kahve': { calories: 5, protein: 0.3, carbs: 0, fat: 0.1, sugar: 0, fiber: 0, sodium: 5, potassium: 116, calcium: 5, iron: 0.1, vitaminA: 0, vitaminC: 0, vitaminD: 0, icon: '☕' },
  'meyve suyu': { calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, sugar: 8.4, fiber: 0.2, sodium: 1, potassium: 200, calcium: 11, iron: 0.2, vitaminA: 10, vitaminC: 30, vitaminD: 0, icon: '🧃' },
};

// Daily Reference Values (adult)
export const DAILY_REFERENCE = {
  calories: 2000,
  protein: 50,       // g
  carbs: 260,        // g
  fat: 78,           // g
  sugar: 50,         // g
  fiber: 25,         // g
  sodium: 2300,      // mg
  potassium: 4700,   // mg
  calcium: 1000,     // mg
  iron: 18,          // mg
  vitaminA: 900,     // µg
  vitaminC: 90,      // mg
  vitaminD: 20,      // µg
};

export const MICRO_NUTRIENTS_META = [
  { key: 'fiber',     label_key: 'nutrition.fiber',     unit: 'g',  icon: '🌾', color: '#22c55e', dv: DAILY_REFERENCE.fiber },
  { key: 'sodium',    label_key: 'nutrition.sodium',    unit: 'mg', icon: '🧂', color: '#f97316', dv: DAILY_REFERENCE.sodium },
  { key: 'potassium', label_key: 'nutrition.potassium', unit: 'mg', icon: '🍌', color: '#eab308', dv: DAILY_REFERENCE.potassium },
  { key: 'calcium',   label_key: 'nutrition.calcium',   unit: 'mg', icon: '🦷', color: '#60a5fa', dv: DAILY_REFERENCE.calcium },
  { key: 'iron',      label_key: 'nutrition.iron',      unit: 'mg', icon: '💪', color: '#ef4444', dv: DAILY_REFERENCE.iron },
  { key: 'vitaminA',  label_key: 'nutrition.vitamin_a', unit: 'µg', icon: '🥕', color: '#f97316', dv: DAILY_REFERENCE.vitaminA },
  { key: 'vitaminC',  label_key: 'nutrition.vitamin_c', unit: 'mg', icon: '🍊', color: '#fbbf24', dv: DAILY_REFERENCE.vitaminC },
  { key: 'vitaminD',  label_key: 'nutrition.vitamin_d', unit: 'µg', icon: '☀️', color: '#facc15', dv: DAILY_REFERENCE.vitaminD },
];

/**
 * Find best match for a food label string
 */
export function findFoodMatch(label) {
  if (!label) return null;
  const lower = label.toLowerCase();
  // Exact match
  if (NUTRITION_DB[lower]) return { key: lower, ...NUTRITION_DB[lower] };
  // Partial match
  for (const [key, val] of Object.entries(NUTRITION_DB)) {
    if (lower.includes(key) || key.includes(lower)) {
      return { key, ...val };
    }
  }
  return null;
}

/**
 * Scale nutrition values from 100g base to portionGrams
 */
export function scaleNutrition(nutrition, portionGrams) {
  const f = portionGrams / 100;
  const keys = ['calories','protein','carbs','fat','sugar','fiber','sodium','potassium','calcium','iron','vitaminA','vitaminC','vitaminD'];
  const result = { ...nutrition };
  for (const k of keys) {
    if (result[k] != null) result[k] = Math.round(result[k] * f * 10) / 10;
  }
  result.portionGrams = portionGrams;
  return result;
}

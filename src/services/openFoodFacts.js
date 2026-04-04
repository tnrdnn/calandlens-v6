/**
 * Open Food Facts API Service
 * https://world.openfoodfacts.org/data
 */

const BASE = 'https://world.openfoodfacts.org';

/**
 * Barkod ile ürün getir
 * @param {string} barcode EAN-8, EAN-13 vb.
 * @returns {Promise<NormalizedProduct|null>}
 */
export async function fetchByBarcode(barcode) {
  try {
    const res = await fetch(`${BASE}/api/v0/product/${barcode}.json`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    return normalize(data.product);
  } catch (e) {
    console.warn('[OFF] barcode fetch failed:', e.message);
    return null;
  }
}

/**
 * İsme göre ürün ara
 * @param {string} query
 * @param {number} pageSize
 * @returns {Promise<NormalizedProduct[]>}
 */
export async function searchByName(query, pageSize = 12) {
  try {
    const params = new URLSearchParams({
      search_terms: query,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: String(pageSize),
      fields: 'code,product_name,brands,image_thumb_url,nutriments,serving_size,serving_quantity',
    });
    const res = await fetch(`${BASE}/cgi/search.pl?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || [])
      .map(normalize)
      .filter(Boolean)
      .filter(p => p.calories > 0 || p.name !== 'Unknown Product');
  } catch (e) {
    console.warn('[OFF] search failed:', e.message);
    return [];
  }
}

/**
 * Besin değerlerini porta göre ölçekle
 * @param {NormalizedProduct} product - 100g bazında değerler
 * @param {number} grams
 */
export function scaleToGrams(product, grams) {
  const f = grams / 100;
  const numKeys = ['calories','protein','carbs','fat','sugar','fiber','sodium','potassium','calcium','iron','vitaminA','vitaminC','vitaminD'];
  const out = { ...product };
  for (const k of numKeys) {
    if (out[k] != null) out[k] = Math.round(out[k] * f * 10) / 10;
  }
  out.portionGrams = grams;
  return out;
}

// ── Normalize ──────────────────────────────────────────────────────────────
function normalize(p) {
  if (!p) return null;
  const n = p.nutriments || {};

  const r = (v, fallback = 0) => {
    const num = parseFloat(v);
    return isNaN(num) ? fallback : Math.round(num * 10) / 10;
  };

  return {
    // Identity
    barcode: p.code || p._id || '',
    name: (p.product_name || '').trim() || 'Unknown Product',
    brand: (p.brands || '').split(',')[0].trim(),
    image: p.image_thumb_url || p.image_front_thumb_url || null,
    servingSize: p.serving_size || '100g',
    source: 'open_food_facts',

    // Macros per 100g
    calories: r(n['energy-kcal_100g'] ?? n['energy-kcal'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0)),
    protein:  r(n['proteins_100g']       ?? n['proteins']),
    carbs:    r(n['carbohydrates_100g']  ?? n['carbohydrates']),
    fat:      r(n['fat_100g']            ?? n['fat']),
    sugar:    r(n['sugars_100g']         ?? n['sugars']),

    // Micros per 100g
    fiber:     r(n['fiber_100g']      ?? n['fiber']),
    sodium:    r((n['sodium_100g']    ?? n['sodium'] ?? 0) * 1000), // g → mg
    potassium: r(n['potassium_100g']  ?? n['potassium']),
    calcium:   r(n['calcium_100g']    ?? n['calcium']),
    iron:      r(n['iron_100g']       ?? n['iron']),
    vitaminA:  r(n['vitamin-a_100g']  ?? 0),
    vitaminC:  r(n['vitamin-c_100g']  ?? 0),
    vitaminD:  r(n['vitamin-d_100g']  ?? 0),
  };
}

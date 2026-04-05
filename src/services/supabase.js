const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

const USER_ID_KEY = 'calandlens_sync_user_id';

// Anonim kullanıcı ID — localStorage'da saklanır, cihaza özgü
export function getOrCreateUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'user_' + crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

const SYNC_KEYS = [
  'calandlens_meals',
  'calandlens_goal',
  'calandlens_water',
  'calandlens_water_goal',
  'calandlens_profile',
  'calandlens_steps',
  'calandlens_step_goal',
  'calandlens_body',
  'calandlens_allergens',
  'calandlens_macro_goals',
  'calandlens_best_streak',
];

async function supaFetch(path, method, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'resolution=merge-duplicates' : '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${err}`);
  }
  return method === 'GET' ? res.json() : null;
}

export async function pushToCloud(userId) {
  const data = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) data[key] = val;
  });

  await supaFetch('user_data', 'POST', {
    user_id: userId,
    data,
    updated_at: new Date().toISOString(),
  });
}

export async function pullFromCloud(userId) {
  const rows = await supaFetch(`user_data?user_id=eq.${encodeURIComponent(userId)}&select=data,updated_at`, 'GET');
  if (!rows || rows.length === 0) return null;

  const { data, updated_at } = rows[0];
  SYNC_KEYS.forEach(key => {
    if (data[key]) localStorage.setItem(key, data[key]);
  });
  return updated_at;
}

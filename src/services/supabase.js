import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://omqnmdgaotlledbhtlvj.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcW5tZGdhb3RsbGVkYmh0bHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjMxNTYsImV4cCI6MjA5MDk5OTE1Nn0.wO5LUsrNB1XK7Yr9WXlkTMPACiRZ3cUuGBpthot3iRc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
export const isConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  });
  if (error) throw error;

  // Save country + name to profiles table via edge function
  if (data.user?.id) {
    fetch('/api/user-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: data.user.id, full_name: name }),
    }).catch(() => {});
  }

  return data.user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://calandlens.com',
  });
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}

// ── Data Sync ─────────────────────────────────────────────────────────────────
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

export async function pushToCloud(userId) {
  const data = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) data[key] = val;
  });

  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, data, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function pullFromCloud(userId) {
  const { data: rows, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .single();

  if (error || !rows) return null;

  SYNC_KEYS.forEach(key => {
    if (rows.data[key]) localStorage.setItem(key, rows.data[key]);
  });
  return rows.updated_at;
}

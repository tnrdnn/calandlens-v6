import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// ── Config (set via environment variables) ───────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(v => v && v !== 'undefined');

let app, db, auth;

if (isConfigured) {
  app  = initializeApp(firebaseConfig);
  db   = getFirestore(app);
  auth = getAuth(app);
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function getOrCreateUser() {
  if (!isConfigured) return null;
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      }
    });
  });
}

// ── Sync helpers ─────────────────────────────────────────────────────────────
const SYNC_KEYS = ['calandlens_meals', 'calandlens_goal', 'calandlens_water', 'calandlens_water_goal', 'calandlens_profile'];

export async function pushToCloud(userId) {
  if (!isConfigured || !userId) return;
  const data = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) data[key] = val;
  });
  data.updatedAt = Date.now();
  await setDoc(doc(db, 'users', userId, 'data', 'local'), data, { merge: true });
}

export async function pullFromCloud(userId) {
  if (!isConfigured || !userId) return null;
  const snap = await getDoc(doc(db, 'users', userId, 'data', 'local'));
  if (!snap.exists()) return null;
  const data = snap.data();
  SYNC_KEYS.forEach(key => {
    if (data[key]) localStorage.setItem(key, data[key]);
  });
  return data.updatedAt || null;
}

export function subscribeToCloud(userId, onUpdate) {
  if (!isConfigured || !userId) return () => {};
  return onSnapshot(doc(db, 'users', userId, 'data', 'local'), (snap) => {
    if (snap.exists()) onUpdate(snap.data());
  });
}

export { isConfigured };

import { useCallback } from 'react';

const PREFIX = 'calandlens_photo_';
const MAX_DIM = 360;
const QUALITY = 0.72;
const MAX_STORED = 40;

async function compressImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = reject;
    if (typeof source === 'string') img.src = source;
    else img.src = URL.createObjectURL(source);
  });
}

function pruneOldPhotos() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(PREFIX)) keys.push(k);
  }
  if (keys.length > MAX_STORED) {
    keys.slice(0, keys.length - MAX_STORED).forEach(k => localStorage.removeItem(k));
  }
}

export function useMealPhotos() {
  const savePhoto = useCallback(async (mealId, source) => {
    try {
      const compressed = await compressImage(source);
      pruneOldPhotos();
      localStorage.setItem(`${PREFIX}${mealId}`, compressed);
      return compressed;
    } catch (e) {
      console.warn('[MealPhotos] save failed:', e);
      return null;
    }
  }, []);

  const getPhoto = useCallback((mealId) => {
    return localStorage.getItem(`${PREFIX}${mealId}`) || null;
  }, []);

  const deletePhoto = useCallback((mealId) => {
    localStorage.removeItem(`${PREFIX}${mealId}`);
  }, []);

  return { savePhoto, getPhoto, deletePhoto };
}

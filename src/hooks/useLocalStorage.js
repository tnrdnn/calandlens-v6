import { useState, useCallback } from 'react';

const KEYS = {
  MEALS: 'calandlens_meals',       // { [dateKey]: Meal[] }
  GOAL: 'calandlens_goal',          // number
  PROFILE: 'calandlens_profile',    // { weight, height, age, gender, activity, goalType }
  SETTINGS: 'calandlens_settings',  // { lang, ... }
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(date) {
  if (!date) return todayKey();
  return new Date(date).toISOString().slice(0, 10);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('[Storage] Write failed:', e);
    return false;
  }
}

export function useLocalStorage() {
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  // ── Meals ────────────────────────────────────────────────────────────────
  const getAllMeals = useCallback(() => {
    return readJSON(KEYS.MEALS, {});
  }, []);

  const getMealsForDate = useCallback((date) => {
    const all = readJSON(KEYS.MEALS, {});
    return all[dateKey(date)] || [];
  }, []);

  const getTodayMeals = useCallback(() => {
    const all = readJSON(KEYS.MEALS, {});
    return all[todayKey()] || [];
  }, []);

  const addMeal = useCallback((meal) => {
    const all = readJSON(KEYS.MEALS, {});
    const key = meal.dateKey || todayKey();
    const existing = all[key] || [];
    const newMeal = {
      id: meal.id || `meal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: meal.timestamp || Date.now(),
      dateKey: key,
      ...meal,
    };
    all[key] = [...existing, newMeal];
    writeJSON(KEYS.MEALS, all);
    refresh();
    return newMeal;
  }, []);

  const updateMeal = useCallback((mealId, updates) => {
    const all = readJSON(KEYS.MEALS, {});
    for (const key of Object.keys(all)) {
      const idx = all[key].findIndex(m => m.id === mealId);
      if (idx !== -1) {
        all[key][idx] = { ...all[key][idx], ...updates };
        writeJSON(KEYS.MEALS, all);
        refresh();
        return true;
      }
    }
    return false;
  }, []);

  const deleteMeal = useCallback((mealId) => {
    const all = readJSON(KEYS.MEALS, {});
    for (const key of Object.keys(all)) {
      const before = all[key].length;
      all[key] = all[key].filter(m => m.id !== mealId);
      if (all[key].length !== before) {
        writeJSON(KEYS.MEALS, all);
        refresh();
        return true;
      }
    }
    return false;
  }, []);

  // Get daily totals for a given date
  const getDailyTotals = useCallback((date) => {
    const meals = getMealsForDate(date);
    return meals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      sugar: acc.sugar + (m.sugar || 0),
      fiber: acc.fiber + (m.fiber || 0),
      sodium: acc.sodium + (m.sodium || 0),
      potassium: acc.potassium + (m.potassium || 0),
      calcium: acc.calcium + (m.calcium || 0),
      iron: acc.iron + (m.iron || 0),
      vitaminA: acc.vitaminA + (m.vitaminA || 0),
      vitaminC: acc.vitaminC + (m.vitaminC || 0),
      vitaminD: acc.vitaminD + (m.vitaminD || 0),
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0,
      fiber: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0,
      vitaminA: 0, vitaminC: 0, vitaminD: 0,
    });
  }, [getMealsForDate]);

  // Last 7 days chart data
  const getWeeklyData = useCallback(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const meals = readJSON(KEYS.MEALS, {})[key] || [];
      const cal = meals.reduce((s, m) => s + (m.calories || 0), 0);
      data.push({
        date: key,
        day: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        calories: Math.round(cal),
      });
    }
    return data;
  }, []);

  // ── Goal ─────────────────────────────────────────────────────────────────
  const getGoal = useCallback(() => {
    return parseInt(localStorage.getItem(KEYS.GOAL) || '2000');
  }, []);

  const setGoal = useCallback((kcal) => {
    localStorage.setItem(KEYS.GOAL, String(kcal));
    refresh();
  }, []);

  // ── Profile ──────────────────────────────────────────────────────────────
  const getProfile = useCallback(() => {
    return readJSON(KEYS.PROFILE, null);
  }, []);

  const setProfile = useCallback((profile) => {
    writeJSON(KEYS.PROFILE, profile);
    refresh();
  }, []);

  // ── Clear ────────────────────────────────────────────────────────────────
  const clearAllData = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    // Also clear photo keys
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('calandlens_')) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    refresh();
  }, []);

  return {
    // meals
    getAllMeals,
    getMealsForDate,
    getTodayMeals,
    addMeal,
    updateMeal,
    deleteMeal,
    getDailyTotals,
    getWeeklyData,
    // goal
    getGoal,
    setGoal,
    // profile
    getProfile,
    setProfile,
    // utils
    clearAllData,
    todayKey,
    dateKey,
  };
}

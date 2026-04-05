import { useState, useCallback } from 'react';

const KEYS = {
  MEALS:      'calandlens_meals',
  GOAL:       'calandlens_goal',
  PROFILE:    'calandlens_profile',
  SETTINGS:   'calandlens_settings',
  WATER:      'calandlens_water',       // { [dateKey]: number (ml) }
  WATER_GOAL: 'calandlens_water_goal',  // number (ml)
  STEPS:      'calandlens_steps',       // { [dateKey]: number }
  STEP_GOAL:  'calandlens_step_goal',   // number
  BODY:       'calandlens_body',        // [{ date, weight, waist, hip }]
  ALLERGENS:  'calandlens_allergens',   // string[] — seçili alerjen id'leri
  MACRO_GOALS: 'calandlens_macro_goals', // { protein, carbs, fat } — % hedefleri
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

  // ── Water tracking ───────────────────────────────────────────────────────
  const getWaterToday = useCallback(() => {
    const all = readJSON(KEYS.WATER, {});
    return all[todayKey()] || 0;
  }, []);

  const addWater = useCallback((ml) => {
    const all = readJSON(KEYS.WATER, {});
    const key = todayKey();
    all[key] = (all[key] || 0) + ml;
    writeJSON(KEYS.WATER, all);
    refresh();
  }, []);

  const resetWaterToday = useCallback(() => {
    const all = readJSON(KEYS.WATER, {});
    all[todayKey()] = 0;
    writeJSON(KEYS.WATER, all);
    refresh();
  }, []);

  const getWaterGoal = useCallback(() => {
    return parseInt(localStorage.getItem(KEYS.WATER_GOAL) || '2000');
  }, []);

  const setWaterGoal = useCallback((ml) => {
    localStorage.setItem(KEYS.WATER_GOAL, String(ml));
    refresh();
  }, []);

  // ── Monthly calories (30 days) ───────────────────────────────────────────
  const getMonthlyCalories = useCallback(() => {
    const meals = readJSON(KEYS.MEALS, {});
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      const cal = (meals[key] || []).reduce((s, m) => s + (m.calories || 0), 0);
      result.push({ date: key, calories: Math.round(cal), day: i });
    }
    return result;
  }, []);

  // ── Body measurements ────────────────────────────────────────────────────
  const getBodyMeasurements = useCallback(() => {
    return readJSON(KEYS.BODY, []);
  }, []);

  const addBodyMeasurement = useCallback((data) => {
    const all = readJSON(KEYS.BODY, []);
    all.push({ date: todayKey(), ...data, id: Date.now() });
    writeJSON(KEYS.BODY, all);
    refresh();
  }, []);

  const deleteBodyMeasurement = useCallback((id) => {
    const all = readJSON(KEYS.BODY, []);
    writeJSON(KEYS.BODY, all.filter(m => m.id !== id));
    refresh();
  }, []);

  // ── Streak ───────────────────────────────────────────────────────────────
  const getStreak = useCallback(() => {
    const all = readJSON(KEYS.MEALS, {});
    const todayHasData = (all[todayKey()] || []).length > 0;
    const startOffset = todayHasData ? 0 : 1;
    let streak = 0;
    for (let i = startOffset; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      if ((all[key] || []).length > 0) { streak++; } else { break; }
    }
    const stored = parseInt(localStorage.getItem('calandlens_best_streak') || '0');
    const best = Math.max(streak, stored);
    if (best > stored) localStorage.setItem('calandlens_best_streak', String(best));
    return { current: streak, best };
  }, []);

  // ── Step tracking ────────────────────────────────────────────────────────
  const getStepsToday = useCallback(() => {
    const all = readJSON(KEYS.STEPS, {});
    return all[todayKey()] || 0;
  }, []);

  const setStepsToday = useCallback((n) => {
    const all = readJSON(KEYS.STEPS, {});
    all[todayKey()] = Math.max(0, Math.round(n));
    writeJSON(KEYS.STEPS, all);
    refresh();
  }, []);

  const addStepsToday = useCallback((n) => {
    const all = readJSON(KEYS.STEPS, {});
    const key = todayKey();
    all[key] = (all[key] || 0) + Math.round(n);
    writeJSON(KEYS.STEPS, all);
    refresh();
  }, []);

  const getStepGoal = useCallback(() => {
    return parseInt(localStorage.getItem(KEYS.STEP_GOAL) || '10000');
  }, []);

  const setStepGoal = useCallback((n) => {
    localStorage.setItem(KEYS.STEP_GOAL, String(n));
    refresh();
  }, []);

  const getWeeklySteps = useCallback(() => {
    const data = readJSON(KEYS.STEPS, {});
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dateKey(d);
      result.push({
        date: key,
        day: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        steps: data[key] || 0,
      });
    }
    return result;
  }, []);

  // ── Allergens ────────────────────────────────────────────────────────────
  const getUserAllergens = useCallback(() => {
    return readJSON(KEYS.ALLERGENS, []);
  }, []);

  const setUserAllergens = useCallback((ids) => {
    writeJSON(KEYS.ALLERGENS, ids);
    refresh();
  }, []);

  // ── Macro goals (%) ──────────────────────────────────────────────────────
  const getMacroGoals = useCallback(() => {
    return readJSON(KEYS.MACRO_GOALS, { protein: 25, carbs: 50, fat: 25 });
  }, []);

  const setMacroGoals = useCallback((goals) => {
    writeJSON(KEYS.MACRO_GOALS, goals);
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
    // water
    getWaterToday,
    addWater,
    resetWaterToday,
    getWaterGoal,
    setWaterGoal,
    // monthly & body
    getMonthlyCalories,
    getBodyMeasurements,
    addBodyMeasurement,
    deleteBodyMeasurement,
    // streak
    getStreak,
    // steps
    getStepsToday,
    setStepsToday,
    addStepsToday,
    getStepGoal,
    setStepGoal,
    getWeeklySteps,
    // allergens
    getUserAllergens,
    setUserAllergens,
    // macro goals
    getMacroGoals,
    setMacroGoals,
    // utils
    clearAllData,
    todayKey,
    dateKey,
  };
}

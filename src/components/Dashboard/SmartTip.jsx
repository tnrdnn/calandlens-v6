import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function pickTip({ calories, goal, protein, waterCurrent, waterGoal, stepsCurrent, stepsGoal, streak }) {
  const calRatio   = goal > 0       ? calories / goal             : 0;
  const waterRatio = waterGoal > 0  ? waterCurrent / waterGoal   : 0;
  const stepRatio  = stepsGoal > 0  ? stepsCurrent / stepsGoal   : 0;
  const proRatio   = calories > 0   ? (protein * 4) / calories   : 0;

  if (calories === 0)                              return 'no_meals';
  if (streak >= 30)                                return 'streak_30';
  if (streak >= 7)                                 return 'streak_7';
  if (calRatio > 1.25)                             return 'over_calories';
  if (calRatio >= 0.85 && calRatio <= 1.15 && waterRatio >= 1 && stepRatio >= 1) return 'perfect_day';
  if (waterRatio < 0.4)                            return 'low_water';
  if (stepRatio < 0.4)                             return 'low_steps';
  if (proRatio < 0.12 && calories > 300)           return 'low_protein';
  if (calRatio < 0.5)                              return 'low_calories';
  if (calRatio >= 0.85 && calRatio <= 1.15)        return 'good_calories';
  if (waterRatio < 0.7)                            return 'mid_water';
  return 'general';
}

const TIP_META = {
  no_meals:      { emoji: '🍽️', color: 'bg-gray-50',    border: 'border-gray-200',   text: 'text-gray-600' },
  low_calories:  { emoji: '⚡',  color: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700' },
  over_calories: { emoji: '⚠️', color: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700' },
  low_protein:   { emoji: '💪',  color: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700' },
  low_water:     { emoji: '💧',  color: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700' },
  mid_water:     { emoji: '💧',  color: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700' },
  low_steps:     { emoji: '🚶',  color: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700' },
  good_calories: { emoji: '✅',  color: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700' },
  perfect_day:   { emoji: '🌟',  color: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700' },
  streak_7:      { emoji: '🔥',  color: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700' },
  streak_30:     { emoji: '🏆',  color: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700' },
  general:       { emoji: '💡',  color: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700' },
};

export default function SmartTip() {
  const { t } = useLanguage();
  const {
    getDailyTotals, getGoal,
    getWaterToday, getWaterGoal,
    getStepsToday, getStepGoal,
    getStreak,
  } = useLocalStorage();

  const totals  = getDailyTotals();
  const goal    = getGoal();
  const water   = getWaterToday();
  const wGoal   = getWaterGoal();
  const steps   = getStepsToday();
  const sGoal   = getStepGoal();
  const { current: streak } = getStreak();

  const tipKey = useMemo(() => pickTip({
    calories: totals.calories,
    goal,
    protein: totals.protein,
    waterCurrent: water,
    waterGoal: wGoal,
    stepsCurrent: steps,
    stepsGoal: sGoal,
    streak,
  }), [totals, goal, water, wGoal, steps, sGoal, streak]);

  const meta = TIP_META[tipKey] || TIP_META.general;
  const message = t(`tip.${tipKey}`);

  return (
    <div className={`${meta.color} border ${meta.border} rounded-3xl p-4 flex items-start gap-3`}>
      <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black uppercase tracking-wide ${meta.text} mb-1 opacity-70`}>
          {t('tip.label')}
        </p>
        <p className={`text-sm font-semibold ${meta.text} leading-snug`}>
          {message}
        </p>
      </div>
    </div>
  );
}

import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import MealPhotoThumb from '../Meal/MealPhotoThumb';
import MicroNutrientsPanel from '../Analysis/MicroNutrientsPanel';

export default function DayDetail({ date, meals = [], dailyGoal = 2000 }) {
  const { t, tArr } = useLanguage();
  const MONTHS = tArr('history.months');

  const formatDate = (d) => {
    const today = new Date();
    const yest  = new Date(); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t('history.today');
    if (d.toDateString() === yest.toDateString())  return t('history.yesterday');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const totals = meals.reduce((acc, m) => ({
    calories:  acc.calories  + (m.calories  || 0),
    protein:   acc.protein   + (m.protein   || 0),
    carbs:     acc.carbs     + (m.carbs     || 0),
    fat:       acc.fat       + (m.fat       || 0),
    fiber:     acc.fiber     + (m.fiber     || 0),
    sodium:    acc.sodium    + (m.sodium    || 0),
    potassium: acc.potassium + (m.potassium || 0),
    calcium:   acc.calcium   + (m.calcium   || 0),
    iron:      acc.iron      + (m.iron      || 0),
    vitaminA:  acc.vitaminA  + (m.vitaminA  || 0),
    vitaminC:  acc.vitaminC  + (m.vitaminC  || 0),
    vitaminD:  acc.vitaminD  + (m.vitaminD  || 0),
  }), { calories:0, protein:0, carbs:0, fat:0, fiber:0, sodium:0, potassium:0, calcium:0, iron:0, vitaminA:0, vitaminC:0, vitaminD:0 });

  const pct = Math.min(100, Math.round((totals.calories / dailyGoal) * 100));
  const over = totals.calories > dailyGoal;

  return (
    <div className="space-y-3">
      {/* Day header */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-gray-800 text-lg">{formatDate(date)}</h3>
            <p className="text-sm text-gray-400">{meals.length} {t('history.meals_count')}</p>
          </div>
          <div className={`text-right ${over ? 'text-orange-500' : 'text-emerald-600'}`}>
            <p className="text-2xl font-black">{Math.round(totals.calories)}</p>
            <p className="text-xs text-gray-400">kcal</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1">
          <div
            className={`h-full rounded-full transition-all duration-700 ${over ? 'bg-orange-400' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{pct}% — hedef {dailyGoal} kcal</span>
          {over
            ? <span className="text-orange-500 font-medium">+{Math.round(totals.calories - dailyGoal)} kcal {t('dashboard.over_goal')}</span>
            : <span className="text-emerald-600 font-medium">{Math.round(dailyGoal - totals.calories)} kcal {t('dashboard.remaining')}</span>
          }
        </div>

        {/* Macro pills */}
        <div className="flex gap-2 mt-4">
          {[
            { label: t('nutrition.protein'), val: totals.protein, unit:'g', cls:'bg-blue-100 text-blue-700' },
            { label: t('nutrition.carbs'),   val: totals.carbs,   unit:'g', cls:'bg-yellow-100 text-yellow-700' },
            { label: t('nutrition.fat'),     val: totals.fat,     unit:'g', cls:'bg-red-100 text-red-600' },
          ].map(m => (
            <div key={m.label} className={`flex-1 rounded-xl py-2 text-center ${m.cls}`}>
              <p className="text-sm font-black">{Math.round(m.val * 10) / 10}</p>
              <p className="text-xs opacity-70">{m.unit} {m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Micro nutrients */}
      <MicroNutrientsPanel totals={totals} />

      {/* Meal list */}
      {meals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400 font-medium">{t('history.no_data')}</p>
          <p className="text-sm text-gray-300 mt-1">{t('history.no_data_detail')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-700 text-sm">Öğünler</p>
          </div>
          <div className="divide-y divide-gray-50">
            {meals.map((meal, i) => (
              <div key={meal.id || i} className="flex items-center gap-3 px-4 py-3">
                <MealPhotoThumb mealId={meal.id} photo={meal.photo} size="md" editable={false}/>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {meal.icon || ''} {meal.name || 'Yemek'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {meal.timestamp && (
                      <span className="text-xs text-gray-400">
                        {new Date(meal.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    )}
                    {meal.portionGrams && (
                      <span className="text-xs text-gray-400">· {meal.portionGrams}g</span>
                    )}
                    {meal.source === 'barcode' && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 rounded-full">🏷️</span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-700 flex-shrink-0">
                  {Math.round(meal.calories)} kcal
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

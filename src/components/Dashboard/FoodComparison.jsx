import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const NUTRIENTS = [
  { key: 'calories', unit: 'kcal', icon: '🔥' },
  { key: 'protein',  unit: 'g',    icon: '🥩' },
  { key: 'carbs',    unit: 'g',    icon: '🍞' },
  { key: 'fat',      unit: 'g',    icon: '🥑' },
  { key: 'fiber',    unit: 'g',    icon: '🌾' },
  { key: 'sugar',    unit: 'g',    icon: '🍬' },
];

// Colours: A = blue side, B = rose side
const COL_A = { bar: '#6366f1', bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' };
const COL_B = { bar: '#f43f5e', bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden flex-1">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Slot({ label, meal, col, meals, onSelect, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return meals.slice(0, 12);
    return meals.filter(m => m.name.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
  }, [meals, query]);

  return (
    <div className="flex-1 min-w-0">
      {/* Slot header */}
      <div
        className="rounded-2xl p-3 mb-2 border text-center cursor-pointer select-none"
        style={{ backgroundColor: col.bg, borderColor: col.border }}
        onClick={() => setOpen(o => !o)}
      >
        {meal ? (
          <>
            <p className="text-xs font-bold mb-0.5" style={{ color: col.text }}>{label}</p>
            <p className="font-black text-sm leading-tight text-gray-800 truncate px-1">{meal.icon || '🍽️'} {meal.name}</p>
            <p className="text-xs mt-0.5" style={{ color: col.text }}>{Math.round(meal.calories)} kcal</p>
          </>
        ) : (
          <p className="text-xs font-semibold text-gray-400">{placeholder}</p>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-2"
          style={{ top: '100%', marginTop: 4 }}>
          <div className="p-2 border-b border-gray-50">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-300"
              placeholder="Ara..."
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-center text-gray-400 py-4">Sonuç yok</p>
            ) : filtered.map((m, i) => (
              <button key={i}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors"
                onClick={() => { onSelect(m); setOpen(false); setQuery(''); }}
              >
                <span className="text-sm font-semibold text-gray-700 truncate">{m.icon || '🍽️'} {m.name}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{Math.round(m.calories)} kcal</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FoodComparison() {
  const { t } = useLanguage();
  const { getAllMeals } = useLocalStorage();
  const [mealA, setMealA] = useState(null);
  const [mealB, setMealB] = useState(null);

  // Collect unique meals (by name) from all history, most recent first
  const allMeals = useMemo(() => {
    const all = getAllMeals();
    const seen = new Set();
    const result = [];
    const dates = Object.keys(all).sort().reverse();
    for (const date of dates) {
      for (const meal of all[date]) {
        if (!seen.has(meal.name)) {
          seen.add(meal.name);
          result.push(meal);
        }
      }
    }
    return result;
  }, [getAllMeals]);

  const hasComparison = mealA && mealB;

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50">
        <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">
          {t('compare.title')}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{t('compare.subtitle')}</p>
      </div>

      <div className="p-4">
        {allMeals.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">{t('compare.no_history')}</p>
        ) : (
          <>
            {/* Slot pickers */}
            <div className="relative flex gap-3 mb-5">
              <Slot
                label="A"
                meal={mealA}
                col={COL_A}
                meals={allMeals}
                onSelect={setMealA}
                placeholder={t('compare.pick_a')}
              />
              <div className="flex items-center justify-center flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 self-center">
                <span className="text-xs font-black text-gray-500">vs</span>
              </div>
              <Slot
                label="B"
                meal={mealB}
                col={COL_B}
                meals={allMeals}
                onSelect={setMealB}
                placeholder={t('compare.pick_b')}
              />
            </div>

            {/* Comparison bars */}
            {hasComparison ? (
              <div className="space-y-3">
                {NUTRIENTS.map(({ key, unit, icon }) => {
                  const vA = mealA[key] || 0;
                  const vB = mealB[key] || 0;
                  const max = Math.max(vA, vB, 0.1);
                  const winA = vA > vB;
                  const winB = vB > vA;
                  const tie  = vA === vB;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">
                          {icon} {t(`nutrition.${key}`)}
                        </span>
                        {!tie && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={winA
                              ? { backgroundColor: COL_A.bg, color: COL_A.text }
                              : { backgroundColor: COL_B.bg, color: COL_B.text }
                            }>
                            {winA ? 'A' : 'B'} {t('compare.higher')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* A value left */}
                        <span className="text-xs font-bold w-12 text-right flex-shrink-0"
                          style={{ color: COL_A.text }}>
                          {Math.round(vA * 10) / 10}{unit}
                        </span>
                        <Bar value={vA} max={max} color={COL_A.bar} />
                        <Bar value={vB} max={max} color={COL_B.bar} />
                        {/* B value right */}
                        <span className="text-xs font-bold w-12 flex-shrink-0"
                          style={{ color: COL_B.text }}>
                          {Math.round(vB * 10) / 10}{unit}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-2 border-t border-gray-50 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COL_A.bar }}/>
                    <span className="text-xs font-bold text-gray-600">A: {mealA.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COL_B.bar }}/>
                    <span className="text-xs font-bold text-gray-600">B: {mealB.name}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-3">{t('compare.hint')}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

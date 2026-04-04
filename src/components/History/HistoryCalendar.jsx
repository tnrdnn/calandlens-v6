import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

function toKey(date) { return new Date(date).toISOString().slice(0, 10); }
function sameDay(a, b) { return toKey(a) === toKey(b); }

function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function HistoryCalendar({ allMealsMap = {}, onSelectDay, dailyGoal = 2000 }) {
  const { t, tArr } = useLanguage();
  const today = new Date();
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const MONTHS   = tArr('history.months');
  const WEEKDAYS = tArr('history.weekdays');

  // Build summary per day
  const dayMap = useMemo(() => {
    const map = {};
    for (const [key, meals] of Object.entries(allMealsMap)) {
      const cal = meals.reduce((s, m) => s + (m.calories || 0), 0);
      map[key] = { calories: Math.round(cal), count: meals.length };
    }
    return map;
  }, [allMealsMap]);

  const cells = buildCalendarGrid(view.getFullYear(), view.getMonth());

  const prevMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const nextMonth = () => {
    const next = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) setView(next);
  };
  const canGoNext = view.getMonth() < today.getMonth() || view.getFullYear() < today.getFullYear();

  const handleDay = (date) => {
    if (!date || date > today) return;
    setSelected(date);
    const key = toKey(date);
    onSelectDay?.({ date, key, meals: allMealsMap[key] || [], summary: dayMap[key] });
  };

  const calColor = (key) => {
    const d = dayMap[key];
    if (!d || d.calories === 0) return '';
    if (d.calories < dailyGoal * 0.7) return 'bg-blue-100';
    if (d.calories <= dailyGoal * 1.1) return 'bg-emerald-100';
    return 'bg-orange-100';
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <span className="font-bold text-gray-800">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>
        <button onClick={nextMonth} disabled={!canGoNext}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-25">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center px-3 pt-3">
        {WEEKDAYS.map(w => (
          <div key={w} className="text-xs font-semibold text-gray-400 py-1">{w}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 px-3 pb-4">
        {cells.map((date, i) => {
          if (!date) return <div key={i}/>;
          const key = toKey(date);
          const isFuture  = date > today;
          const isToday   = sameDay(date, today);
          const isSel     = sameDay(date, selected);
          const hasData   = !!dayMap[key];
          const dotColor  = dayMap[key]?.calories > 0 ? 'bg-emerald-500' : '';

          return (
            <button
              key={i}
              onClick={() => handleDay(date)}
              disabled={isFuture}
              className={`
                aspect-square rounded-xl flex flex-col items-center justify-center relative text-sm
                transition-all duration-150 disabled:opacity-25
                ${isSel
                  ? 'bg-emerald-500 text-white font-bold shadow-lg scale-110 z-10'
                  : isToday
                    ? 'ring-2 ring-emerald-400 font-bold text-emerald-700'
                    : hasData
                      ? `${calColor(key)} text-gray-700 font-medium hover:opacity-80`
                      : 'hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              <span className="text-xs leading-none">{date.getDate()}</span>
              {hasData && !isSel && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${dotColor}`}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 pb-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 inline-block"/>{t('history.calorie_low')}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 inline-block"/>{t('history.calorie_normal')}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 inline-block"/>{t('history.calorie_high')}</span>
      </div>
    </div>
  );
}

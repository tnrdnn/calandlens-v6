import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const AMOUNTS = [150, 200, 300, 500];

export default function WaterTracker() {
  const { t } = useLanguage();
  const { getWaterToday, addWater, resetWaterToday, getWaterGoal } = useLocalStorage();

  const goal    = getWaterGoal();      // ml (default 2000)
  const current = getWaterToday();     // ml
  const pct     = Math.min(100, Math.round((current / goal) * 100));
  const glasses = Math.round(current / 250);

  // Progress rengi: az=kırmızı, orta=sarı, tam=yeşil
  const barColor =
    pct < 40  ? 'from-red-400 to-orange-400' :
    pct < 70  ? 'from-yellow-400 to-amber-400' :
                'from-blue-400 to-cyan-400';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
            💧 {t('water.title')}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{t('water.goal_label')}: {goal} ml</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-blue-500">{current}</span>
          <span className="text-xs text-gray-400 ml-0.5">ml</span>
          <p className="text-xs text-gray-400">{glasses} {t('water.glasses')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-blue-50 rounded-full mb-1 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-400 mb-3">{pct}%</p>

      {/* Add buttons */}
      <div className="flex gap-2">
        {AMOUNTS.map(ml => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-600 font-bold text-xs rounded-xl transition-all"
          >
            +{ml}
          </button>
        ))}
        {current > 0 && (
          <button
            onClick={resetWaterToday}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-400 text-xs rounded-xl transition-all"
            title={t('water.reset')}
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}

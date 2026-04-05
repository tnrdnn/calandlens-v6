import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MILESTONES = [3, 7, 14, 30, 60, 100];

function flame(n) {
  if (n >= 30) return '🔥🔥🔥';
  if (n >= 7)  return '🔥🔥';
  return '🔥';
}

export default function StreakCard() {
  const { t } = useLanguage();
  const { getStreak } = useLocalStorage();
  const { current, best } = getStreak();

  const next = MILESTONES.find(m => m > current) || null;
  const pct  = next ? Math.round((current / next) * 100) : 100;

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-xl">
          {flame(current)}
        </div>
        <div>
          <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('streak.title')}</h3>
          <p className="text-xs text-gray-400">{t('streak.subtitle')}</p>
        </div>
      </div>

      {/* Main stats */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-4xl font-black text-orange-500 leading-none">{current}</p>
          <p className="text-xs text-orange-400 font-semibold mt-1">{t('streak.current')}</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-4xl font-black text-gray-700 leading-none">{best}</p>
          <p className="text-xs text-gray-400 font-semibold mt-1">{t('streak.best')}</p>
        </div>
      </div>

      {/* Next milestone progress */}
      {next && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-gray-500">{t('streak.next_milestone')}: {next} {t('streak.days')}</span>
            <span className="text-xs font-bold text-orange-500">{next - current} {t('streak.days_left')}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* No streak message */}
      {current === 0 && (
        <p className="text-xs text-gray-400 text-center mt-1">{t('streak.start_msg')}</p>
      )}

      {/* Achievement badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {MILESTONES.map(m => (
          <span key={m} className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
            best >= m
              ? 'bg-orange-100 text-orange-600'
              : 'bg-gray-100 text-gray-300'
          }`}>
            {m} 🔥
          </span>
        ))}
      </div>
    </div>
  );
}

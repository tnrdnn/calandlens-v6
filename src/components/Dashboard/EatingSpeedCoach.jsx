import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const IDEAL_SECONDS = 20 * 60;

export default function EatingSpeedCoach() {
  const { t } = useLanguage();
  const [running, setRunning]   = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const start = () => { setElapsed(0); setFinished(false); setRunning(true); };
  const stop  = () => { setRunning(false); setFinished(true); };
  const reset = () => { setRunning(false); setElapsed(0); setFinished(false); };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  const isFast = elapsed < IDEAL_SECONDS * 0.6; // < 12 min

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🍽️</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{t('speed.title')}</h3>
          <p className="text-xs text-gray-400">{t('speed.subtitle')}</p>
        </div>
      </div>

      {/* Timer display */}
      <div className={`text-center py-8 rounded-2xl mb-4 transition-colors ${
        running ? 'bg-emerald-50' : finished ? (isFast ? 'bg-orange-50' : 'bg-emerald-50') : 'bg-gray-50'
      }`}>
        <p className={`text-5xl font-black font-mono transition-colors ${
          running ? 'text-emerald-600' : finished ? (isFast ? 'text-orange-500' : 'text-emerald-600') : 'text-gray-300'
        }`}>{fmt(elapsed)}</p>
        <p className="text-sm text-gray-400 mt-2">{t('speed.ideal')}</p>
        {finished && (
          <div className="mt-3 px-4">
            <p className={`font-bold ${isFast ? 'text-orange-600' : 'text-emerald-600'}`}>
              {isFast ? t('speed.too_fast') : t('speed.good_pace')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isFast ? t('speed.result_fast') : t('speed.result_good')}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!running && !finished && (
        <button onClick={start}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors text-lg">
          {t('speed.start')}
        </button>
      )}
      {running && (
        <button onClick={stop}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-lg">
          {t('speed.stop')}
        </button>
      )}
      {finished && (
        <button onClick={reset}
          className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-colors">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

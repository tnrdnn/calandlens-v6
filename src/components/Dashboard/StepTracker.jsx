import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

// ── Step detection constants ──────────────────────────────────────────────────
const STEP_THRESHOLD   = 11.5;   // m/s² peak magnitude to count a step
const STEP_DEBOUNCE_MS = 300;    // minimum ms between two steps
const STEP_LENGTH_M    = 0.75;   // average step length in metres
const CAL_PER_STEP     = 0.04;   // kcal per step (avg adult)

// ── Motivational messages (index by progress bucket 0-4) ─────────────────────
function getMotivation(t, pct) {
  if (pct >= 100) return { text: t('steps.msg_done'),    color: 'text-emerald-600' };
  if (pct >= 75)  return { text: t('steps.msg_almost'),  color: 'text-teal-600' };
  if (pct >= 50)  return { text: t('steps.msg_half'),    color: 'text-blue-600' };
  if (pct >= 25)  return { text: t('steps.msg_quarter'), color: 'text-amber-600' };
  return           { text: t('steps.msg_start'),         color: 'text-gray-400' };
}

// ── Circular SVG ring ─────────────────────────────────────────────────────────
function Ring({ pct, steps, goal, t }) {
  const r  = 80;
  const cx = 100;
  const cy = 100;
  const circ = 2 * Math.PI * r;
  const dash  = Math.min(1, pct / 100) * circ;
  const color = pct >= 100 ? '#10b981' : pct >= 50 ? '#3b82f6' : '#f59e0b';

  return (
    <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="16"/>
      {/* Progress */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Inner content — rotated back upright */}
      <g transform="rotate(90, 100, 100)">
        <text x="100" y="88"  textAnchor="middle" fontSize="36" fontWeight="900" fill="#111827">{steps.toLocaleString()}</text>
        <text x="100" y="108" textAnchor="middle" fontSize="11" fill="#9ca3af">{t('steps.steps')}</text>
        <text x="100" y="126" textAnchor="middle" fontSize="11" fill={color} fontWeight="700">
          {pct >= 100 ? '🎉 100%' : `${Math.round(pct)}%`}
        </text>
        <text x="100" y="144" textAnchor="middle" fontSize="10" fill="#d1d5db">/ {goal.toLocaleString()}</text>
      </g>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StepTracker() {
  const { t } = useLanguage();
  const { getStepsToday, setStepsToday, addStepsToday, getStepGoal, getWeeklySteps } = useLocalStorage();

  const [steps,       setSteps]       = useState(getStepsToday);
  const [goal]                         = useState(getStepGoal);
  const [tracking,    setTracking]    = useState(false);
  const [permission,  setPermission]  = useState('unknown'); // unknown|granted|denied|unsupported
  const [manualInput, setManualInput] = useState('');
  const [showManual,  setShowManual]  = useState(false);
  const [weeklyData,  setWeeklyData]  = useState(getWeeklySteps);
  const [activeTime,  setActiveTime]  = useState(0); // seconds tracked today

  const lastStepTime  = useRef(0);
  const stepDetected  = useRef(false);
  const sessionSteps  = useRef(0);
  const timerRef      = useRef(null);

  const pct      = Math.min(100, (steps / goal) * 100);
  const distKm   = (steps * STEP_LENGTH_M / 1000).toFixed(2);
  const calories = Math.round(steps * CAL_PER_STEP);
  const motiv    = getMotivation(t, pct);

  // ── Sync steps from localStorage on mount ────────────────────────────────
  useEffect(() => {
    setSteps(getStepsToday());
    setWeeklyData(getWeeklySteps());
  }, []);

  // ── DeviceMotion handler ──────────────────────────────────────────────────
  const handleMotion = useCallback((e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const { x = 0, y = 0, z = 0 } = acc;
    const mag = Math.sqrt(x * x + y * y + z * z);

    if (mag > STEP_THRESHOLD && !stepDetected.current) {
      const now = Date.now();
      if (now - lastStepTime.current > STEP_DEBOUNCE_MS) {
        stepDetected.current = true;
        lastStepTime.current = now;
        sessionSteps.current += 1;
        addStepsToday(1);
        setSteps(s => s + 1);
      }
    } else if (mag < STEP_THRESHOLD - 2) {
      stepDetected.current = false;
    }
  }, [addStepsToday]);

  // ── Start tracking ────────────────────────────────────────────────────────
  const startTracking = async () => {
    // iOS 13+ requires permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const perm = await DeviceMotionEvent.requestPermission();
        if (perm !== 'granted') { setPermission('denied'); return; }
        setPermission('granted');
      } catch {
        setPermission('denied'); return;
      }
    } else if (typeof DeviceMotionEvent === 'undefined') {
      setPermission('unsupported'); return;
    } else {
      setPermission('granted');
    }

    window.addEventListener('devicemotion', handleMotion);
    setTracking(true);
    timerRef.current = setInterval(() => setActiveTime(t => t + 1), 1000);
  };

  const stopTracking = () => {
    window.removeEventListener('devicemotion', handleMotion);
    setTracking(false);
    clearInterval(timerRef.current);
    setWeeklyData(getWeeklySteps());
    sessionSteps.current = 0;
  };

  useEffect(() => () => {
    window.removeEventListener('devicemotion', handleMotion);
    clearInterval(timerRef.current);
  }, [handleMotion]);

  // ── Manual add ───────────────────────────────────────────────────────────
  const handleManualAdd = () => {
    const n = parseInt(manualInput, 10);
    if (!isNaN(n) && n > 0) {
      addStepsToday(n);
      setSteps(s => s + n);
      setWeeklyData(getWeeklySteps());
      setManualInput('');
      setShowManual(false);
    }
  };

  // ── Active time formatter ─────────────────────────────────────────────────
  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}s ${m % 60}d`;
    return `${m}d ${s % 60}s`;
  };

  // ── Weekly chart ──────────────────────────────────────────────────────────
  const maxSteps = Math.max(...weeklyData.map(d => d.steps), goal, 1);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">👟</span>
          </div>
          <div>
            <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('steps.title')}</h3>
            <p className="text-xs text-gray-400">{t('steps.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowManual(v => !v)}
          className="text-xs text-emerald-600 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          ✏️ {t('steps.manual_add')}
        </button>
      </div>

      {/* Ring */}
      <div className="flex flex-col items-center mb-4">
        <Ring pct={pct} steps={steps} goal={goal} t={t} />
        <p className={`text-sm font-semibold mt-2 ${motiv.color}`}>{motiv.text}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: '📍', label: t('steps.distance'), value: `${distKm} km` },
          { icon: '🔥', label: t('steps.calories'), value: `${calories} kcal` },
          { icon: '⏱️', label: t('steps.active_time'), value: tracking ? fmtTime(activeTime) : fmtTime(activeTime) },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
            <p className="text-lg leading-none mb-1">{s.icon}</p>
            <p className="text-sm font-black text-gray-800">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Manual input */}
      {showManual && (
        <div className="flex gap-2 mb-3 animate-fade-in">
          <input
            type="number" value={manualInput} min="1" max="99999"
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleManualAdd()}
            placeholder={t('steps.add_placeholder')}
            className="flex-1 px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm font-bold"
            autoFocus
          />
          <button onClick={handleManualAdd}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors">
            {t('common.done')}
          </button>
        </div>
      )}

      {/* Tracking controls */}
      {permission === 'denied' && (
        <p className="text-xs text-red-500 text-center mb-3">{t('steps.permission_denied')}</p>
      )}
      {permission === 'unsupported' && (
        <p className="text-xs text-gray-400 text-center mb-3">{t('steps.not_supported')}</p>
      )}

      {!tracking ? (
        <button onClick={startTracking}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black rounded-2xl transition-all active:scale-95 shadow-md shadow-amber-200/50">
          👟 {t('steps.start')}
        </button>
      ) : (
        <button onClick={stopTracking}
          className="w-full py-3.5 bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl transition-all active:scale-95 shadow-md shadow-red-200/50">
          ⏹ {t('steps.stop')} — {sessionSteps.current} {t('steps.steps')}
        </button>
      )}

      {/* Weekly chart */}
      <div className="mt-5">
        <p className="text-xs font-bold text-gray-500 mb-3">{t('steps.weekly_title')}</p>
        <div className="flex items-end gap-1.5 h-16">
          {weeklyData.map((d, i) => {
            const h = Math.max(4, (d.steps / maxSteps) * 56);
            const isToday = i === weeklyData.length - 1;
            const onGoal  = d.steps >= goal;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    onGoal ? 'bg-emerald-400' : isToday ? 'bg-amber-400' : 'bg-gray-200'
                  }`}
                  style={{ height: `${h}px` }}
                />
                <span className={`text-[9px] font-semibold ${isToday ? 'text-amber-600' : 'text-gray-400'}`}>
                  {d.day}
                </span>
              </div>
            );
          })}
        </div>
        {/* Goal line label */}
        <div className="flex items-center gap-2 mt-2">
          <div className="w-3 h-0.5 bg-emerald-400 rounded"/>
          <span className="text-[10px] text-gray-400">{t('steps.goal_reached')}</span>
          <div className="w-3 h-0.5 bg-amber-400 rounded ml-2"/>
          <span className="text-[10px] text-gray-400">{t('steps.today')}</span>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function calcScore({ calories, protein, goal, waterCurrent, waterGoal, stepsCurrent, stepsGoal }) {
  const breakdown = [];

  // Calorie balance — 35 pts
  let calPts = 0;
  if (calories > 0) {
    const r = calories / goal;
    if (r >= 0.85 && r <= 1.15) calPts = 35;
    else if (r >= 0.70 && r <= 1.30) calPts = 20;
    else if (r >= 0.50) calPts = 8;
  }
  breakdown.push({ key: 'score.cal', pts: calPts, max: 35 });

  // Protein ratio — 25 pts (protein ≥ 15% of total kcal)
  let proPts = 0;
  if (calories > 0) {
    const ratio = (protein * 4) / calories;
    if (ratio >= 0.20) proPts = 25;
    else if (ratio >= 0.15) proPts = 18;
    else if (ratio >= 0.10) proPts = 8;
  }
  breakdown.push({ key: 'score.protein', pts: proPts, max: 25 });

  // Water — 20 pts
  let waterPts = 0;
  if (waterCurrent >= waterGoal) waterPts = 20;
  else if (waterCurrent >= waterGoal * 0.7) waterPts = 12;
  else if (waterCurrent >= waterGoal * 0.4) waterPts = 5;
  breakdown.push({ key: 'score.water', pts: waterPts, max: 20 });

  // Steps — 20 pts
  let stepPts = 0;
  if (stepsCurrent >= stepsGoal) stepPts = 20;
  else if (stepsCurrent >= stepsGoal * 0.7) stepPts = 12;
  else if (stepsCurrent >= stepsGoal * 0.4) stepPts = 5;
  breakdown.push({ key: 'score.steps', pts: stepPts, max: 20 });

  const total = breakdown.reduce((s, b) => s + b.pts, 0);
  return { total, breakdown };
}

function ScoreRing({ score }) {
  const r = 52, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const dash  = (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? '😊' : score >= 50 ? '😐' : '😕';

  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="12"/>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="60" y="54" textAnchor="middle" fontSize="26" fontWeight="900" fill="#111827">{score}</text>
      <text x="60" y="68" textAnchor="middle" fontSize="10" fill="#9ca3af">/100</text>
      <text x="60" y="84" textAnchor="middle" fontSize="16">{label}</text>
    </svg>
  );
}

export default function NutritionScore() {
  const { t } = useLanguage();
  const { getDailyTotals, getGoal, getWaterToday, getWaterGoal, getStepsToday, getStepGoal } = useLocalStorage();

  const totals       = getDailyTotals();
  const goal         = getGoal();
  const waterCurrent = getWaterToday();
  const waterGoal    = getWaterGoal();
  const stepsCurrent = getStepsToday();
  const stepsGoal    = getStepGoal();

  const { total, breakdown } = useMemo(() => calcScore({
    calories: totals.calories || 0,
    protein:  totals.protein  || 0,
    goal, waterCurrent, waterGoal, stepsCurrent, stepsGoal,
  }), [totals, goal, waterCurrent, waterGoal, stepsCurrent, stepsGoal]);

  const scoreColor = total >= 75 ? 'text-emerald-600' : total >= 50 ? 'text-amber-500' : 'text-red-500';
  const scoreLabel = total >= 75 ? t('score.great') : total >= 50 ? t('score.good') : t('score.improve');

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-2xl bg-yellow-50 flex items-center justify-center flex-shrink-0 text-xl">
          ⭐
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-sm leading-tight">{t('score.title')}</h3>
          <p className="text-xs text-gray-400">{t('score.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="flex flex-col items-center flex-shrink-0">
          <ScoreRing score={total} />
          <p className={`text-xs font-bold mt-1 ${scoreColor}`}>{scoreLabel}</p>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2.5">
          {breakdown.map(b => (
            <div key={b.key}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs text-gray-600">{t(b.key)}</span>
                <span className="text-xs font-bold text-gray-700">{b.pts}<span className="text-gray-300 font-normal">/{b.max}</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(b.pts / b.max) * 100}%`,
                    backgroundColor: b.pts === b.max ? '#10b981' : b.pts >= b.max * 0.5 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export default function CalorieTrend() {
  const { t } = useLanguage();
  const { getMonthlyCalories, getGoal } = useLocalStorage();

  const data = getMonthlyCalories();
  const goal = getGoal();

  const withData  = data.filter(d => d.calories > 0);
  const avg       = withData.length ? Math.round(withData.reduce((s, d) => s + d.calories, 0) / withData.length) : 0;
  const maxCal    = Math.max(...data.map(d => d.calories), goal * 1.2, 100);

  // SVG dimensions
  const W = 320, H = 100, PX = 8, PY = 8;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;

  const toX = (i) => PX + (i / (data.length - 1)) * innerW;
  const toY = (cal) => PY + innerH - (cal / maxCal) * innerH;

  // Build smooth path
  const pointsWithData = data.map((d, i) => ({ x: toX(i), y: toY(d.calories), cal: d.calories }));

  const linePath = useMemo(() => {
    const pts = pointsWithData.filter(p => p.cal > 0);
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 3;
      const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) / 3;
      d += ` C ${cp1x} ${pts[i - 1].y} ${cp2x} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    return d;
  }, [data]);

  const areaPath = linePath
    ? `${linePath} L ${pointsWithData.filter(p => p.cal > 0).at(-1)?.x} ${PY + innerH} L ${pointsWithData.filter(p => p.cal > 0)[0]?.x} ${PY + innerH} Z`
    : '';

  const goalY = toY(goal);

  // X-axis labels: show every 5th day
  const labels = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-xl">
            📉
          </div>
          <div>
            <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('trend.title')}</h3>
            <p className="text-xs text-gray-400">{t('trend.subtitle')}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-indigo-600">{avg || '—'}</p>
          <p className="text-[10px] text-gray-400">{t('trend.avg')} kcal</p>
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 110 }}>
        {/* Goal line */}
        <line x1={PX} y1={goalY} x2={W - PX} y2={goalY}
          stroke="#10b981" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
        <text x={W - PX + 2} y={goalY + 3} fontSize="7" fill="#10b981" opacity="0.8">
          {t('trend.goal')}
        </text>

        {/* Average line */}
        {avg > 0 && (
          <line x1={PX} y1={toY(avg)} x2={W - PX} y2={toY(avg)}
            stroke="#6366f1" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
        )}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#trendGrad)" opacity="0.15"/>
        )}

        {/* Line */}
        {linePath && (
          <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}

        {/* Dots */}
        {pointsWithData.filter(p => p.cal > 0).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5"
            fill={p.cal >= goal * 0.85 && p.cal <= goal * 1.15 ? '#10b981' : '#6366f1'}
            stroke="white" strokeWidth="1"/>
        ))}

        {/* X labels */}
        {labels.map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={i} x={toX(idx)} y={H - 1} textAnchor="middle" fontSize="7" fill="#9ca3af">
              {d.date.slice(5)}
            </text>
          );
        })}

        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-indigo-500 rounded"/>
          <span className="text-[10px] text-gray-400">{t('trend.calories')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#10b981 0,#10b981 4px,transparent 4px,transparent 7px)' }}/>
          <span className="text-[10px] text-gray-400">{t('trend.goal_line')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="text-[10px] text-gray-400">{t('trend.on_target')}</span>
        </div>
      </div>

      {withData.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">{t('trend.no_data')}</p>
      )}
    </div>
  );
}

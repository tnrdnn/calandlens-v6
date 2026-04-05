import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const MACROS = [
  { key: 'protein', color: '#3b82f6', bg: 'bg-blue-50',   text: 'text-blue-600'  },
  { key: 'carbs',   color: '#f59e0b', bg: 'bg-amber-50',  text: 'text-amber-600' },
  { key: 'fat',     color: '#ef4444', bg: 'bg-red-50',    text: 'text-red-500'   },
];

// SVG donut segment helper
function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DonutChart({ slices }) {
  const cx = 80, cy = 80, r = 60, stroke = 22;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) {
    return (
      <svg viewBox="0 0 160 160" className="w-36 h-36">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
      </svg>
    );
  }

  let paths = [];
  let cumAngle = 0;
  slices.forEach((sl, i) => {
    const angle = (sl.value / total) * 360;
    if (angle === 0) return;
    const start = polarToXY(cx, cy, r, cumAngle);
    const end   = polarToXY(cx, cy, r, cumAngle + angle - 0.5);
    const large = angle > 180 ? 1 : 0;
    paths.push(
      <path
        key={i}
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
        fill="none"
        stroke={sl.color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    );
    cumAngle += angle;
  });

  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke}/>
      {paths}
    </svg>
  );
}

export default function MacroPie() {
  const { t } = useLanguage();
  const { getDailyTotals } = useLocalStorage();
  const totals = getDailyTotals();

  const protein = Math.round(totals.protein || 0);
  const carbs   = Math.round(totals.carbs   || 0);
  const fat     = Math.round(totals.fat     || 0);
  const total   = protein * 4 + carbs * 4 + fat * 9; // kcal from macros

  const slices = [
    { value: protein * 4, color: '#3b82f6' },
    { value: carbs   * 4, color: '#f59e0b' },
    { value: fat     * 9, color: '#ef4444' },
  ];

  const pct = (kcal) => total > 0 ? Math.round((kcal / total) * 100) : 0;

  const rows = [
    { label: t('nutrition.protein'), val: protein, kcal: protein * 4, ...MACROS[0] },
    { label: t('nutrition.carbs'),   val: carbs,   kcal: carbs * 4,   ...MACROS[1] },
    { label: t('nutrition.fat'),     val: fat,     kcal: fat * 9,     ...MACROS[2] },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-xl">
          🥧
        </div>
        <div>
          <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('macro.title')}</h3>
          <p className="text-xs text-gray-400">{t('macro.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <DonutChart slices={slices} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm font-black text-gray-800 leading-none">{total}</p>
            <p className="text-[10px] text-gray-400">kcal</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {rows.map(row => (
            <div key={row.key}>
              <div className="flex justify-between items-center mb-0.5">
                <span className={`text-xs font-semibold ${row.text}`}>{row.label}</span>
                <span className="text-xs text-gray-500 font-bold">{row.val}g <span className="text-gray-300 font-normal">({pct(row.kcal)}%)</span></span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct(row.kcal)}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          ))}

          {total === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">{t('macro.no_data')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

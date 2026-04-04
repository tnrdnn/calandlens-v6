import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { MICRO_NUTRIENTS_META } from '../../services/nutritionDB';

export default function MicroNutrientsPanel({ totals = {}, className = '' }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const items = MICRO_NUTRIENTS_META.map(meta => ({
    ...meta,
    value: totals[meta.key] || 0,
    pct: Math.min(100, Math.round(((totals[meta.key] || 0) / meta.dv) * 100)),
  })).filter(item => item.value > 0);

  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 4);

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🔬</span>
          <span className="font-semibold text-gray-800 text-sm">{t('nutrition.micros')}</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{items.length}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="px-4 pb-4 space-y-3">
        {visible.map(item => (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-sm text-gray-700">
                <span>{item.icon}</span>
                <span className="font-medium">{t(item.label_key)}</span>
              </span>
              <div className="text-right flex items-baseline gap-1">
                <span className="text-sm font-bold text-gray-800">{item.value}</span>
                <span className="text-xs text-gray-400">{item.unit}</span>
                <span className="text-xs text-gray-400 ml-1">/ {item.dv}{item.unit}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8 text-right">{item.pct}%</span>
            </div>
          </div>
        ))}

        {items.length > 4 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-full text-center text-xs text-emerald-600 font-semibold py-1 hover:underline"
          >
            {expanded ? '↑ Daha az göster' : `↓ ${items.length - 4} besin daha`}
          </button>
        )}
      </div>
    </div>
  );
}

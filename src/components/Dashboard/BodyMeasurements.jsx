import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const FIELDS = [
  { key: 'weight', unit: 'kg', emoji: '⚖️',  color: '#6366f1' },
  { key: 'waist',  unit: 'cm', emoji: '📐', color: '#f59e0b' },
  { key: 'hip',    unit: 'cm', emoji: '📏', color: '#ec4899' },
];

// Mini SVG weight sparkline
function Sparkline({ values, color }) {
  if (values.length < 2) return null;
  const W = 80, H = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const toX = (i) => (i / (values.length - 1)) * W;
  const toY = (v) => H - ((v - min) / range) * (H - 4) - 2;
  let d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 80, height: 28 }}>
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={toX(values.length - 1)} cy={toY(values.at(-1))} r="2.5" fill={color}/>
    </svg>
  );
}

export default function BodyMeasurements() {
  const { t } = useLanguage();
  const { getBodyMeasurements, addBodyMeasurement, deleteBodyMeasurement } = useLocalStorage();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ weight: '', waist: '', hip: '' });
  const [confirmDel, setConfirmDel] = useState(null);

  const all     = getBodyMeasurements();
  const latest  = all.at(-1) || {};
  const prev    = all.at(-2) || {};

  const handleSave = () => {
    const data = {};
    let hasValue = false;
    FIELDS.forEach(f => {
      const v = parseFloat(form[f.key]);
      if (!isNaN(v) && v > 0) { data[f.key] = v; hasValue = true; }
    });
    if (!hasValue) return;
    addBodyMeasurement(data);
    setForm({ weight: '', waist: '', hip: '' });
    setShowForm(false);
  };

  const diff = (key) => {
    if (!latest[key] || !prev[key]) return null;
    const d = (latest[key] - prev[key]).toFixed(1);
    return d > 0 ? `+${d}` : d;
  };

  // Sparkline values
  const sparkVals = (key) => all.filter(m => m[key]).map(m => m[key]).slice(-10);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-xl">
            📏
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{t('body.title')}</h3>
            <p className="text-xs text-gray-400">{t('body.subtitle')}</p>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold text-xs rounded-xl transition-colors">
          + {t('body.add')}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 animate-fade-in">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 font-semibold block mb-1">
                  {f.emoji} {t(`body.${f.key}`)} ({f.unit})
                </label>
                <input
                  type="number" step="0.1" min="0" value={form[f.key]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  placeholder="—"
                  className="w-full px-2 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm font-bold text-center"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-2 border-2 border-gray-200 rounded-xl text-gray-500 text-sm font-semibold">
              {t('common.cancel')}
            </button>
            <button onClick={handleSave}
              className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-bold transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Current stats */}
      {all.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {FIELDS.map(f => {
              const val = latest[f.key];
              const d   = diff(f.key);
              const spark = sparkVals(f.key);
              return (
                <div key={f.key} className="bg-gray-50 rounded-2xl p-3 text-center">
                  <p className="text-base font-black text-gray-800 leading-none">
                    {val ? `${val}` : '—'}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">{val ? f.unit : ''}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t(`body.${f.key}`)}</p>
                  {d && (
                    <p className={`text-[10px] font-bold mt-0.5 ${parseFloat(d) < 0 ? 'text-emerald-500' : parseFloat(d) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {d} {f.unit}
                    </p>
                  )}
                  <div className="flex justify-center mt-1">
                    <Sparkline values={spark} color={f.color} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* History — last 5 */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-gray-500 mb-2">{t('body.history')}</p>
            {[...all].reverse().slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                <span className="text-gray-400 font-medium">{m.date}</span>
                <div className="flex gap-3">
                  {FIELDS.map(f => m[f.key] ? (
                    <span key={f.key}>{f.emoji} <b>{m[f.key]}</b>{f.unit}</span>
                  ) : null)}
                </div>
                {confirmDel === m.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { deleteBodyMeasurement(m.id); setConfirmDel(null); }}
                      className="text-red-500 font-bold px-1">✓</button>
                    <button onClick={() => setConfirmDel(null)} className="text-gray-400 px-1">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDel(m.id)} className="text-gray-300 hover:text-red-400">🗑</button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">{t('body.no_data')}</p>
      )}
    </div>
  );
}

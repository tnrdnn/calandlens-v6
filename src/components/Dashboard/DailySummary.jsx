import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getDailyTip } from '../../services/aiService';
import MicroNutrientsPanel from '../Analysis/MicroNutrientsPanel';
import MealPhotoThumb from '../Meal/MealPhotoThumb';

/* ── SVG Circular Progress ─────────────────────────────────────────────────── */
function CalorieRing({ consumed, goal }) {
  const over      = consumed > goal;
  const pct       = Math.min(1, consumed / goal);
  const remaining = Math.max(0, goal - consumed);

  const R   = 88;          // radius
  const CX  = 110;         // viewBox centre
  const CY  = 110;
  const SW  = 18;          // stroke width
  const circ = 2 * Math.PI * R;
  const dash = circ * pct;
  const gap  = circ - dash;

  // track colour
  const strokeColor = over ? '#fb923c' : '#10b981';

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow wrapper */}
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 18px ${over ? 'rgba(251,146,60,0.35)' : 'rgba(16,185,129,0.35)'})`}}
      >
        <svg width="220" height="220" viewBox="0 0 220 220">
          <defs>
            {/* Subtle radial fill inside ring */}
            <radialGradient id="innerFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={over ? '#fff7ed' : '#ecfdf5'} stopOpacity="1"/>
              <stop offset="100%" stopColor={over ? '#ffedd5' : '#d1fae5'} stopOpacity="0.6"/>
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={over ? '#fb923c' : '#34d399'}/>
              <stop offset="100%" stopColor={over ? '#f97316' : '#059669'}/>
            </linearGradient>
          </defs>

          {/* Background fill circle */}
          <circle cx={CX} cy={CY} r={R - SW / 2} fill="url(#innerFill)"/>

          {/* Track (grey ring) */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={SW}
          />

          {/* Progress arc */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={circ * 0.25}   /* start at 12 o'clock */
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
          <span className="text-[11px] font-semibold text-gray-400 tracking-wide uppercase">
            {over ? 'Aşıldı' : 'Kalan'}
          </span>
          <span
            className="font-black leading-none"
            style={{ fontSize: '2.6rem', color: over ? '#ea580c' : '#065f46' }}
          >
            {over ? `+${Math.round(consumed - goal)}` : Math.round(remaining)}
          </span>
          <span className="text-[11px] font-semibold text-gray-400">kcal</span>
          <span className="text-[10px] text-gray-300 mt-1">Hedef: {goal} kcal</span>
        </div>
      </div>

      {/* Consumed label below ring */}
      <div className="mt-1 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: strokeColor }}/>
        <span className="text-sm font-bold text-gray-600">
          {Math.round(consumed)} kcal tüketildi
        </span>
      </div>
    </div>
  );
}

/* ── Macro Card ─────────────────────────────────────────────────────────────── */
function MacroCard({ icon, label, value, unit = 'g', pct, gradFrom, gradTo, textColor }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  return (
    <div
      className="flex-1 rounded-2xl shadow-md p-3.5 flex flex-col gap-2 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
    >
      {/* Glassmorphism shine */}
      <div className="absolute inset-0 rounded-2xl"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0) 60%)' }}
      />
      <div className="relative z-10">
        <span className="text-xl leading-none">{icon}</span>
      </div>
      <div className="relative z-10">
        <p className="font-black leading-none" style={{ fontSize: '1.25rem', color: textColor }}>
          {Math.round(value * 10) / 10}
          <span className="text-xs font-semibold ml-0.5 opacity-80">{unit}</span>
        </p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: textColor, opacity: 0.75 }}>{label}</p>
      </div>
      {/* Progress bar */}
      <div className="relative z-10 h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clampedPct}%`, background: textColor, opacity: 0.7 }}
        />
      </div>
      <p className="relative z-10 text-[10px] font-bold" style={{ color: textColor, opacity: 0.6 }}>
        %{clampedPct}
      </p>
    </div>
  );
}

/* ── Custom Bar label (trend arrow on last bar) ─────────────────────────────── */
const BAR_COLORS = ['#93c5fd','#6ee7b7','#fcd34d','#f9a8d4','#a5b4fc','#fb923c','#34d399'];

function TrendArrow({ data }) {
  if (data.length < 2) return null;
  const last  = data[data.length - 1].calories;
  const prev  = data[data.length - 2].calories;
  const up    = last >= prev;
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: up ? '#d1fae5' : '#fee2e2', color: up ? '#065f46' : '#991b1b' }}
    >
      {up ? '↑' : '↓'} {up ? 'Yükseliyor' : 'Düşüyor'}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function DailySummary({ onDeleteMeal }) {
  const { t, lang } = useLanguage();
  const { getTodayMeals, getDailyTotals, getWeeklyData, getGoal, deleteMeal } = useLocalStorage();
  const [tip, setTip]      = useState('');
  const [tipLoading, setTL]= useState(false);
  const [deleteId, setDel] = useState(null);

  const meals  = getTodayMeals();
  const totals = getDailyTotals(new Date());
  const weekly = getWeeklyData();
  const goal   = getGoal();
  const over   = totals.calories > goal;

  // Daily reference values for macro % (rough)
  const MACRO_DV = { protein: 50, carbs: 260, fat: 78 };

  // Fetch AI tip
  useEffect(() => {
    if (meals.length === 0) return;
    let cancelled = false;
    setTL(true);
    getDailyTip(totals, goal, lang)
      .then(text => { if (!cancelled) { setTip(text); setTL(false); } })
      .catch(()  => { if (!cancelled) setTL(false); });
    return () => { cancelled = true; };
  }, [meals.length, lang]);

  const handleDelete = (id) => { deleteMeal(id); onDeleteMeal?.(); setDel(null); };

  return (
    <div className="space-y-5">

      {/* ── 1. CALORIE RING CARD ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-800 text-lg tracking-tight">{t('dashboard.title')}</h2>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            over ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {over
              ? `+${Math.round(totals.calories - goal)} kcal aşıldı`
              : `${Math.round(Math.max(0, goal - totals.calories))} kcal kaldı`
            }
          </span>
        </div>

        {/* SVG Ring */}
        <div className="flex justify-center mb-5">
          <CalorieRing consumed={totals.calories} goal={goal} />
        </div>

        {/* ── 2. MACRO CARDS ─────────────────────────────────────────────── */}
        <div className="flex gap-2.5">
          <MacroCard
            icon="🥩"
            label={t('nutrition.protein')}
            value={totals.protein}
            pct={Math.round((totals.protein / MACRO_DV.protein) * 100)}
            gradFrom="#dbeafe" gradTo="#bfdbfe"
            textColor="#1e40af"
          />
          <MacroCard
            icon="🍞"
            label={t('nutrition.carbs')}
            value={totals.carbs}
            pct={Math.round((totals.carbs / MACRO_DV.carbs) * 100)}
            gradFrom="#ffedd5" gradTo="#fed7aa"
            textColor="#9a3412"
          />
          <MacroCard
            icon="🥑"
            label={t('nutrition.fat')}
            value={totals.fat}
            pct={Math.round((totals.fat / MACRO_DV.fat) * 100)}
            gradFrom="#d1fae5" gradTo="#a7f3d0"
            textColor="#064e3b"
          />
        </div>
      </div>

      {/* ── Micro nutrients ──────────────────────────────────────────────── */}
      <MicroNutrientsPanel totals={totals} />

      {/* ── 3. WEEKLY CHART ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{t('dashboard.weekly_chart')}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Son 7 günün kalori takibi</p>
          </div>
          <TrendArrow data={weekly} />
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={weekly} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
              axisLine={false} tickLine={false}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 8 }}
              contentStyle={{
                borderRadius: '14px', border: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                fontSize: '12px', fontWeight: 700,
                padding: '8px 14px',
              }}
              formatter={(v) => [`${v} kcal`, '']}
              labelFormatter={(l) => l}
            />
            <Bar dataKey="calories" radius={[8, 8, 3, 3]}>
              {weekly.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.calories >= goal        ? '#fb923c'
                    : entry.calories > goal * 0.7 ? BAR_COLORS[i % BAR_COLORS.length]
                    : '#cbd5e1'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── 4. AI TIP CARD ──────────────────────────────────────────────── */}
      <div
        className="rounded-3xl shadow-lg overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #4c1d95 100%)' }}
      >
        {/* Shine overlay */}
        <div style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 55%)' }}
          className="p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✨</span>
            </div>
            <span className="font-bold text-white text-sm tracking-wide">{t('dashboard.ai_tip')}</span>
          </div>

          {tipLoading ? (
            <div className="flex items-center gap-2.5 py-1">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0"/>
              <span className="text-violet-200 text-sm">{t('dashboard.ai_tip_loading')}</span>
            </div>
          ) : tip ? (
            <p className="text-sm text-violet-100 leading-relaxed">{tip}</p>
          ) : (
            <p className="text-sm text-violet-300 italic">
              {meals.length === 0 ? '🥗 İlk öğününü ekle, sana önerim gelsin!' : '—'}
            </p>
          )}
        </div>
      </div>

      {/* ── 5. TODAY'S MEALS ────────────────────────────────────────────── */}
      {meals.length > 0 && (
        <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">{t('dashboard.todays_meals')}</h3>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {meals.length} öğün
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {meals.map(meal => (
              <div key={meal.id} className="flex items-center gap-3 px-4 py-3.5">
                <MealPhotoThumb mealId={meal.id} photo={meal.photo} size="md" editable={true} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {meal.icon || '🍽️'} {meal.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">
                      {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {meal.portionGrams && (
                      <span className="text-xs text-gray-400">· {meal.portionGrams}g</span>
                    )}
                    {meal.source === 'barcode' && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">🏷️ barkod</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-gray-700">{Math.round(meal.calories)} kcal</span>
                  <button
                    onClick={() => setDel(meal.id)}
                    className="p-1.5 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center">
            <p className="text-3xl mb-3">🗑️</p>
            <p className="font-bold text-gray-800 mb-1">{t('meal.delete')}</p>
            <p className="text-sm text-gray-400 mb-5">{t('meal.delete_confirm')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDel(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                {t('common.cancel')}
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">
                {t('meal.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getDailyTip } from '../../services/aiService';
import MicroNutrientsPanel from '../Analysis/MicroNutrientsPanel';
import MealPhotoThumb from '../Meal/MealPhotoThumb';
import { detectAllergens } from '../../services/allergens';

/* ── SVG Circular Progress ──────────────────────────────────────────────────── */
function CalorieRing({ consumed, goal, labelOver, labelRemaining, labelConsumed, labelGoal }) {
  const over      = consumed > goal;
  const pct       = Math.min(1, consumed / goal);
  const remaining = Math.max(0, goal - consumed);

  const R    = 108;
  const CX   = 130;
  const CY   = 130;
  const SW   = 20;
  const circ = 2 * Math.PI * R;
  const dash = circ * pct;
  const gap  = circ - dash;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative"
        style={{ filter: `drop-shadow(0 0 32px ${over ? 'rgba(251,146,60,0.55)' : 'rgba(16,185,129,0.55)'})` }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260">
          <defs>
            <radialGradient id="innerFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="1"/>
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="1"/>
            </radialGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={over ? '#fbbf24' : '#34d399'}/>
              <stop offset="50%"  stopColor={over ? '#fb923c' : '#10b981'}/>
              <stop offset="100%" stopColor={over ? '#f97316' : '#059669'}/>
            </linearGradient>
          </defs>
          {/* Inner bg */}
          <circle cx={CX} cy={CY} r={R - SW / 2} fill="url(#innerFill)"/>
          {/* Track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#e2e8f0" strokeWidth={SW}/>
          {/* Progress arc */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth={SW}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={circ * 0.25}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{labelConsumed}</span>
          <span
            className="font-black leading-none"
            style={{ fontSize: '3.4rem', color: over ? '#ea580c' : '#065f46' }}
          >
            {Math.round(consumed)}
          </span>
          <span className="text-sm font-bold text-gray-400 -mt-1">kcal</span>
          <div
            className="mt-2 px-3 py-1 rounded-full"
            style={{ background: over ? '#fff7ed' : '#ecfdf5' }}
          >
            <span className="text-xs font-black" style={{ color: over ? '#ea580c' : '#059669' }}>
              {over
                ? `+${Math.round(consumed - goal)} ${labelOver}`
                : `${Math.round(remaining)} ${labelRemaining}`}
            </span>
          </div>
          <span className="text-[10px] text-gray-300 mt-1">{labelGoal}: {goal} kcal</span>
        </div>
      </div>
    </div>
  );
}

/* ── Macro Card ──────────────────────────────────────────────────────────────── */
function MacroCard({ icon, label, value, unit = 'g', pct, gradFrom, gradTo, textColor }) {
  const clampedPct = Math.min(100, Math.max(0, pct));
  return (
    <div
      className="flex-1 rounded-2xl p-4 flex flex-col gap-2.5 relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${gradFrom}, ${gradTo})`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
      }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.35) 0%,rgba(255,255,255,0) 55%)' }}
      />
      <div className="relative z-10">
        <span className="text-2xl leading-none">{icon}</span>
      </div>
      <div className="relative z-10">
        <p className="font-black leading-none" style={{ fontSize: '1.65rem', color: textColor }}>
          {Math.round(value * 10) / 10}
          <span className="text-sm font-semibold ml-1 opacity-75">{unit}</span>
        </p>
        <p className="text-xs font-bold mt-1" style={{ color: textColor, opacity: 0.7 }}>{label}</p>
      </div>
      <div className="relative z-10 h-1.5 rounded-full bg-black/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clampedPct}%`, background: textColor, opacity: 0.65 }}
        />
      </div>
      <p className="relative z-10 text-xs font-black" style={{ color: textColor, opacity: 0.55 }}>
        %{clampedPct}
      </p>
    </div>
  );
}

/* ── Meal category helpers ───────────────────────────────────────────────────── */
function getMealCategory(timestamp) {
  const h = new Date(timestamp).getHours();
  if (h >= 5  && h < 11) return 'breakfast';
  if (h >= 11 && h < 15) return 'lunch';
  if (h >= 15 && h < 21) return 'dinner';
  return 'snack';
}

const CATEGORY_META = {
  breakfast: { icon: '🌅', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  lunch:     { icon: '☀️', color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  dinner:    { icon: '🌙', color: '#4f46e5', bg: '#e0e7ff', border: '#a5b4fc' },
  snack:     { icon: '🍎', color: '#db2777', bg: '#fce7f3', border: '#f9a8d4' },
};

const CATEGORY_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

/* ── Trend Arrow ─────────────────────────────────────────────────────────────── */
const BAR_COLORS = ['#93c5fd','#6ee7b7','#fcd34d','#f9a8d4','#a5b4fc','#fb923c','#34d399'];

function TrendArrow({ data, labelUp, labelDown }) {
  if (data.length < 2) return null;
  const last = data[data.length - 1].calories;
  const prev = data[data.length - 2].calories;
  const up   = last >= prev;
  return (
    <span
      className="text-xs font-bold px-2 py-1 rounded-full"
      style={{ background: up ? '#d1fae5' : '#fee2e2', color: up ? '#065f46' : '#991b1b' }}
    >
      {up ? `↑ ${labelUp}` : `↓ ${labelDown}`}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
export default function DailySummary({ onDeleteMeal }) {
  const { t, tArr, lang } = useLanguage();
  const { getTodayMeals, getDailyTotals, getWeeklyData, getGoal, deleteMeal, getUserAllergens, getMacroGoals } = useLocalStorage();
  const userAllergens = getUserAllergens();
  const [tip, setTip]      = useState('');
  const [tipLoading, setTL]= useState(false);
  const [deleteId, setDel] = useState(null);

  const meals  = getTodayMeals();
  const totals = getDailyTotals(new Date());
  const goal   = getGoal();
  const over   = totals.calories > goal;

  // Macro targets derived from user's macro goals + calorie goal
  const macroGoals = getMacroGoals();
  const MACRO_DV = {
    protein: Math.round((goal * macroGoals.protein / 100) / 4),
    carbs:   Math.round((goal * macroGoals.carbs   / 100) / 4),
    fat:     Math.round((goal * macroGoals.fat     / 100) / 9),
  };

  // ── Localised weekday labels ─────────────────────────────────────────────
  const weekdays = tArr('history.weekdays');
  const rawWeekly = getWeeklyData();
  const weekly = rawWeekly.map(entry => {
    const dow = new Date(entry.date + 'T12:00:00').getDay();
    return {
      ...entry,
      day: weekdays[dow] ?? entry.day,
    };
  });

  // ── AI tip ───────────────────────────────────────────────────────────────
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
    <div className="space-y-6">

      {/* ── 1. CALORIE RING + MACROS ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 px-5 pt-6 pb-7"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('dashboard.title')}</h2>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            over ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {over
              ? `+${Math.round(totals.calories - goal)} kcal ${t('dashboard.over_goal')}`
              : `${Math.round(Math.max(0, goal - totals.calories))} kcal ${t('dashboard.remaining')}`
            }
          </span>
        </div>

        {/* Ring */}
        <div className="flex justify-center mb-7">
          <CalorieRing
            consumed={totals.calories}
            goal={goal}
            labelOver={t('dashboard.over_goal')}
            labelRemaining={t('dashboard.remaining')}
            labelConsumed={t('dashboard.consumed')}
            labelGoal={t('dashboard.daily_goal')}
          />
        </div>

        {/* Macro Cards */}
        <div className="flex gap-3">
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

      {/* ── 3. WEEKLY CHART ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-emerald-700 text-base leading-tight bg-emerald-50 px-2.5 py-0.5 rounded-xl inline-block">{t('dashboard.weekly_chart')}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{t('report.subtitle')}</p>
          </div>
          <TrendArrow
            data={weekly}
            labelUp="↑"
            labelDown="↓"
          />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weekly} barSize={26} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={['auto', 'auto']}/>
            <Tooltip
              cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 8 }}
              contentStyle={{
                borderRadius: '16px', border: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                fontSize: '12px', fontWeight: 700,
                padding: '8px 14px',
              }}
              formatter={(v) => [`${v} kcal`, '']}
              labelFormatter={(l) => l}
            />
            <Bar dataKey="calories" radius={[10, 10, 4, 4]}>
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

      {/* ── 4. AI TIP CARD ───────────────────────────────────────────────── */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 45%, #4c1d95 100%)',
          boxShadow: '0 8px 32px rgba(109,40,217,0.28)',
        }}
      >
        <div
          className="p-5"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.12) 0%,rgba(255,255,255,0) 55%)' }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0
              backdrop-blur-sm">
              <span className="text-base">✨</span>
            </div>
            <span className="font-black text-white text-sm tracking-wide">{t('dashboard.ai_tip')}</span>
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
              {meals.length === 0 ? `🥗 ${t('meal.no_meals')}` : '—'}
            </p>
          )}
        </div>
      </div>

      {/* ── 5. TODAY'S MEALS (grouped by category) ───────────────────────── */}
      {meals.length > 0 && (() => {
        const grouped = {};
        for (const cat of CATEGORY_ORDER) {
          grouped[cat] = meals.filter(m => getMealCategory(m.timestamp) === cat);
        }
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-gray-800 text-base">
                {t('dashboard.todays_meals')}
              </h3>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {meals.length} {t('history.meals_count')}
              </span>
            </div>

            {CATEGORY_ORDER.map(cat => {
              const catMeals = grouped[cat];
              if (!catMeals.length) return null;
              const meta = CATEGORY_META[cat];
              const catCal = catMeals.reduce((s, m) => s + (m.calories || 0), 0);
              return (
                <div key={cat}
                  className="bg-white rounded-3xl overflow-hidden border"
                  style={{ borderColor: meta.border, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                  {/* Category header */}
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: meta.bg }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="font-black text-sm" style={{ color: meta.color }}>
                        {t(`meal.${cat}`)}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: meta.color + '22', color: meta.color }}>
                      {Math.round(catCal)} kcal
                    </span>
                  </div>

                  {/* Meals in this category */}
                  <div className="divide-y divide-gray-50">
                    {catMeals.map(meal => (
                      <div key={meal.id} className="flex items-center gap-3 px-4 py-3.5">
                        <MealPhotoThumb mealId={meal.id} photo={meal.photo} size="md" editable={true}/>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {meal.icon || '🍽️'} {meal.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400">
                              {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {meal.portionGrams && (
                              <span className="text-xs text-gray-400">· {meal.portionGrams}{t('common.g')}</span>
                            )}
                            {meal.source === 'barcode' && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">🏷️ barkod</span>
                            )}
                            {detectAllergens(meal.name, lang, userAllergens).map(a => (
                              <span key={a.id}
                                title={t(`allergen.${a.id}`)}
                                className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{ backgroundColor: a.color + '22', color: a.color }}>
                                {a.emoji} {t(`allergen.${a.id}`)}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-700">{Math.round(meal.calories)} {t('common.kcal')}</span>
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
              );
            })}
          </div>
        );
      })()}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
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

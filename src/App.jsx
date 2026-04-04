import React, { useState, useCallback, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { useLocalStorage } from './hooks/useLocalStorage';
import LanguageSelector from './components/Settings/LanguageSelector';
import CameraView from './components/Camera/CameraView';
import DailySummary from './components/Dashboard/DailySummary';
import GoalWizard from './components/Dashboard/GoalWizard';
import EatingSpeedCoach from './components/Dashboard/EatingSpeedCoach';
import WeeklyReport from './components/Dashboard/WeeklyReport';
import HistoryPage from './components/History/HistoryPage';

/* ─────────────────────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────────────────────── */
function SettingsPage({ onClose }) {
  const { t, lang, setLang, LANGUAGE_OPTIONS } = useLanguage();
  const { getGoal, setGoal, clearAllData } = useLocalStorage();
  const [goalInput, setGoalInput]       = useState(String(getGoal()));
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSaveGoal = () => {
    const n = parseInt(goalInput, 10);
    if (!isNaN(n) && n >= 800 && n <= 10000) setGoal(n);
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-50 max-w-md mx-auto flex flex-col">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pt-safe-top pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-lg font-black text-white">{t('settings.title')}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Dil seçimi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">{t('settings.language')}</p>
          <div className="grid grid-cols-1 gap-2">
            {LANGUAGE_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${lang === opt.code ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="text-xl">{opt.flag}</span>
                <span className="flex-1 text-left">{opt.label}</span>
                {lang === opt.code && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Günlük kalori hedefi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">{t('settings.daily_goal')}</p>
          <div className="flex gap-3">
            <input
              type="number" value={goalInput} min="800" max="10000"
              onChange={e => setGoalInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-lg font-bold"
            />
            <span className="flex items-center text-gray-500 font-medium">kcal</span>
            <button onClick={handleSaveGoal}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* Verileri temizle */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">{t('settings.clear_data')}</p>
          {!confirmClear ? (
            <button onClick={() => setConfirmClear(true)}
              className="w-full py-3 border-2 border-red-200 text-red-500 font-semibold rounded-xl hover:bg-red-50 transition-colors">
              🗑️ {t('settings.clear_data')}
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-500">{t('settings.clear_confirm')}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">
                  {t('common.cancel')}
                </button>
                <button onClick={() => { clearAllData(); setConfirmClear(false); onClose(); }}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold">
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-gray-300 py-2">CalAndLens v5.0</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXIT CONFIRM DIALOG
───────────────────────────────────────────────────────────── */
function ExitConfirmDialog({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 text-center">
        <p className="text-3xl mb-3">👋</p>
        <p className="font-black text-gray-800 text-lg mb-1">Çıkmak istiyor musunuz?</p>
        <p className="text-sm text-gray-400 mb-6">Tüm verileriniz kaydedilmiştir.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Hayır
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors">
            Evet, Çık
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GEAR ICON (reusable SVG)
───────────────────────────────────────────────────────────── */
function GearIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   INNER APP  (inside LanguageProvider)
───────────────────────────────────────────────────────────── */
function Inner() {
  const { t } = useLanguage();
  const { addMeal } = useLocalStorage();

  const [tab,            setTab]        = useState('home');
  const [showWizard,     setWizard]     = useState(false);
  const [showSettings,   setSettings]   = useState(false);
  const [showExitDialog, setExitDialog] = useState(false);
  const [refresh,        setRefresh]    = useState(0);

  const handleMealAdded = useCallback((meal) => {
    addMeal(meal);
    setRefresh(r => r + 1);
  }, [addMeal]);

  /* Hardware / browser back-button handler */
  useEffect(() => {
    const onBack = () => {
      if (showSettings)   { setSettings(false);  return; }
      if (showWizard)     { setWizard(false);     return; }
      if (tab !== 'home') { setTab('home');        return; }
      setExitDialog(true);
    };
    window.history.pushState({ cal: true }, '');
    window.addEventListener('popstate', onBack);
    return () => window.removeEventListener('popstate', onBack);
  }, [tab, showSettings, showWizard]);

  const handleExitConfirm = () => {
    window.history.go(-2);
    setExitDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative select-none">

      {/* ── HEADER ── */}
      <header className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pt-safe-top pb-4 sticky top-0 z-30 shadow-lg shadow-emerald-200/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">CalAndLens</h1>
            <p className="text-xs text-emerald-100">{t('app.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all"
            >
              <span>🎯</span>
              <span className="hidden sm:inline">{t('wizard.title')}</span>
            </button>
            <button
              onClick={() => setSettings(true)}
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-all hover:scale-110 active:scale-95"
              title={t('settings.title')}
            >
              <GearIcon className="w-5 h-5" />
            </button>
            <LanguageSelector compact />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="px-4 pt-4 pb-32">
        {tab === 'home' && (
          <div className="space-y-4">
            {/* Quick-access row */}
            <div className="flex gap-2">
              <button
                onClick={() => setTab('history')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-gray-700 font-semibold text-sm hover:border-emerald-300 hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <span className="text-lg">📅</span>
                <span>{t('tabs.history')}</span>
              </button>
              <button
                onClick={() => setSettings(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-gray-100 shadow-sm text-gray-700 font-semibold text-sm hover:border-emerald-300 hover:bg-emerald-50 active:scale-95 transition-all"
              >
                <GearIcon className="w-4 h-4 text-gray-500" />
                <span>{t('settings.title')}</span>
              </button>
            </div>

            <DailySummary key={refresh} onDeleteMeal={() => setRefresh(r => r + 1)} />
            <EatingSpeedCoach />
            <WeeklyReport />
          </div>
        )}

        {tab === 'camera' && (
          <CameraView onMealAdded={(meal) => { handleMealAdded(meal); setTab('home'); }} />
        )}

        {tab === 'history' && <HistoryPage />}
      </main>

      {/* ── PREMIUM BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-30 pb-safe-bottom">
        <div className="mx-3 mb-3 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100/80 px-2 py-1">
          <div className="flex items-center">

            {/* Left: Özet */}
            <button
              onClick={() => setTab('home')}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl transition-all relative
                ${tab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'home' && <div className="absolute inset-0 rounded-2xl bg-emerald-50"/>}
              <span className={`relative text-2xl leading-none transition-transform duration-200 ${tab === 'home' ? 'scale-110' : ''}`}>🏠</span>
              <span className={`relative text-[11px] font-semibold ${tab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}>{t('tabs.dashboard')}</span>
            </button>

            {/* Left-mid: Geçmiş */}
            <button
              onClick={() => setTab('history')}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl transition-all relative
                ${tab === 'history' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {tab === 'history' && <div className="absolute inset-0 rounded-2xl bg-emerald-50"/>}
              <span className={`relative text-2xl leading-none transition-transform duration-200 ${tab === 'history' ? 'scale-110' : ''}`}>📅</span>
              <span className={`relative text-[11px] font-semibold ${tab === 'history' ? 'text-emerald-600' : 'text-gray-400'}`}>{t('tabs.history')}</span>
            </button>

            {/* Centre: Camera */}
            <div className="flex-shrink-0 px-1">
              <button onClick={() => setTab('camera')} className="flex flex-col items-center">
                <div className={`relative w-[62px] h-[62px] rounded-full flex items-center justify-center transition-all duration-300
                  ${tab === 'camera'
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-300/60 scale-105'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200/50'
                  }`}>
                  <div className="absolute inset-[5px] rounded-full border-2 border-white/30"/>
                  <span className="text-[26px] leading-none relative z-10">📷</span>
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${tab === 'camera' ? 'text-emerald-600' : 'text-gray-500'}`}>
                  {t('tabs.camera')}
                </span>
              </button>
            </div>

            {/* Right-mid: Hız */}
            <button
              onClick={() => {}}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"
            >
              <span className="text-2xl leading-none">⏱️</span>
              <span className="text-[11px] font-semibold">Hız</span>
            </button>

            {/* Right: Hedef */}
            <button
              onClick={() => setWizard(true)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"
            >
              <span className="text-2xl leading-none">🎯</span>
              <span className="text-[11px] font-semibold">Hedef</span>
            </button>

          </div>
        </div>
      </nav>

      {/* ── OVERLAYS ── */}
      {showWizard    && <GoalWizard   onClose={() => setWizard(false)} />}
      {showSettings  && <SettingsPage onClose={() => setSettings(false)} />}
      {showExitDialog && (
        <ExitConfirmDialog
          onConfirm={handleExitConfirm}
          onCancel={() => { setExitDialog(false); window.history.pushState({ cal: true }, ''); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT
───────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <LanguageProvider>
      <Inner />
    </LanguageProvider>
  );
}

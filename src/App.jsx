import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import LanguageSelector from './components/Settings/LanguageSelector';
import CameraView from './components/Camera/CameraView';
import DailySummary from './components/Dashboard/DailySummary';
import GoalWizard from './components/Dashboard/GoalWizard';
import EatingSpeedCoach from './components/Dashboard/EatingSpeedCoach';
import WeeklyReport from './components/Dashboard/WeeklyReport';
import WaterTracker from './components/Dashboard/WaterTracker';
import StepTracker from './components/Dashboard/StepTracker';
import StreakCard from './components/Dashboard/StreakCard';
import MacroPie from './components/Dashboard/MacroPie';
import CalorieTrend from './components/Dashboard/CalorieTrend';
import NutritionScore from './components/Dashboard/NutritionScore';
import BodyMeasurements from './components/Dashboard/BodyMeasurements';
import HistoryPage from './components/History/HistoryPage';
import { useMealReminders, getRemindersEnabled, setRemindersEnabled } from './hooks/useMealReminders';
import { getOrCreateUser, pushToCloud, pullFromCloud, isConfigured as firebaseConfigured } from './services/firebase';

/* ─────────────────────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────────────────────── */
function SettingsPage({ onClose }) {
  const { t } = useLanguage();
  const { getGoal, setGoal, getWaterGoal, setWaterGoal, clearAllData } = useLocalStorage();
  const { isDark, toggleTheme } = useTheme();
  const { enable: enableReminders, disable: disableReminders } = useMealReminders(t);
  const [goalInput, setGoalInput]           = useState(String(getGoal()));
  const [waterGoalInput, setWaterGoalInput] = useState(String(getWaterGoal()));
  const [confirmClear, setConfirmClear]     = useState(false);
  const [remindersOn, setRemindersOn]       = useState(getRemindersEnabled());
  const [notifStatus, setNotifStatus]       = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleSaveWaterGoal = () => {
    const n = parseInt(waterGoalInput, 10);
    if (!isNaN(n) && n >= 500 && n <= 5000) setWaterGoal(n);
  };

  const handleRequestNotif = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === 'granted') {
      new Notification('CalAndLens 🎉', { body: t('notifications.enabled'), icon: '/pwa-192x192.png' });
    }
  };

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

        {/* Karanlık mod */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700">{t('theme.toggle')}</p>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center text-xs ${isDark ? 'translate-x-6' : ''}`}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">{isDark ? t('theme.dark') : t('theme.light')}</p>
        </div>

        {/* Günlük su hedefi */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">💧 {t('water.title')}</p>
          <div className="flex gap-3">
            <input
              type="number" value={waterGoalInput} min="500" max="5000" step="100"
              onChange={e => setWaterGoalInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 outline-none text-lg font-bold"
            />
            <span className="flex items-center text-gray-500 font-medium">ml</span>
            <button onClick={handleSaveWaterGoal}
              className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* Push bildirimler */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 mb-3">🔔 {t('notifications.title')}</p>
          {notifStatus === 'granted' ? (
            <p className="text-sm text-emerald-600 font-semibold">{t('notifications.enabled')}</p>
          ) : notifStatus === 'denied' ? (
            <p className="text-sm text-red-500">{t('notifications.denied')}</p>
          ) : notifStatus === 'unsupported' ? (
            <p className="text-sm text-gray-400">{t('notifications.unsupported')}</p>
          ) : (
            <button onClick={handleRequestNotif}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
              🔔 {t('notifications.enable')}
            </button>
          )}
        </div>

        {/* Öğün hatırlatıcısı */}
        {notifStatus === 'granted' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700">🍽️ {t('reminders.title')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('reminders.subtitle')}</p>
              </div>
              <button
                onClick={async () => {
                  if (remindersOn) { disableReminders(); setRemindersOn(false); }
                  else { const p = await enableReminders(); if (p === 'granted') setRemindersOn(true); }
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${remindersOn ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${remindersOn ? 'translate-x-6' : ''}`}/>
              </button>
            </div>
            {remindersOn && <p className="text-xs text-emerald-600 font-semibold mt-2">{t('reminders.enabled')}</p>}
          </div>
        )}

        {/* Bulut Senkronizasyon */}
        {firebaseConfigured && <CloudSyncPanel />}

        <div className="text-center text-xs text-gray-300 py-2">CalAndLens v6.0</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CLOUD SYNC PANEL
───────────────────────────────────────────────────────────── */
function CloudSyncPanel() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle | syncing | done | error
  const [lastSync, setLastSync] = useState(() => localStorage.getItem('calandlens_last_sync'));
  const userRef = useRef(null);

  useEffect(() => {
    getOrCreateUser().then(u => { userRef.current = u; });
  }, []);

  const handlePush = async () => {
    setStatus('syncing');
    try {
      const user = userRef.current || await getOrCreateUser();
      await pushToCloud(user.uid);
      const ts = new Date().toLocaleTimeString();
      localStorage.setItem('calandlens_last_sync', ts);
      setLastSync(ts);
      setStatus('done');
    } catch { setStatus('error'); }
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handlePull = async () => {
    setStatus('syncing');
    try {
      const user = userRef.current || await getOrCreateUser();
      await pullFromCloud(user.uid);
      const ts = new Date().toLocaleTimeString();
      localStorage.setItem('calandlens_last_sync', ts);
      setLastSync(ts);
      setStatus('done');
      window.location.reload();
    } catch { setStatus('error'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-bold text-gray-700 mb-3">☁️ {t('sync.title')}</p>
      {lastSync && <p className="text-xs text-gray-400 mb-3">{t('sync.last')}: {lastSync}</p>}
      <div className="flex gap-2">
        <button onClick={handlePush} disabled={status === 'syncing'}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
          {status === 'syncing' ? '⏳' : status === 'done' ? '✓' : status === 'error' ? '✗' : '⬆️'} {t('sync.push')}
        </button>
        <button onClick={handlePull} disabled={status === 'syncing'}
          className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors">
          ⬇️ {t('sync.pull')}
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-2">{t('sync.desc')}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXIT CONFIRM DIALOG
───────────────────────────────────────────────────────────── */
function ExitConfirmDialog({ onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl p-6 text-center">
        <p className="text-3xl mb-3">👋</p>
        <p className="font-black text-gray-800 text-lg mb-1">{t('exit.title')}</p>
        <p className="text-sm text-gray-400 mb-6">{t('exit.subtitle')}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            {t('exit.no')}
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors">
            {t('exit.yes')}
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
const CHIPS = [
  { id: 'sec-summary', emoji: '📊', key: 'chips.summary' },
  { id: 'sec-streak',  emoji: '🔥', key: 'chips.streak'  },
  { id: 'sec-macro',   emoji: '🥧', key: 'chips.macro'   },
  { id: 'sec-water',   emoji: '💧', key: 'chips.water'   },
  { id: 'sec-steps',   emoji: '👟', key: 'chips.steps'   },
  { id: 'sec-speed',   emoji: '🍽️', key: 'chips.speed'  },
  { id: 'sec-report',  emoji: '📈', key: 'chips.report'  },
  { id: 'sec-trend',   emoji: '📉', key: 'chips.trend'   },
  { id: 'sec-score',   emoji: '⭐', key: 'chips.score'   },
  { id: 'sec-body',    emoji: '📏', key: 'chips.body'    },
];

function Inner() {
  const { t } = useLanguage();
  const { addMeal } = useLocalStorage();
  useMealReminders(t);

  const [tab,            setTab]        = useState('home');
  const [showWizard,     setWizard]     = useState(false);
  const [showSettings,   setSettings]   = useState(false);
  const [showExitDialog, setExitDialog] = useState(false);
  const [refresh,        setRefresh]    = useState(0);
  const [activeChip,     setActiveChip] = useState('sec-summary');
  const chipStripRef = useRef(null);
  const chipButtonRefs = useRef({});

  const handleMealAdded = useCallback((meal) => {
    addMeal(meal);
    setRefresh(r => r + 1);
  }, [addMeal]);

  /* Chip scroll — sayfayı kaydır + chip strip'te aktif chip'i ortala */
  const scrollToSection = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveChip(id);
    // Chip strip'i kaydırarak aktif chip'i ve bir sonrakini göster
    const btnEl  = chipButtonRefs.current[id];
    const stripEl = chipStripRef.current;
    if (btnEl && stripEl) {
      const target = btnEl.offsetLeft - 8;
      stripEl.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, []);

  /* IntersectionObserver — aktif chip takibi */
  useEffect(() => {
    if (tab !== 'home') return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveChip(e.target.id); });
      },
      { threshold: 0.3, rootMargin: '-90px 0px -45% 0px' }
    );
    CHIPS.forEach(c => { const el = document.getElementById(c.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [tab, refresh]);

  /* Sayfa en üste gelince "Özet"e dön */
  useEffect(() => {
    if (tab !== 'home') return;
    const onScroll = () => {
      if (window.scrollY < 80) setActiveChip('sec-summary');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tab]);

  /* activeChip değişince chip strip'i de kaydır */
  useEffect(() => {
    const btnEl   = chipButtonRefs.current[activeChip];
    const stripEl = chipStripRef.current;
    if (!btnEl || !stripEl) return;
    stripEl.scrollTo({ left: btnEl.offsetLeft - 8, behavior: 'smooth' });
  }, [activeChip]);

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
          <div className="flex items-center gap-2.5">
            {/* Logo — pill arka plan, beyaz C, L beyaz + ens altın */}
            <svg width="46" height="40" viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Frosted pill arka plan */}
              <rect x="0.5" y="0.5" width="45" height="39" rx="11" fill="white" fillOpacity="0.18"/>
              <rect x="0.5" y="0.5" width="45" height="39" rx="11" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
              {/* C — beyaz, kalın */}
              <path d="M 27 8 A 14 14 0 1 0 27 32"
                stroke="white" strokeWidth="5.5" strokeLinecap="round"/>
              {/* Lens — L beyaz büyük, ens altın */}
              <text fontFamily="system-ui,-apple-system,Arial,sans-serif" fontWeight="900">
                <tspan x="6" y="26" fontSize="20" fill="black">L</tspan>
                <tspan fontSize="11" dy="1.5" fill="#fde68a">ens</tspan>
              </text>
            </svg>
            {/* Brand text */}
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">
                <span className="text-white">Cal</span>
                <span className="text-teal-200">&amp;</span>
                <span className="text-white">Lens</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-0.5">{t('app.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

        {/* ── CHIP STRIP ── */}
        {tab === 'home' && (
          <div ref={chipStripRef} className="flex gap-2 overflow-x-auto scrollbar-hide pt-3 pb-0.5 -mx-1 px-1">
            {CHIPS.map(chip => (
              <button
                key={chip.id}
                ref={el => { chipButtonRefs.current[chip.id] = el; }}
                onClick={() => scrollToSection(chip.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  activeChip === chip.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'bg-white/20 text-white hover:bg-white/35'
                }`}
              >
                <span>{chip.emoji}</span>
                <span>{t(chip.key)}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="px-4 pt-4 pb-32">
        {tab === 'home' && (
          <div className="space-y-4">
            <div id="sec-summary" className="scroll-mt-36">
              <DailySummary key={refresh} onDeleteMeal={() => setRefresh(r => r + 1)} />
            </div>
            <div id="sec-streak" className="scroll-mt-36">
              <StreakCard key={refresh} />
            </div>
            <div id="sec-macro" className="scroll-mt-36">
              <MacroPie key={refresh} />
            </div>
            <div id="sec-water" className="scroll-mt-36">
              <WaterTracker key={refresh} />
            </div>
            <div id="sec-steps" className="scroll-mt-36">
              <StepTracker />
            </div>
            <div id="sec-speed" className="scroll-mt-36">
              <EatingSpeedCoach />
            </div>
            <div id="sec-report" className="scroll-mt-36">
              <WeeklyReport />
            </div>
            <div id="sec-trend" className="scroll-mt-36">
              <CalorieTrend />
            </div>
            <div id="sec-score" className="scroll-mt-36">
              <NutritionScore key={refresh} />
            </div>
            <div id="sec-body" className="scroll-mt-36">
              <BodyMeasurements />
            </div>
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
              <span className={`relative text-[11px] font-semibold ${tab === 'home' ? 'text-emerald-600' : 'text-gray-400'}`}>{t('tabs.home')}</span>
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

            {/* Right-mid: Speed */}
            <button
              onClick={() => {}}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"
            >
              <span className="text-2xl leading-none">⏱️</span>
              <span className="text-[11px] font-semibold">{t('tabs.speed')}</span>
            </button>

            {/* Right: Goal */}
            <button
              onClick={() => setWizard(true)}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"
            >
              <span className="text-2xl leading-none">🎯</span>
              <span className="text-[11px] font-semibold">{t('tabs.goal')}</span>
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
    <ThemeProvider>
      <LanguageProvider>
        <Inner />
      </LanguageProvider>
    </ThemeProvider>
  );
}

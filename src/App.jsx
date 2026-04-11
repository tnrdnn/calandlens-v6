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
import SmartTip from './components/Dashboard/SmartTip';
import { ALLERGENS } from './services/allergens';
import CalorieTrend from './components/Dashboard/CalorieTrend';
import NutritionScore from './components/Dashboard/NutritionScore';
import BodyMeasurements from './components/Dashboard/BodyMeasurements';
import FoodComparison from './components/Dashboard/FoodComparison';
import HistoryPage from './components/History/HistoryPage';
import { useMealReminders, getRemindersEnabled, setRemindersEnabled } from './hooks/useMealReminders';
import { useGoalNotifications, getGoalNotifsEnabled, setGoalNotifsEnabled } from './hooks/useGoalNotifications';
import { pushToCloud, pullFromCloud, isConfigured as supabaseConfigured } from './services/supabase';
import { AuthProvider, useAuth } from './hooks/useAuth';
import NotFound from './components/NotFound';
import AuthModal from './components/AuthModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import { usePWAInstall } from './hooks/usePWAInstall';
import DesktopLandingPage from './components/DesktopLandingPage';
import AdminDashboard from './components/AdminDashboard';
import PricingSection from './components/PricingSection';
import LandingT from './locales/landing';
import OnboardingQuiz from './components/OnboardingQuiz';
import GuestPrompt from './components/GuestPrompt';
import { trackVisit } from './services/analytics';

/* ─────────────────────────────────────────────────────────────
   SETTINGS PAGE
───────────────────────────────────────────────────────────── */
function SettingsPage({ onClose }) {
  const { t, lang } = useLanguage();
  const { user, signOut } = useAuth();
  const { getGoal, setGoal, getWaterGoal, setWaterGoal, clearAllData, getUserAllergens, setUserAllergens, getMacroGoals, setMacroGoals } = useLocalStorage();
  const [selectedAllergens, setSelectedAllergens] = useState(() => getUserAllergens());
  const { isDark, toggleTheme } = useTheme();
  const { isStandalone, isMobile } = usePWAInstall();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { enable: enableReminders, disable: disableReminders } = useMealReminders(t);
  const [goalInput, setGoalInput]           = useState(String(getGoal()));
  const [waterGoalInput, setWaterGoalInput] = useState(String(getWaterGoal()));
  const [confirmClear, setConfirmClear]     = useState(false);
  const [macroGoals, setMacroGoalsState]    = useState(() => getMacroGoals());
  const [remindersOn, setRemindersOn]       = useState(getRemindersEnabled());
  const [goalNotifsOn, setGoalNotifsOn]     = useState(getGoalNotifsEnabled());
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
    <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-900 max-w-md mx-auto flex flex-col">
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
        {/* Hesap */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">👤 {user.user_metadata?.full_name || user.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
              </div>
              <button onClick={() => signOut()}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-xl transition-colors">
                {t('auth.logout') || 'Çıkış'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">👤 {t('auth.loginTab')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('auth.guestNote') || 'Verilerini bulutta sakla'}</p>
              </div>
              <button onClick={() => setShowAuthModal(true)}
                className="text-xs text-emerald-600 font-bold border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-colors">
                {t('auth.loginTab')}
              </button>
            </div>
          )}
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

        {/* Karanlık mod */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('theme.toggle')}</p>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center text-xs ${isDark ? 'translate-x-6' : ''}`}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{isDark ? t('theme.dark') : t('theme.light')}</p>
        </div>

        {/* Günlük kalori hedefi */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">{t('settings.daily_goal')}</p>
          <div className="flex gap-3">
            <input
              type="number" value={goalInput} min="800" max="10000"
              onChange={e => setGoalInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-emerald-400 outline-none text-lg font-bold"
            />
            <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium">kcal</span>
            <button onClick={handleSaveGoal}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* Makro Hedefleri */}
        {(() => {
          const COLORS = { protein: '#3b82f6', carbs: '#f59e0b', fat: '#ef4444' };
          const KCAL   = { protein: 4, carbs: 4, fat: 9 };
          const dailyKcal = parseInt(goalInput, 10) || getGoal();
          const sum = macroGoals.protein + macroGoals.carbs + macroGoals.fat;
          const sumOk = sum === 100;

          const handleSlider = (key, val) => {
            const v = Math.max(5, Math.min(90, Number(val)));
            setMacroGoalsState(prev => ({ ...prev, [key]: v }));
          };
          const handleSaveMacro = () => {
            if (!sumOk) return;
            setMacroGoals(macroGoals);
          };
          const handleResetMacro = () => {
            const def = { protein: 25, carbs: 50, fat: 25 };
            setMacroGoalsState(def);
            setMacroGoals(def);
          };

          return (
            <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">🥧 {t('macro_goals.title')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{t('macro_goals.subtitle')}</p>

              {['protein','carbs','fat'].map(key => {
                const grams = Math.round((dailyKcal * macroGoals[key] / 100) / KCAL[key]);
                return (
                  <div key={key} className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold" style={{ color: COLORS[key] }}>
                        {t(`macro_goals.${key}`)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">{grams}g {t('macro_goals.gram_target')}</span>
                        <span className="text-sm font-black" style={{ color: COLORS[key] }}>
                          {macroGoals[key]}%
                        </span>
                      </div>
                    </div>
                    <input
                      type="range" min="5" max="90" step="1"
                      value={macroGoals[key]}
                      onChange={e => handleSlider(key, e.target.value)}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: COLORS[key] }}
                    />
                  </div>
                );
              })}

              {/* Sum indicator */}
              <div className={`flex items-center justify-between rounded-xl px-3 py-2 mb-3 ${sumOk ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{t('macro_goals.total')}</span>
                <span className={`text-sm font-black ${sumOk ? 'text-emerald-600' : 'text-red-500'}`}>
                  {sum}% {!sumOk && `— ${t('macro_goals.sum_error')}`}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={handleResetMacro}
                  className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 font-semibold rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {t('macro_goals.reset')}
                </button>
                <button onClick={handleSaveMacro} disabled={!sumOk}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-colors">
                  {t('macro_goals.save')}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Verileri temizle */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">{t('settings.clear_data')}</p>
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
                  className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-600 dark:text-gray-300">
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

        {/* Günlük su hedefi */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">💧 {t('water.title')}</p>
          <div className="flex gap-3">
            <input
              type="number" value={waterGoalInput} min="500" max="5000" step="100"
              onChange={e => setWaterGoalInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-400 outline-none text-lg font-bold"
            />
            <span className="flex items-center text-gray-500 dark:text-gray-400 font-medium">ml</span>
            <button onClick={handleSaveWaterGoal}
              className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors">
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* Push bildirimler */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">🔔 {t('notifications.title')}</p>
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
          <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">🍽️ {t('reminders.title')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('reminders.subtitle')}</p>
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

        {/* Hedef ilerleme bildirimi */}
        {notifStatus === 'granted' && (
          <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">🎯 {t('goal_notif.title')}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('goal_notif.subtitle')}</p>
              </div>
              <button
                onClick={() => {
                  const next = !goalNotifsOn;
                  setGoalNotifsEnabled(next);
                  setGoalNotifsOn(next);
                }}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${goalNotifsOn ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${goalNotifsOn ? 'translate-x-6' : ''}`}/>
              </button>
            </div>
            {goalNotifsOn && <p className="text-xs text-emerald-600 font-semibold mt-2">{t('goal_notif.enabled')}</p>}
          </div>
        )}

        {/* Alerjen Seçimi */}
        <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">⚠️ {t('allergen.settings_title')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t('allergen.settings_desc')}</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(a => {
              const active = selectedAllergens.includes(a.id);
              return (
                <button key={a.id}
                  onClick={() => {
                    const next = active
                      ? selectedAllergens.filter(id => id !== a.id)
                      : [...selectedAllergens, a.id];
                    setSelectedAllergens(next);
                    setUserAllergens(next);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                    active
                      ? 'border-transparent text-white'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
                  }`}
                  style={active ? { backgroundColor: a.color, borderColor: a.color } : {}}
                >
                  {a.emoji} {t(`allergen.${a.id}`)}
                </button>
              );
            })}
          </div>
          {selectedAllergens.length > 0 && (
            <p className="text-xs text-emerald-600 font-semibold mt-3">
              ✓ {selectedAllergens.length} {t('allergen.selected')}
            </p>
          )}
        </div>

        {/* Bulut Senkronizasyon */}
        {supabaseConfigured && <CloudSyncPanel />}

        {/* Masaüstü sürümü — sadece standalone modda veya mobilden göster */}
        {(isStandalone || isMobile) && (
          <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">🖥️ {t('pwa.desktop_btn')}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t('pwa.desktop_desc')}</p>
            <a
              href="https://calandlens.com/?mode=web"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 text-center border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
            >
              🌐 {t('pwa.desktop_btn')}
            </a>
          </div>
        )}

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
  const { user } = useAuth();
  const userId = user?.id || localStorage.getItem('calandlens_sync_user_id') || 'anon';

  const handlePush = async () => {
    setStatus('syncing');
    try {
      await pushToCloud(userId);
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
      await pullFromCloud(userId);
      const ts = new Date().toLocaleTimeString();
      localStorage.setItem('calandlens_last_sync', ts);
      setLastSync(ts);
      setStatus('done');
      window.location.reload();
    } catch { setStatus('error'); }
  };

  return (
    <div className="bg-emerald-50 dark:bg-gray-800 rounded-2xl border border-emerald-100 dark:border-gray-700 shadow-sm p-5">
      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">☁️ {t('sync.title')}</p>
      {lastSync && <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{t('sync.last')}: {lastSync}</p>}
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
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t('sync.desc')}</p>
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
  { id: 'sec-tip',     emoji: '💡', key: 'chips.tip'     },
  { id: 'sec-streak',  emoji: '🔥', key: 'chips.streak'  },
  { id: 'sec-macro',   emoji: '🥧', key: 'chips.macro'   },
  { id: 'sec-water',   emoji: '💧', key: 'chips.water'   },
  { id: 'sec-steps',   emoji: '👟', key: 'chips.steps'   },
  { id: 'sec-speed',   emoji: '🍽️', key: 'chips.speed'  },
  { id: 'sec-report',  emoji: '📈', key: 'chips.report'  },
  { id: 'sec-trend',   emoji: '📉', key: 'chips.trend'   },
  { id: 'sec-score',   emoji: '⭐', key: 'chips.score'   },
  { id: 'sec-body',    emoji: '📏', key: 'chips.body'    },
  { id: 'sec-compare', emoji: '⚖️', key: 'chips.compare' },
];

function Inner() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { addMeal, getDailyTotals, getGoal } = useLocalStorage();
  useMealReminders(t);
  const _totals = getDailyTotals(new Date());
  useGoalNotifications(_totals.calories, getGoal(), t);

  const [tab,             setTab]        = useState('home');
  const [showWizard,      setWizard]     = useState(false);
  const [showSettings,    setSettings]   = useState(false);
  const [showAuthModal,   setShowAuth]   = useState(false);
  const [showExitDialog,  setExitDialog] = useState(false);
  const [refresh,         setRefresh]    = useState(0);
  const [activeChip,      setActiveChip] = useState('sec-summary');
  const [showGuestPrompt, setGuestPrompt] = useState(false);
  const [showPricing,     setShowPricing] = useState(false);
  const chipStripRef = useRef(null);
  const chipButtonRefs = useRef({});

  const handleMealAdded = useCallback((meal) => {
    addMeal(meal);
    setRefresh(r => r + 1);
    // Guest prompt: show after 3rd scan, once only
    if (!localStorage.getItem('cal_guest_prompted')) {
      const count = parseInt(localStorage.getItem('cal_scan_count') || '0') + 1;
      localStorage.setItem('cal_scan_count', String(count));
      if (count >= 3) setGuestPrompt(true);
    }
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
          <a href="https://calandlens.com" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="CalAndLens" className="w-11 h-11 rounded-2xl object-cover shadow-md" />
            {false && <svg width="62" height="48" viewBox="0 0 62 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="cglow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <radialGradient id="cardShine" cx="35%" cy="25%" r="60%">
                  <stop offset="0%" stopColor="white" stopOpacity="0.28"/>
                  <stop offset="100%" stopColor="white" stopOpacity="0.04"/>
                </radialGradient>
                <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a7f3d0" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0"/>
                </radialGradient>
              </defs>

              {/* Frosted glass card */}
              <rect x="0.5" y="0.5" width="61" height="47" rx="13" fill="url(#cardShine)"/>
              <rect x="0.5" y="0.5" width="61" height="47" rx="13" stroke="white" strokeOpacity="0.22" strokeWidth="0.75"/>

              {/* C — center (21,24) r=13, opens right */}
              {/* Lens inner glow behind C */}
              <circle cx="21" cy="24" r="13" fill="url(#lensGlow)"/>
              {/* Lens rings (camera effect) */}
              <circle cx="21" cy="24" r="9"  stroke="white" strokeWidth="0.5" strokeOpacity="0.2"/>
              <circle cx="21" cy="24" r="5"  stroke="white" strokeWidth="0.5" strokeOpacity="0.18"/>
              {/* Scan ring — dashed */}
              <circle cx="21" cy="24" r="11" stroke="white" strokeWidth="0.6" strokeOpacity="0.15"
                strokeDasharray="2.5 2"/>

              {/* C arc — thick white with glow */}
              <path d="M 30 13 A 13 13 0 1 0 30 35"
                stroke="white" strokeWidth="4.5" strokeLinecap="round" filter="url(#cglow)"/>

              {/* Food icons inside C — belirgin */}
              {/* Avocado: oval + seed */}
              <ellipse cx="18" cy="21" rx="2.8" ry="3.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" fill="white" fillOpacity="0.1"/>
              <ellipse cx="18" cy="22.5" rx="1.2" ry="1.6" fill="white" fillOpacity="0.7"/>
              {/* Apple: circle + stem + leaf */}
              <circle cx="24" cy="27.5" r="2.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.9" fill="white" fillOpacity="0.1"/>
              <path d="M 24 24.7 Q 26 23 25.5 22" stroke="white" strokeWidth="1" strokeOpacity="0.9" strokeLinecap="round"/>
              <path d="M 24 24.7 Q 22.5 23.2 23 22.3" stroke="white" strokeWidth="0.8" strokeOpacity="0.7" strokeLinecap="round"/>
              {/* Leaf / greens */}
              <path d="M 14.5 27.5 Q 17.5 23 21 27 Q 17.5 30 14.5 27.5Z" stroke="white" strokeWidth="1" strokeOpacity="0.9" fill="white" fillOpacity="0.2"/>
              <path d="M 17.5 27 L 17.5 23.5" stroke="white" strokeWidth="0.7" strokeOpacity="0.7" strokeLinecap="round"/>

              {/* Light reflection on C */}
              <ellipse cx="25" cy="17" rx="2.5" ry="1.2" fill="white" fillOpacity="0.45" transform="rotate(-35 25 17)"/>

              {/* Lens text — L large white, ens mint, flowing from C tail */}
              <text fontFamily="system-ui,-apple-system,Arial,sans-serif" fontWeight="900" filter="url(#cglow)">
                <tspan x="31" y="40" fontSize="17" fill="white">L</tspan>
                <tspan fontSize="9.5" dy="-0.5" fill="white">ens</tspan>
              </text>

              {/* Connecting curve: C tail → L */}
              <path d="M 30 35 Q 31 37 33 38" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round"/>
            </svg>}
            {/* Brand text */}
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">
                <span className="text-white">Cal</span>
                <span className="text-teal-200">&amp;</span>
                <span className="text-white">Lens</span>
              </h1>
              <p className="text-xs text-emerald-100 mt-0.5">{t('app.subtitle')}</p>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={() => user ? setSettings(true) : setShowAuth(true)}
              className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              title={user ? (user.user_metadata?.full_name || user.email) : t('auth.loginTab')}
            >
              {user ? (
                <span className="text-white font-black text-sm">
                  {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                </span>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              )}
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
          {showAuthModal && <AuthModal onClose={() => setShowAuth(false)} />}
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
            <div id="sec-tip" className="scroll-mt-36">
              <SmartTip key={refresh} />
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
            <div id="sec-compare" className="scroll-mt-36">
              <FoodComparison />
            </div>

            {/* Store buttons */}
            <div className="flex flex-col gap-3 px-4 pb-6 pt-2">
              <div className="relative cursor-not-allowed">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-2xl shadow select-none">
                  <svg className="w-6 h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <p className="text-white font-bold text-sm">{t('storeIos')}</p>
                </div>
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full shadow">YAKINDA</span>
              </div>
              <div className="relative cursor-not-allowed">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 rounded-2xl shadow select-none">
                  <svg className="w-6 h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.18.96.03l11.65-6.57-2.52-2.52-10.09 9.06zM.35 1.5C.13 1.85 0 2.28 0 2.79v18.42c0 .51.13.94.35 1.29l.07.07 10.32-10.32v-.24L.42 1.43l-.07.07zM20.67 10.23l-2.8-1.58-2.83 2.83 2.83 2.83 2.82-1.6c.8-.45.8-1.19 0-1.48zM3.18.24L13.27 9.3l-2.52 2.52L-.78.27C-.47.1-.12.1.19.24l2.99-.0z"/></svg>
                  <p className="text-white font-bold text-sm">{t('storeAndroid')}</p>
                </div>
                <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full shadow">YAKINDA</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="px-2 pb-6">
              <button onClick={() => setShowPricing(true)}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-sm">
                💎 {(LandingT[lang] || LandingT['tr']).pricing.plans[1].cta}
              </button>
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
              onClick={() => scrollToSection('sec-speed')}
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
      <PWAInstallBanner />
      {showGuestPrompt && <GuestPrompt onClose={() => setGuestPrompt(false)} />}
      {showWizard    && <GoalWizard   onClose={() => setWizard(false)} />}
      {showSettings  && <SettingsPage onClose={() => setSettings(false)} />}
      {showPricing && (
        <div className="fixed inset-0 z-50 bg-gray-950 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gray-950 px-4 py-3 flex items-center gap-3 border-b border-gray-800">
            <button onClick={() => setShowPricing(false)} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <p className="text-white font-black">💎 Planlar</p>
          </div>
          <PricingSection
            strings={(LandingT[lang] || LandingT['tr']).pricing}
            dark={true}
            onCta={() => {}}
          />
        </div>
      )}
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
const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const forceWeb = new URLSearchParams(window.location.search).get('mode') === 'web';
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'calandlens2025';

// Ziyareti kaydet (günde bir kez)
trackVisit();

function MobileApp() {
  const [onboarded, setOnboarded] = useState(
    () => !!localStorage.getItem('cal_onboarded')
  );

  if (!onboarded) {
    return (
      <OnboardingQuiz
        onComplete={() => {
          localStorage.setItem('cal_onboarded', '1');
          setOnboarded(true);
        }}
      />
    );
  }

  return <Inner />;
}

export default function App() {
  const validPaths = ['/', ''];
  if (!validPaths.includes(window.location.pathname)) {
    return <NotFound />;
  }
  if (isAdmin) {
    return <AdminDashboard />;
  }
  if (!isMobileDevice || forceWeb) {
    return <DesktopLandingPage />;
  }
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MobileApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import T, { detectLang } from '../locales/landing';
import OnboardingQuiz from './OnboardingQuiz';
import PricingSection from './PricingSection';
import { resetPassword, updatePassword, supabase } from '../services/supabase';

const SITE_URL = 'https://calandlens.com';
const lang = detectLang();
const t = T[lang];

// ── Unsplash photos (food / health themed) ───────────────────────────────────
const PHOTOS = {
  hero:    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80',
  ai:      'https://images.unsplash.com/photo-1547592180-85f173990554?w=900&q=80',
  macro:   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80',
  water:   'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=900&q=80',
  history: 'https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=900&q=80',
  steps:   'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&q=80',
};

const NAV_LINKS = [
  { href: '#features',    label: t.nav.features },
  { href: '#how-it-works',label: t.nav.howItWorks },
  { href: '#testimonials',label: t.nav.reviews },
  { href: '#pricing',     label: t.pricing.nav },
  { href: '#install',     label: t.nav.download },
  { href: '#about',       label: t.nav.about },
];

const STATS = t.stats;

const PHOTOS_MAP = [PHOTOS.ai, PHOTOS.macro, PHOTOS.history, PHOTOS.water, PHOTOS.steps, null];
const FEATURES = t.features.map((f, i) => ({ ...f, photo: PHOTOS_MAP[i] }));

const TESTIMONIALS = [
  { initials: 'AK', color: 'bg-purple-500', name: 'Ayşe K.', role: 'Diyetisyen', stars: 5,
    text: '2 ayda 8 kilo verdim. AI analizi inanılmaz doğru, artık her şeyi manuel girmiyorum. Hastalarıma da öneriyorum.' },
  { initials: 'MO', color: 'bg-blue-500',   name: 'Mehmet O.', role: 'Spor Koçu', stars: 5,
    text: 'Makro takibi için kullandığım en iyi uygulama. Protein hedefimi artık hiç kaçırmıyorum.' },
  { initials: 'ZY', color: 'bg-rose-500',   name: 'Zeynep Y.', role: 'Öğretmen', stars: 4,
    text: 'Yemek fotoğrafı çekiyorsun, kalorisi geliyor. Bu kadar basit. 3 aydır kullanıyorum, 5 kilo verdim.' },
  { initials: 'BS', color: 'bg-amber-500',  name: 'Burak S.', role: 'Mühendis', stars: 5,
    text: 'Türkçe yemekleri de tanıyor! Mercimek çorbası, köfte, dolma — hepsini biliyor. Etkileyici.' },
];

// ── Auth helpers ─────────────────────────────────────────────────────────────
function getUsers() { try { return JSON.parse(localStorage.getItem('cal_users') || '[]'); } catch { return []; } }
function saveUsers(u) { localStorage.setItem('cal_users', JSON.stringify(u)); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('cal_current_user') || 'null'); } catch { return null; } }
function setCurrentUser(u) { u ? localStorage.setItem('cal_current_user', JSON.stringify(u)) : localStorage.removeItem('cal_current_user'); }

// ── Text Modal (Privacy / Terms) ──────────────────────────────────────────────
// ── Set New Password Modal (şifre sıfırlama linki ile gelindiğinde) ───────────
function SetPasswordModal({ onClose }) {
  const at = T[detectLang()].auth;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError(at.errShort);
    if (password !== confirm) return setError('Şifreler eşleşmiyor.');
    try {
      await updatePassword(password);
      setDone(true);
      // URL hash'i temizle
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔑</div>
        {done ? (
          <>
            <h3 className="text-xl font-black mb-2">Şifre güncellendi!</h3>
            <p className="text-gray-500 text-sm mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
            <button onClick={onClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors">
              Tamam
            </button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-black mb-2">Yeni Şifre Belirle</h3>
            <p className="text-gray-500 text-sm mb-6">En az 6 karakter olmalı.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Yeni Şifre</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Şifre Tekrar</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  placeholder="Şifreyi tekrar girin"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
              <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors">
                Şifreyi Güncelle
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function TextModal({ title, content, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h3 className="text-lg font-black">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="overflow-y-auto px-8 py-6 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <p key={i} className="font-bold text-gray-900 mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>;
            }
            return <p key={i} className={line === '' ? 'mt-2' : ''}>{line}</p>;
          })}
        </div>
        <div className="px-8 py-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors">Kapat</button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onSuccess }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const users = getUsers();
    const at = t.auth;
    if (tab === 'register') {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return setError(at.errFill);
      if (form.password.length < 6) return setError(at.errShort);
      if (users.find(u => u.email === form.email.toLowerCase())) return setError(at.errExists);
      const newUser = { id: Date.now(), name: form.name.trim(), email: form.email.toLowerCase() };
      saveUsers([...users, { ...newUser, password: btoa(form.password) }]);
      setCurrentUser(newUser);
      onSuccess(newUser);
    } else {
      if (!form.email.trim() || !form.password.trim()) return setError(at.errFill);
      const found = users.find(u => u.email === form.email.toLowerCase() && u.password === btoa(form.password));
      if (!found) return setError(at.errWrong);
      const user = { id: found.id, name: found.name, email: found.email };
      setCurrentUser(user);
      onSuccess(user);
    }
  };

  const at = t.auth;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch {
      setError(at.errWrong);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 ${t.rtl ? 'text-right' : ''}`} dir={t.rtl ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>

      {showReset ? (
        <>
          <button onClick={onClose} className={`absolute top-5 ${t.rtl ? 'left-5' : 'right-5'} text-gray-400 hover:text-gray-700 text-xl`}>✕</button>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">🔑</div>
          <h3 className="text-xl font-black text-center mb-2">{at.resetTitle}</h3>
          <p className="text-gray-500 text-sm text-center mb-6">{at.resetSub}</p>
          {resetSent ? (
            <p className="text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 text-sm text-center font-semibold">{at.resetSent}</p>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required
                placeholder={at.emailPh}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
              <button type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors">{at.resetBtn}</button>
            </form>
          )}
          <button onClick={() => { setShowReset(false); setResetSent(false); setError(''); }} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4">{at.resetBack}</button>
        </>
      ) : (
        <>
        <button onClick={onClose} className={`absolute top-5 ${t.rtl ? 'left-5' : 'right-5'} text-gray-400 hover:text-gray-700 text-xl`}>✕</button>
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          {['login', 'register'].map(tab_ => (
            <button key={tab_} onClick={() => { setTab(tab_); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === tab_ ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              {tab_ === 'login' ? at.loginTab : at.registerTab}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{at.name}</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder={at.namePh}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{at.email}</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder={at.emailPh}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{at.password}</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder={tab === 'register' ? at.passwordPhNew : at.passwordPh}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button type="submit"
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors mt-2">
            {tab === 'login' ? at.loginBtn : at.registerBtn}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          {tab === 'login'
            ? <><span>{at.toRegister} </span><button onClick={() => setTab('register')} className="text-emerald-600 font-semibold">{at.registerLink}</button></>
            : <><span>{at.toLogin} </span><button onClick={() => setTab('login')} className="text-emerald-600 font-semibold">{at.loginLink}</button></>
          }
        </p>
        {tab === 'login' && (
          <p className="text-center mt-2">
            <button onClick={() => { setShowReset(true); setError(''); }} className="text-xs text-gray-400 hover:text-emerald-600 transition-colors">{at.forgot}</button>
          </p>
        )}
        </>
      )}
      </div>
    </div>
  );
}

// ── Mockup Carousel ───────────────────────────────────────────────────────────
function MockupCarousel({ slides }) {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.round(ref.current.scrollLeft / ref.current.offsetWidth);
    setActive(Math.min(idx, slides.length - 1));
  };
  const goTo = (i) => {
    ref.current?.scrollTo({ left: i * ref.current.offsetWidth, behavior: 'smooth' });
  };
  return (
    <div className="w-full flex flex-col items-center">
      <div ref={ref} onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {slides.map((slide, i) => (
          <div key={i} className="snap-center flex-shrink-0 w-full flex justify-center px-4">
            {slide}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-emerald-500 w-6' : 'bg-gray-300 w-2'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Phone Mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative w-[220px] sm:w-[250px] h-[440px] sm:h-[500px] bg-gray-900 rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 border-gray-800 overflow-hidden mx-auto flex-shrink-0">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 to-teal-600 flex flex-col items-center justify-center gap-3 p-5">
        <img src="/logo.png" alt="CalAndLens" className="w-14 h-14 rounded-2xl object-cover" />
        <p className="text-white font-black text-lg">CalAndLens</p>
        <div className="w-full bg-white/20 rounded-2xl p-4 backdrop-blur">
          <p className="text-white text-xs font-semibold mb-1">Bugünkü Kalori</p>
          <div className="flex items-end gap-1 mb-2">
            <p className="text-white text-2xl font-black">1,840</p>
            <p className="text-emerald-200 text-xs mb-0.5">/ 2,000 kcal</p>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1.5">
            <div className="bg-white rounded-full h-1.5" style={{ width: '92%' }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full">
          {[['💪','Protein','142g'],['🍚','Karb','195g'],['🥑','Yağ','68g']].map(([e,l,v]) => (
            <div key={l} className="bg-white/20 rounded-xl p-2 text-center backdrop-blur">
              <p className="text-base">{e}</p>
              <p className="text-white text-xs font-bold">{v}</p>
              <p className="text-emerald-200 text-xs">{l}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-white/20 rounded-2xl p-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="text-xl">📸</span>
            <div>
              <p className="text-white text-xs font-bold">AI Analiz</p>
              <p className="text-emerald-200 text-xs">Fotoğraf çek → kalori hesapla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({ f }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow group">
      {f.photo ? (
        <div className="h-44 overflow-hidden relative">
          <img src={f.photo} alt={f.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 rounded-2xl flex items-center justify-center text-xl shadow">
            {f.icon}
          </div>
          {f.badge && (
            <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-black
              ${f.badge === 'YAKINDA' ? 'bg-gray-700/80 text-white' : 'bg-amber-400 text-amber-900'}`}>
              {f.badge}
            </span>
          )}
        </div>
      ) : (
        <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <span className="text-7xl opacity-30">{f.icon}</span>
          {f.badge && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700/80 text-white rounded-lg text-xs font-black">
              {f.badge}
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        <h3 className="font-black text-gray-900 mb-2">{f.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function QRModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
        <h3 className="text-xl font-black mb-2">{t.qr.title}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {t.qr.sub.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>
        <div className="bg-gray-50 rounded-2xl p-5 inline-block mb-6">
          <QRCodeSVG value={SITE_URL} size={160} level="H" includeMargin={false} />
        </div>
        <p className="text-xs text-gray-400 mb-6 font-medium">calandlens.com</p>
        <button onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors">
          {t.qr.close}
        </button>
      </div>
    </div>
  );
}

export default function DesktopLandingPage() {
  const [authModal, setAuthModal] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [user, setUser] = useState(() => getCurrentUser());

  // Supabase şifre sıfırlama event'ini dinle
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowSetPassword(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const cameFromApp = new URLSearchParams(window.location.search).get('mode') === 'web';
  const openApp = () => setShowQR(true);
  const openQuiz = () => setShowQuiz(true);
  const handleQuizComplete = () => { setShowQuiz(false); setAuthModal('register'); };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" dir={t.rtl ? 'rtl' : 'ltr'}>

      {/* ── APP BANNER (sadece ?mode=web ile gelindiğinde) ── */}
      {cameFromApp && (
        <div className="bg-emerald-600 text-white px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">📱</span>
            <p className="text-sm font-medium">
              {t.banner.text}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="#install"
              className="px-4 py-1.5 bg-white text-emerald-700 font-bold rounded-lg text-sm hover:bg-emerald-50 transition-colors">
              {t.banner.howTo}
            </a>
            <a href="/"
              className="text-emerald-200 hover:text-white text-sm transition-colors">
              {t.banner.home}
            </a>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="CalAndLens" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-xl font-black text-emerald-600">CalAndLens</span>
          </a>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className="text-sm text-gray-500 hover:text-emerald-600 font-medium transition-colors">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button onClick={openApp}
                  className="hidden sm:block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors">
                  Uygulamayı Aç →
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-xs">
                    {user.name.slice(0,2).toUpperCase()}
                  </div>
                  <button onClick={() => { setCurrentUser(null); setUser(null); }}
                    className="hidden sm:block text-gray-400 hover:text-red-500 text-xs transition-colors">{t.nav.logout}</button>
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setAuthModal('login')}
                  className="hidden sm:block text-sm text-gray-600 hover:text-emerald-600 font-semibold px-2 py-1 transition-colors">
                  {t.nav.login}
                </button>
                <button onClick={openQuiz}
                  className="px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors">
                  {t.nav.start}
                </button>
              </>
            )}
            {/* Hamburger — mobile only */}
            <button onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden ml-1 p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              {mobileMenuOpen
                ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
              }
            </button>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-emerald-600 font-medium py-2.5 border-b border-gray-50 transition-colors">{l.label}</a>
            ))}
            {user
              ? <button onClick={() => { setCurrentUser(null); setUser(null); setMobileMenuOpen(false); }}
                  className="text-sm text-red-500 font-medium py-2.5 text-left">{t.nav.logout}</button>
              : <button onClick={() => { setAuthModal('login'); setMobileMenuOpen(false); }}
                  className="text-sm text-emerald-600 font-bold py-2.5 text-left">{t.nav.login}</button>
            }
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* background image */}
        <div className="absolute inset-0 z-0">
          <img src={PHOTOS.hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/30" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-sm font-semibold mb-6">
              <span>✨</span> {t.hero.badge}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
              {t.hero.h1a}<br />
              <span className="text-emerald-500">{t.hero.h1b}</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-xl">{t.hero.sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={openQuiz}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl transition-colors shadow-lg shadow-emerald-200">
                {t.hero.cta1}
              </button>
              <button onClick={openApp}
                className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 font-semibold text-lg rounded-2xl transition-colors">
                {t.hero.cta2}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">{t.hero.note}</p>
          </div>
          {/* Store buttons — between text and mockup, visible on lg+ */}
          <div className="hidden lg:flex flex-col gap-3 justify-center flex-shrink-0">
            <div className="relative cursor-not-allowed">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-2xl shadow-lg select-none w-44">
                <svg className="w-6 h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{t.hero.storeIos}</p>
                </div>
              </div>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full shadow">YAKINDA</span>
            </div>
            <div className="relative cursor-not-allowed">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 rounded-2xl shadow-lg select-none w-44">
                <svg className="w-6 h-6 text-white flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.18.96.03l11.65-6.57-2.52-2.52-10.09 9.06zM.35 1.5C.13 1.85 0 2.28 0 2.79v18.42c0 .51.13.94.35 1.29l.07.07 10.32-10.32v-.24L.42 1.43l-.07.07zM20.67 10.23l-2.8-1.58-2.83 2.83 2.83 2.83 2.82-1.6c.8-.45.8-1.19 0-1.48zM3.18.24L13.27 9.3l-2.52 2.52L-.78.27C-.47.1-.12.1.19.24l2.99-.0z"/></svg>
                <div>
                  <p className="text-white font-bold text-sm leading-none">{t.hero.storeAndroid}</p>
                </div>
              </div>
              <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-xs font-black px-2 py-0.5 rounded-full shadow">YAKINDA</span>
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="bg-emerald-500">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-emerald-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gray-50 py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-emerald-600 font-semibold mb-3">{t.featuresSection.label}</p>
          <h2 className="text-4xl font-black text-center mb-4">{t.featuresSection.title}</h2>
          <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto">{t.featuresSection.sub}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => <FeatureCard key={f.title} f={f} />)}
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW 1: Ana Ekran ── */}
      <section className="py-12 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-emerald-600 font-semibold mb-3">{t.preview1.label}</p>
            <h2 className="text-4xl font-black mb-6">{t.preview1.title.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{t.preview1.sub}</p>
            <div className="space-y-3">
              {t.preview1.bullets.map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Phone mockups — desktop: yan yana, mobile: carousel */}
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            {/* Desktop: yan yana */}
            <div className="hidden lg:flex gap-4 items-end">
            {/* Main phone */}
            <div className="w-[220px] h-[440px] bg-gray-900 rounded-[36px] border-4 border-gray-800 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
              <div className="absolute inset-0 bg-white flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-white text-xs opacity-80">Hoş geldin 👋</p>
                      <p className="text-white font-black text-sm">Günlük Özet</p>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">⚙️</div>
                  </div>
                  {/* Calorie ring */}
                  <div className="flex items-center justify-center py-2">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="white" strokeOpacity="0.2" strokeWidth="8" fill="none"/>
                        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8" fill="none"
                          strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-white font-black text-lg leading-none">1,840</p>
                        <p className="text-emerald-100 text-xs">kcal</p>
                      </div>
                    </div>
                    <div className="ml-4 space-y-1">
                      <div><p className="text-white text-xs opacity-70">Hedef</p><p className="text-white font-bold text-sm">2,000</p></div>
                      <div><p className="text-white text-xs opacity-70">Kalan</p><p className="text-white font-bold text-sm">160</p></div>
                    </div>
                  </div>
                </div>
                {/* Macros */}
                <div className="grid grid-cols-3 gap-2 px-3 py-2">
                  {[['💪','142g','Protein','bg-blue-50 text-blue-600'],['🍚','195g','Karb','bg-yellow-50 text-yellow-600'],['🥑','68g','Yağ','bg-orange-50 text-orange-600']].map(([e,v,l,cls]) => (
                    <div key={l} className={`${cls} rounded-xl p-2 text-center`}>
                      <p className="text-base">{e}</p>
                      <p className="font-black text-xs">{v}</p>
                      <p className="text-xs opacity-70">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Meals */}
                <div className="flex-1 px-3 space-y-2 overflow-hidden">
                  {[['☀️','Kahvaltı','480 kcal'],['🌤️','Öğle','620 kcal'],['🌙','Akşam','740 kcal']].map(([e,l,v]) => (
                    <div key={l} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{e}</span>
                        <span className="text-xs font-semibold text-gray-700">{l}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">{v}</span>
                    </div>
                  ))}
                </div>
                {/* Tab bar */}
                <div className="bg-white border-t border-gray-100 flex justify-around py-2 px-2">
                  {[['🏠','Ana'],['📷','Kamera'],['📊','Özet'],['📅','Geçmiş']].map(([e,l]) => (
                    <div key={l} className="flex flex-col items-center gap-0.5">
                      <span className="text-sm">{e}</span>
                      <span className="text-xs text-gray-400">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Second phone (offset) */}
            <div className="w-[180px] h-[360px] bg-gray-900 rounded-[30px] border-4 border-gray-800 overflow-hidden shadow-xl relative mb-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-900 rounded-b-lg z-10" />
              <div className="absolute inset-0 bg-white flex flex-col">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 pt-5 pb-3">
                  <p className="text-white font-black text-xs mb-2">💧 Su Takibi</p>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({length:8}).map((_,i) => (
                      <span key={i} className={`text-sm ${i<6?'opacity-100':'opacity-30'}`}>💧</span>
                    ))}
                  </div>
                  <p className="text-emerald-100 text-xs mt-1">6 / 8 bardak</p>
                </div>
                <div className="flex-1 p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-700">🏃 Adım Sayacı</p>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-lg font-black text-emerald-600">6,820</p>
                    <p className="text-xs text-gray-400">/ 10,000 adım</p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{width:'68%'}}/>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-700 pt-1">📅 Bu Hafta</p>
                  <div className="flex gap-1 items-end">
                    {[60,80,45,90,70,85,68].map((h,i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className="w-full bg-emerald-400 rounded-sm" style={{height:`${h*0.3}px`}}/>
                        <span className="text-xs text-gray-400">{['P','S','Ç','P','C','C','P'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>{/* closes hidden lg:flex */}
            {/* Mobile: carousel */}
            <div className="lg:hidden">
              <MockupCarousel slides={[
                <div className="w-[220px] h-[440px] bg-gray-900 rounded-[36px] border-4 border-gray-800 overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
                  <div className="absolute inset-0 bg-white flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pt-6 pb-3 text-center">
                      <p className="text-white font-black text-sm">🏠 Ana Ekran</p>
                      <p className="text-emerald-100 text-xs">Günlük Özet</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-4">
                      <div className="relative w-24 h-24">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#d1fae5" strokeWidth="8" fill="none"/>
                          <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="font-black text-lg leading-none">1,840</p>
                          <p className="text-xs text-gray-400">kcal</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {[['💪','142g','Protein','bg-blue-50'],['🍚','195g','Karb','bg-yellow-50'],['🥑','68g','Yağ','bg-orange-50']].map(([e,v,l,cls]) => (
                          <div key={l} className={`${cls} rounded-xl p-2 text-center`}>
                            <p className="text-sm">{e}</p>
                            <p className="font-black text-xs">{v}</p>
                            <p className="text-xs text-gray-400">{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>,
                <div className="w-[220px] h-[440px] bg-gray-900 rounded-[36px] border-4 border-gray-800 overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
                  <div className="absolute inset-0 bg-white flex flex-col">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 pt-5 pb-3">
                      <p className="text-white font-black text-xs mb-2">💧 Su Takibi</p>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({length:8}).map((_,i) => (
                          <span key={i} className={`text-sm ${i<6?'opacity-100':'opacity-30'}`}>💧</span>
                        ))}
                      </div>
                      <p className="text-emerald-100 text-xs mt-1">6 / 8 bardak</p>
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                      <p className="text-xs font-bold text-gray-700">🏃 Adım Sayacı</p>
                      <div className="bg-gray-50 rounded-xl p-2">
                        <p className="text-lg font-black text-emerald-600">6,820</p>
                        <p className="text-xs text-gray-400">/ 10,000 adım</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{width:'68%'}}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ]} />
            </div>
          </div>{/* closes w-full lg:w-auto wrapper */}
        </div>
      </section>

      {/* ── APP PREVIEW 2: AI Kamera ── */}
      <section className="py-12 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-amber-500 font-semibold mb-3">{t.preview2.label}</p>
            <h2 className="text-4xl font-black mb-6">{t.preview2.title.split('\n').map((line, i) => <span key={i}>{line}{i < t.preview2.title.split('\n').length - 1 && <br />}</span>)}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{t.preview2.sub}</p>
            <div className="space-y-3">
              {t.preview2.bullets.map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex-shrink-0 flex gap-4 items-center mx-auto lg:mx-0">
            <div className="w-[220px] h-[440px] bg-gray-900 rounded-[36px] border-4 border-gray-800 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
              <div className="absolute inset-0 flex flex-col">
                {/* Camera view simulation */}
                <div className="flex-1 bg-gray-800 relative">
                  <img src={PHOTOS.ai} alt="yemek" className="w-full h-full object-cover opacity-80" />
                  {/* Scan frame */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 relative">
                      {['tl','tr','bl','br'].map(c => (
                        <div key={c} className={`absolute w-6 h-6 border-emerald-400
                          ${c==='tl'?'top-0 left-0 border-t-3 border-l-3 rounded-tl-lg':''}
                          ${c==='tr'?'top-0 right-0 border-t-3 border-r-3 rounded-tr-lg':''}
                          ${c==='bl'?'bottom-0 left-0 border-b-3 border-l-3 rounded-bl-lg':''}
                          ${c==='br'?'bottom-0 right-0 border-b-3 border-r-3 rounded-br-lg':''}`}
                          style={{borderWidth: c.includes('t') ? '3px 0 0' : '0 0 3px', borderLeftWidth: c.includes('l') ? '3px' : '0', borderRightWidth: c.includes('r') ? '3px' : '0'}}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-white text-xs bg-black/50 px-3 py-1 rounded-full">🤖 Analiz ediliyor...</span>
                  </div>
                </div>
                {/* Result panel */}
                <div className="bg-white px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-base">🍛</div>
                    <div>
                      <p className="font-black text-gray-800 text-xs">Kuru Fasulye + Pilav</p>
                      <p className="text-xs text-emerald-600">✓ Tanındı · %94 güven</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[['🔥','480','kcal','bg-orange-50'],['💪','22g','Prot.','bg-blue-50'],['🍚','72g','Karb','bg-yellow-50'],['🥑','8g','Yağ','bg-red-50']].map(([e,v,l,cls]) => (
                      <div key={l} className={`${cls} rounded-lg p-1.5 text-center`}>
                        <p className="text-xs">{e}</p>
                        <p className="font-black text-xs leading-none">{v}</p>
                        <p className="text-xs text-gray-400">{l}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-2 py-2 bg-emerald-500 text-white font-black text-xs rounded-xl">
                    + Öğüne Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP PREVIEW 3: Geçmiş & İstatistik ── */}
      <section className="py-12 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-purple-600 font-semibold mb-3">{t.preview3.label}</p>
            <h2 className="text-4xl font-black mb-6">{t.preview3.title.split('\n').map((line, i) => <span key={i}>{line}{i < t.preview3.title.split('\n').length - 1 && <br />}</span>)}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{t.preview3.sub}</p>
            <div className="space-y-3">
              {t.preview3.bullets.map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Phone mockup */}
          <div className="flex-shrink-0 flex gap-4 items-end mx-auto lg:mx-0">
            <div className="w-[220px] h-[440px] bg-gray-900 rounded-[36px] border-4 border-gray-800 overflow-hidden shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-10" />
              <div className="absolute inset-0 bg-white flex flex-col">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-4 pt-6 pb-3">
                  <p className="text-white font-black text-sm">📅 Geçmiş</p>
                  <p className="text-purple-100 text-xs mt-0.5">Nisan 2026</p>
                </div>
                {/* Calendar */}
                <div className="px-3 py-2">
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Pt','Sa','Ça','Pe','Cu','Ct','Pz'].map(d => (
                      <p key={d} className="text-center text-xs text-gray-400 font-semibold">{d}</p>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      {d:'',c:''},{d:'1',c:'bg-emerald-100'},{d:'2',c:'bg-emerald-400 text-white'},{d:'3',c:'bg-emerald-400 text-white'},{d:'4',c:'bg-red-100'},{d:'5',c:'bg-emerald-400 text-white'},{d:'6',c:'bg-emerald-400 text-white'},
                      {d:'7',c:'bg-emerald-400 text-white'},{d:'8',c:'bg-yellow-100'},{d:'9',c:'bg-emerald-400 text-white'},{d:'10',c:'bg-emerald-400 text-white'},{d:'11',c:'bg-emerald-400 text-white'},{d:'12',c:'bg-emerald-100'},{d:'13',c:'bg-emerald-400 text-white'},
                      {d:'14',c:'bg-emerald-400 text-white'},{d:'15',c:'bg-red-100'},{d:'16',c:'bg-emerald-400 text-white'},{d:'17',c:'bg-emerald-400 text-white'},{d:'18',c:'bg-emerald-400 text-white'},{d:'19',c:'bg-yellow-100'},{d:'20',c:'bg-emerald-400 text-white'},
                      {d:'21',c:'bg-emerald-400 text-white'},{d:'22',c:'bg-emerald-400 text-white'},{d:'23',c:'bg-emerald-400 text-white'},{d:'24',c:'bg-emerald-400 text-white'},{d:'25',c:'bg-gray-100 ring-2 ring-emerald-500'},{d:'26',c:'bg-gray-50'},{d:'27',c:'bg-gray-50'},
                    ].map((item, i) => (
                      <div key={i} className={`${item.c} rounded-lg h-7 flex items-center justify-center`}>
                        <span className="text-xs font-semibold">{item.d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Streak */}
                <div className="mx-3 bg-orange-50 rounded-xl p-2.5 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-orange-700">🔥 Seri: 12 Gün</p>
                      <p className="text-xs text-orange-400">Sonraki: 15 gün rozeti</p>
                    </div>
                    <span className="text-2xl">🏅</span>
                  </div>
                </div>
                {/* Mini chart */}
                <div className="mx-3 flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-1">📈 Bu Hafta</p>
                  <div className="flex gap-1 items-end h-12">
                    {[1650,1920,1400,2100,1800,1950,1840].map((v,i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={`w-full rounded-sm ${v > 2000 ? 'bg-red-400' : 'bg-emerald-400'}`}
                          style={{height:`${(v/2100)*40}px`}}/>
                        <span className="text-xs text-gray-300">{['P','S','Ç','P','C','C','P'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Tab bar */}
                <div className="bg-white border-t border-gray-100 flex justify-around py-2 px-2 mt-1">
                  {[['🏠','Ana'],['📷','Kamera'],['📊','Özet'],['📅','Geçmiş']].map(([e,l]) => (
                    <div key={l} className={`flex flex-col items-center gap-0.5 ${l==='Geçmiş'?'opacity-100':'opacity-40'}`}>
                      <span className="text-sm">{e}</span>
                      <span className="text-xs text-gray-400">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI SPOTLIGHT ── */}
      <section className="py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Photo */}
          <div className="flex-shrink-0 w-full lg:w-[480px] h-[340px] rounded-3xl overflow-hidden shadow-xl relative">
            <img src={PHOTOS.ai} alt="AI Analiz" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/95 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🍛</div>
                <div className="flex-1">
                  <p className="font-black text-gray-800">Kuru Fasulye + Pilav</p>
                  <p className="text-xs text-gray-500">AI tarafından tanındı · 2.3 sn</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600 text-lg">480</p>
                  <p className="text-xs text-gray-400">kcal</p>
                </div>
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-sm font-semibold mb-6">
              <span>🤖</span> {t.aiSpotlight.badge}
            </div>
            <h2 className="text-4xl font-black mb-6">{t.aiSpotlight.title.split('\n').map((line, i) => <span key={i}>{line}{i < t.aiSpotlight.title.split('\n').length - 1 && <br />}</span>)}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{t.aiSpotlight.sub}</p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {t.aiSpotlight.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WATER + STEPS ── */}
      <section className="bg-gray-50 py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-emerald-600 font-semibold mb-3">{t.healthSection.label}</p>
          <h2 className="text-4xl font-black text-center mb-14">{t.healthSection.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Water */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white group">
              <div className="h-56 overflow-hidden relative">
                <img src={PHOTOS.water} alt="Su Takibi" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 bg-blue-500/80 backdrop-blur text-white text-xs font-bold rounded-full">{t.healthSection.water.badge}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black text-xl mb-2">{t.healthSection.water.title}</h3>
                <p className="text-gray-500 leading-relaxed">{t.healthSection.water.sub}</p>
                <div className="mt-4 flex gap-2">
                  {['💧','💧','💧','💧','💧','💧','💧','⬜'].map((e, i) => (
                    <span key={i} className="text-xl">{e}</span>
                  ))}
                  <span className="text-sm text-gray-400 ml-1 self-center">7/8 bardak</span>
                </div>
              </div>
            </div>
            {/* Steps */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white group">
              <div className="h-56 overflow-hidden relative">
                <img src={PHOTOS.steps} alt="Adım Sayacı" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1.5 bg-emerald-500/80 backdrop-blur text-white text-xs font-bold rounded-full">{t.healthSection.steps.badge}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-black text-xl mb-2">{t.healthSection.steps.title}</h3>
                <p className="text-gray-500 leading-relaxed">{t.healthSection.steps.sub}</p>
                <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '68%' }} />
                </div>
                <p className="text-sm text-gray-500 mt-1.5">6,800 / 10,000 adım — %68</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-emerald-600 font-semibold mb-3">{t.howItWorks.label}</p>
          <h2 className="text-4xl font-black text-center mb-14">{t.howItWorks.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {t.howItWorks.steps.map((s, idx) => ({ ...s, n: idx + 1 })).map(s => (
              <div key={s.n} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl mx-auto">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-black">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="bg-gray-50 py-12 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-emerald-600 font-semibold mb-3">{t.reviews.label}</p>
          <h2 className="text-4xl font-black text-center mb-14">{t.reviews.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map(rev => (
              <div key={rev.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${rev.color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {rev.initials}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{rev.name}</p>
                    <p className="text-xs text-gray-400">{rev.role}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < rev.stars ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="py-12 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-emerald-600 font-semibold mb-3 text-center">{t.about.label}</p>
          <h2 className="text-4xl font-black text-center mb-4">{t.about.title}</h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">{t.about.sub}</p>

          {/* Mission */}
          <div className="bg-white rounded-3xl p-10 mb-12 shadow-sm border border-gray-100 max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">🎯</div>
            <h3 className="text-xl font-black mb-4">{t.about.mission.title}</h3>
            <p className="text-gray-500 leading-relaxed">{t.about.mission.text}</p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {t.about.values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h4 className="font-black text-gray-900 mb-2 text-sm">{v.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              {t.footer?.contact && <>{t.footer.contact}: </>}
              <a href="mailto:support@calandlens.com" className="text-emerald-600 font-semibold hover:underline">support@calandlens.com</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection strings={t.pricing} dark={false} onCta={() => {}} />

      {/* ── INSTALL / QR ── */}
      <section id="install" className="py-12 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-emerald-600 font-semibold mb-3">{t.install.label}</p>
          <h2 className="text-4xl font-black mb-4">{t.install.title}</h2>
          <p className="text-gray-500 mb-14">{t.install.sub}</p>
          <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <QRCodeSVG value={SITE_URL} size={180} level="H" includeMargin={true} />
              <p className="text-sm text-gray-500 mt-3 font-medium">calandlens.com</p>
            </div>
            <div className="text-left space-y-5 max-w-xs">
              {t.install.steps.map((s, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm">{idx + 1}</span>
                  </div>
                  <p className="text-gray-700 font-medium leading-snug pt-2"><span className="mr-1">{s.icon}</span>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-600 py-12 lg:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">{t.cta.title}</h2>
          <p className="text-emerald-100 mb-10 text-lg">{t.cta.sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={openQuiz}
              className="px-10 py-4 bg-white text-emerald-600 font-black text-lg rounded-2xl hover:bg-emerald-50 transition-colors shadow-lg">
              {t.cta.btn1}
            </button>
            <button onClick={openApp}
              className="px-10 py-4 border-2 border-white/40 hover:border-white text-white font-semibold text-lg rounded-2xl transition-colors">
              {t.cta.btn2}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CalAndLens" className="h-7 w-7 rounded-lg object-cover" />
            <span className="font-black text-emerald-600">CalAndLens</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <a href="#features" className="hover:text-emerald-500 transition-colors">{t.nav.features}</a>
            <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">{t.nav.howItWorks}</a>
            <a href="#testimonials" className="hover:text-emerald-500 transition-colors">{t.nav.reviews}</a>
            <a href="#pricing" className="hover:text-emerald-500 transition-colors">{t.pricing.nav}</a>
            <a href={SITE_URL + '?mode=web'} className="hover:text-emerald-500 transition-colors">{t.nav.download}</a>
            <a href="#about" className="hover:text-emerald-500 transition-colors">{t.nav.about}</a>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-500 transition-colors">{t.footer?.privacy}</button>
            <button onClick={() => setShowTerms(true)} className="hover:text-emerald-500 transition-colors">{t.footer?.terms}</button>
            <a href="mailto:support@calandlens.com" className="hover:text-emerald-500 transition-colors">{t.footer?.contact}</a>
          </div>
          <p className="text-sm text-gray-400">© 2026 CalAndLens</p>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)}
          onSuccess={(u) => { setUser(u); setAuthModal(null); }} />
      )}

      {/* ── QR MODAL ── */}
      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {/* ── PRIVACY / TERMS MODALS ── */}
      {showPrivacy && <TextModal title={t.privacy?.title} content={t.privacy?.content} onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TextModal title={t.terms?.title} content={t.terms?.content} onClose={() => setShowTerms(false)} />}

      {/* ── SET PASSWORD MODAL (şifre sıfırlama e-posta linki) ── */}
      {showSetPassword && <SetPasswordModal onClose={() => setShowSetPassword(false)} />}

      {/* ── ONBOARDING QUIZ ── */}
      {showQuiz && <OnboardingQuiz onComplete={handleQuizComplete} />}
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab]       = useState('login');
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [done, setDone]     = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (tab === 'register') {
        if (!name.trim()) { setError(t('auth.errFill')); setBusy(false); return; }
        const user = await signUp(email, pass, name);
        if (user?.id) {
          fetch('/api/register-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, email }),
          }).catch(() => {});
        }
        // email onayı kapalıysa session gelir, direkt kapat
        if (user?.confirmed_at || user?.email_confirmed_at || user?.identities?.length > 0) {
          onClose();
        } else {
          setDone(true);
        }
      } else {
        await signIn(email, pass);
        onClose();
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login')) setError(t('auth.errWrong'));
      else if (msg.includes('already registered')) setError(t('auth.errExists'));
      else if (msg.includes('Password')) setError(t('auth.errShort'));
      else setError(msg);
    }
    setBusy(false);
  };

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">📧</div>
        <h2 className="text-xl font-black mb-2">{t('auth.confirmTitle')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('auth.confirmSub')}</p>
        <button onClick={onClose} className="w-full py-3 bg-emerald-500 text-white font-black rounded-2xl">{t('auth.ok')}</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          {['login', 'register'].map(t_ => (
            <button key={t_} onClick={() => { setTab(t_); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t_ ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              {t_ === 'login' ? t('auth.loginTab') : t('auth.registerTab')}
            </button>
          ))}
        </div>
        <form onSubmit={handle} className="space-y-3">
          {tab === 'register' && (
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={t('auth.namePh')}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={t('auth.emailPh')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder={tab === 'register' ? t('auth.passwordPhNew') : t('auth.passwordPh')}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-sm" />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={busy}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-black rounded-2xl transition-colors">
            {busy ? '⏳' : tab === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>
        </form>
        <button onClick={onClose} className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-2">{t('auth.skip')}</button>
      </div>
    </div>
  );
}

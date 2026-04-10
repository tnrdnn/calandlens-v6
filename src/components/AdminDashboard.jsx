import React, { useEffect, useState } from 'react';

const AUTH_KEY      = 'cal_admin_auth';
const AUTH_REMEMBER = 'cal_admin_remember';

function LoginScreen({ onLogin }) {
  const [user, setUser]         = useState('');
  const [pass, setPass]         = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res  = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem(AUTH_KEY, data.token);
        if (remember) localStorage.setItem(AUTH_REMEMBER, data.token);
        onLogin(true);
      } else {
        setError('Kullanıcı adı veya şifre hatalı.');
      }
    } catch {
      setError('Bağlantı hatası, tekrar dene.');
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <p className="text-white font-black">CalAndLens Admin</p>
            <p className="text-xs text-gray-500">Giriş yapmanız gerekiyor</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Kullanıcı Adı</label>
            <input
              type="text" value={user} onChange={e => setUser(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500"
              placeholder="Kullanıcı adı"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Şifre</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-11 text-white text-sm outline-none focus:border-emerald-500"
                placeholder="Şifre"
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPass
                  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setRemember(r => !r)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${remember ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 bg-gray-800'}`}
            >
              {remember && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className="text-xs text-gray-400">Beni hatırla</span>
          </label>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" disabled={busy}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-black rounded-xl transition-colors">
            {busy ? '⏳ Kontrol ediliyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://omqnmdgaotlledbhtlvj.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcW5tZGdhb3RsbGVkYmh0bHZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjMxNTYsImV4cCI6MjA5MDk5OTE1Nn0.wO5LUsrNB1XK7Yr9WXlkTMPACiRZ3cUuGBpthot3iRc';

const COUNTRY_NAMES = {
  TR:'🇹🇷 Türkiye', US:'🇺🇸 ABD', DE:'🇩🇪 Almanya', GB:'🇬🇧 İngiltere',
  FR:'🇫🇷 Fransa', NL:'🇳🇱 Hollanda', BE:'🇧🇪 Belçika', AT:'🇦🇹 Avusturya',
  CH:'🇨🇭 İsviçre', SE:'🇸🇪 İsveç', NO:'🇳🇴 Norveç', DK:'🇩🇰 Danimarka',
  FI:'🇫🇮 Finlandiya', PL:'🇵🇱 Polonya', IT:'🇮🇹 İtalya', ES:'🇪🇸 İspanya',
  PT:'🇵🇹 Portekiz', RU:'🇷🇺 Rusya', AU:'🇦🇺 Avustralya', CA:'🇨🇦 Kanada',
  JP:'🇯🇵 Japonya', CN:'🇨🇳 Çin', IN:'🇮🇳 Hindistan', BR:'🇧🇷 Brezilya',
  SA:'🇸🇦 S.Arabistan', AE:'🇦🇪 BAE', XX:'🌍 Bilinmiyor',
};

async function fetchRows() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/page_views?select=visited_at,device_type,browser,referrer,country&order=visited_at.desc`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });
  return res.json();
}


function startOf(unit) {
  const d = new Date();
  if (unit === 'day')   { d.setHours(0,0,0,0); }
  if (unit === 'week')  { d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay()); }
  if (unit === 'month') { d.setHours(0,0,0,0); d.setDate(1); }
  if (unit === 'year')  { d.setHours(0,0,0,0); d.setMonth(0,1); }
  return d;
}

function count(rows, unit) {
  const s = startOf(unit);
  return rows.filter(r => new Date(r.visited_at) >= s).length;
}

function groupBy(rows, key) {
  return rows.reduce((acc, r) => {
    const k = r[key] || 'Bilinmiyor';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function last30Days(rows) {
  const map = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = 0;
  }
  rows.forEach(r => {
    const key = r.visited_at?.slice(0, 10);
    if (key in map) map[key]++;
  });
  return map;
}

function UsersTab({ token }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    fetch(`/api/admin-users?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setUsers(d.users);
        else setError(d.error || 'Kullanıcılar yüklenemedi.');
      })
      .catch(() => setError('Bağlantı hatası.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="bg-red-950 border border-red-800 rounded-2xl p-5 text-red-400 text-sm">{error}</div>
  );

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const todayCount = users.filter(u =>
    new Date(u.created_at) >= new Date(new Date().setHours(0,0,0,0))
  ).length;
  const weekCount = users.filter(u => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate() - d.getDay());
    return new Date(u.created_at) >= d;
  }).length;
  const monthCount = users.filter(u => {
    const d = new Date(); d.setHours(0,0,0,0); d.setDate(1);
    return new Date(u.created_at) >= d;
  }).length;

  // Last 30 days chart
  const dayMap = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  users.forEach(u => {
    const k = u.created_at?.slice(0, 10);
    if (k in dayMap) dayMap[k]++;
  });
  const maxDay = Math.max(...Object.values(dayMap), 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Bugün',       value: todayCount,  icon: '📅' },
          { label: 'Bu Hafta',    value: weekCount,   icon: '📆' },
          { label: 'Bu Ay',       value: monthCount,  icon: '🗓️' },
          { label: 'Toplam',      value: users.length, icon: '👥' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-3xl font-black text-emerald-400">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 30-day chart */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <p className="text-sm font-bold text-gray-300 mb-4">Son 30 Gün — Kayıtlar</p>
        <div className="flex items-end gap-1 h-24">
          {Object.entries(dayMap).map(([date, val]) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                className="w-full bg-blue-500 rounded-sm transition-all group-hover:bg-blue-400"
                style={{ height: `${(val / maxDay) * 80 + (val > 0 ? 4 : 1)}px` }}
              />
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
                <div className="bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {date.slice(5)}: {val}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{Object.keys(dayMap)[0]?.slice(5)}</span>
          <span>Bugün</span>
        </div>
      </div>

      {/* User list */}
      <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-300">Kullanıcı Listesi</p>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="E-posta ara..."
            className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 w-48"
          />
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">Kullanıcı bulunamadı.</p>
          )}
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
              <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-400 font-black text-sm flex-shrink-0">
                {u.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white truncate">{u.email}</p>
                  {u.full_name && (
                    <span className="text-xs text-gray-400 truncate">({u.full_name})</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Kayıt: {new Date(u.created_at).toLocaleString('tr-TR')}
                  {u.last_sign_in && ` · Son giriş: ${new Date(u.last_sign_in).toLocaleString('tr-TR')}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm" title={u.country}>
                  {COUNTRY_NAMES[u.country]?.split(' ')[0] || '🌐'}
                </span>
                <span className="text-xs text-gray-500 hidden md:inline">
                  {(COUNTRY_NAMES[u.country] || u.country || 'Bilinmiyor').replace(/^.\S*\s/, '')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${u.confirmed ? 'bg-emerald-900 text-emerald-400' : 'bg-gray-700 text-gray-500'}`}>
                  {u.confirmed ? 'Onaylı' : 'Bekliyor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [authed, setAuthed]     = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab]           = useState('visitors');
  const [token, setToken]       = useState('');

  // Verify stored token on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_REMEMBER);
    if (!stored) { setChecking(false); return; }
    fetch(`/api/admin-verify?token=${encodeURIComponent(stored)}`)
      .then(r => r.json())
      .then(d => { if (d.ok) { setAuthed(true); setToken(stored); } })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (ok) => {
    if (ok) {
      const stored = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_REMEMBER);
      setToken(stored || '');
      setAuthed(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_REMEMBER);
    setAuthed(false);
    setToken('');
  };

  useEffect(() => {
    if (!authed) return;
    fetchRows().then(data => {
      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [authed]);

  if (checking) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const days  = last30Days(rows);
  const maxDay = Math.max(...Object.values(days), 1);
  const devices   = groupBy(rows, 'device_type');
  const browsers  = groupBy(rows, 'browser');
  const countries = groupBy(rows, 'country');

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <h1 className="text-xl font-black text-white">CalAndLens Admin</h1>
              <p className="text-xs text-gray-500">Yönetim Paneli</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-400 px-3 py-1.5 rounded-xl transition-colors">
            Çıkış Yap
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 rounded-2xl p-1.5 border border-gray-800 w-fit">
          {[
            { id: 'visitors', label: '🌍 Ziyaretçiler' },
            { id: 'users',    label: '👥 Kullanıcılar' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                tab === t.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Users tab */}
        {tab === 'users' && <UsersTab token={token} />}

        {/* Visitors tab */}
        {tab === 'visitors' && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Bugün',    value: count(rows, 'day'),   icon: '📅' },
                { label: 'Bu Hafta', value: count(rows, 'week'),  icon: '📆' },
                { label: 'Bu Ay',    value: count(rows, 'month'), icon: '🗓️' },
                { label: 'Bu Yıl',   value: count(rows, 'year'),  icon: '📊' },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <p className="text-2xl mb-1">{s.icon}</p>
                  <p className="text-3xl font-black text-emerald-400">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Toplam */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Ziyaretçi</p>
                <p className="text-5xl font-black text-white mt-1">{rows.length}</p>
              </div>
              <span className="text-5xl">🌍</span>
            </div>

            {/* 30 günlük grafik */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
              <p className="text-sm font-bold text-gray-300 mb-4">Son 30 Gün</p>
              <div className="flex items-end gap-1 h-24">
                {Object.entries(days).map(([date, val]) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-emerald-500 rounded-sm transition-all group-hover:bg-emerald-400"
                      style={{ height: `${(val / maxDay) * 80 + (val > 0 ? 4 : 1)}px` }}
                    />
                    <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10">
                      <div className="bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {date.slice(5)}: {val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{Object.keys(days)[0]?.slice(5)}</span>
                <span>Bugün</span>
              </div>
            </div>

            {/* Ülkeler */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 mb-6">
              <p className="text-sm font-bold text-gray-300 mb-3">🌍 Ülkeler</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(countries).sort((a,b) => b[1]-a[1]).map(([code, val]) => (
                  <div key={code} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2">
                    <span className="text-sm text-gray-300">{COUNTRY_NAMES[code] || `🌐 ${code}`}</span>
                    <span className="text-emerald-400 font-black text-sm ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cihaz + Tarayıcı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { title: '📱 Cihaz', data: devices },
                { title: '🌐 Tarayıcı', data: browsers },
              ].map(({ title, data }) => (
                <div key={title} className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                  <p className="text-sm font-bold text-gray-300 mb-3">{title}</p>
                  <div className="space-y-2">
                    {Object.entries(data).sort((a,b) => b[1]-a[1]).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{k}</span>
                          <span className="text-white font-semibold">{v}</span>
                        </div>
                        <div className="bg-gray-800 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${(v / rows.length) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Son ziyaretler */}
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <p className="text-sm font-bold text-gray-300 mb-3">Son 20 Ziyaret</p>
              <div className="space-y-2">
                {rows.slice(0, 20).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                    <span>{new Date(r.visited_at).toLocaleString('tr-TR')}</span>
                    <span>{r.device_type === 'mobile' ? '📱' : '🖥️'} {r.browser}</span>
                    <span className="text-emerald-600">{COUNTRY_NAMES[r.country] || r.country || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <p className="text-center text-xs text-gray-700 mt-6">
          calandlens.com/?admin=calandlens2025
        </p>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../hooks/useLanguage';

export default function PWAInstallBanner() {
  const { t } = useLanguage();
  const { showBanner, isIOS, deferredPrompt, triggerInstall, dismiss } = usePWAInstall();
  const [installing, setInstalling] = useState(false);

  if (!showBanner) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await triggerInstall();
    setInstalling(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'linear-gradient(160deg, #059669 0%, #0d9488 100%)' }}>

      {/* ── Üst alan: logo + başlık ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-xl">
          <img src="/logo.png" alt="CalAndLens" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">CalAndLens</h1>
          <p className="text-emerald-100 text-base mt-2 font-medium">AI destekli beslenme takibi</p>
        </div>
        <div className="flex gap-3 mt-1">
          {['📸 AI Analiz', '🔬 Besinler', '📅 Geçmiş'].map(tag => (
            <span key={tag} className="px-3 py-1.5 bg-white/20 rounded-full text-white text-xs font-semibold backdrop-blur">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Alt panel: kurulum adımları ── */}
      <div className="bg-white rounded-t-[32px] px-5 pt-7 pb-8 shadow-2xl" style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

        <p className="text-center text-lg font-black text-gray-900 mb-6">
          {isIOS ? '📲 Ana Ekrana Ekle' : deferredPrompt ? '📲 Uygulamayı Yükle' : '📲 Ana Ekrana Ekle'}
        </p>

        {/* Adımlar */}
        <div className="space-y-3 mb-6">
          {isIOS ? (
            <>
              <InstallStep num={1} emoji="⬆️" title="Safari paylaş butonuna dokun" sub="Ekranın alt ortasındaki kutu+ok ikonu" />
              <InstallStep num={2} emoji="➕" title={'"Ana Ekrana Ekle" seç'} sub="Listeyi aşağı kaydır, bu seçeneği bul" />
              <InstallStep num={3} emoji="✅" title={'"Ekle" butonuna dokun'} sub="Sağ üst köşedeki mavi Ekle butonu" />
            </>
          ) : deferredPrompt ? (
            <>
              <InstallStep num={1} emoji="👇" title="Aşağıdaki butona dokun" sub="Yükleme işlemi otomatik başlar" />
              <InstallStep num={2} emoji="✅" title={'"Yükle" seçeneğine dokun'} sub="Açılan pencerede onayla" />
              <InstallStep num={3} emoji="🚀" title="Ana ekranda ikonunu bul!" sub="Artık uygulama gibi açılır" />
            </>
          ) : (
            <>
              <InstallStep num={1} emoji="⋮" title="Tarayıcı menüsüne dokun" sub="Sağ üstteki üç nokta (⋮) veya (...)" />
              <InstallStep num={2} emoji="➕" title={'"Ana ekrana ekle" seç'} sub={'Veya "Uygulamayı yükle" seçeneği'} />
              <InstallStep num={3} emoji="🚀" title="Ana ekranda ikonunu bul!" sub="Artık uygulama gibi açılır" />
            </>
          )}
        </div>

        {/* iOS ipucu */}
        {isIOS && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
            <span className="text-xl flex-shrink-0">💡</span>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              Safari'de açık olduğundan emin ol. Chrome veya başka tarayıcıdan eklenemez.
            </p>
          </div>
        )}

        {/* Android yükle butonu */}
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            disabled={installing}
            className="w-full py-4 font-black text-lg text-white rounded-2xl mb-4 transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #059669, #0d9488)', boxShadow: '0 8px 24px rgba(5,150,105,0.35)' }}
          >
            {installing ? '⏳ Yükleniyor...' : '📲 Uygulamayı Yükle'}
          </button>
        )}

        {/* Yüklemeden direkt aç */}
        <button
          onClick={dismiss}
          className="w-full py-4 bg-emerald-500 active:bg-emerald-600 text-white font-black text-base rounded-2xl transition-colors"
          style={{ boxShadow: '0 4px 14px rgba(5,150,105,0.25)' }}
        >
          ▶ Uygulamayı Şimdi Aç
        </button>

        <p className="text-center text-sm font-bold text-gray-500 mt-3">
          Şimdi değil, yüklemeden devam et
        </p>
      </div>
    </div>
  );
}

function InstallStep({ num, emoji, title, sub }) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3">
      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-black text-sm">{num}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-snug">{emoji} {title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</p>
      </div>
    </div>
  );
}

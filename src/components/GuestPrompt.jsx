import React from 'react';

const PROMPT_KEY = 'cal_guest_prompted';
const SITE_URL   = 'https://calandlens.com';

export default function GuestPrompt({ onClose }) {
  const dismiss = () => {
    localStorage.setItem(PROMPT_KEY, '1');
    onClose();
  };

  const goRegister = () => {
    localStorage.setItem(PROMPT_KEY, '1');
    window.open(SITE_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="mx-3 mb-1 bg-white rounded-3xl border border-gray-100 p-5"
        style={{ boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
            💾
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm leading-snug">
              İlerlemeni kaydetmek ister misin?
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Ücretsiz hesap aç, verilerini hiç kaybetme.
            </p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={dismiss}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-2xl text-sm transition-colors hover:bg-gray-50"
          >
            Şimdi değil
          </button>
          <button
            onClick={goRegister}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-sm transition-colors"
          >
            Hesap Oluştur
          </button>
        </div>
      </div>
    </div>
  );
}

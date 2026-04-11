import React from 'react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 bg-emerald-100 rounded-3xl flex items-center justify-center text-5xl mb-8">
        🥗
      </div>
      <h1 className="text-8xl font-black text-emerald-500 mb-2">404</h1>
      <h2 className="text-2xl font-black text-gray-900 mb-4">Sayfa Bulunamadı</h2>
      <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
        Aradığınız sayfa mevcut değil ya da taşınmış olabilir.
      </p>
      <a
        href="/"
        className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-colors shadow-lg shadow-emerald-200"
      >
        Ana Sayfaya Dön
      </a>
    </div>
  );
}

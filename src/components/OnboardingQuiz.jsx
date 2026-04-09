import React, { useState } from 'react';

const GOAL_KEY = 'calandlens_goal';

// Inline i18n — tr/en, fallback en for others
const I18N = {
  tr: {
    title: 'Hızlı Kurulum',
    subtitle: '3 kısa soru · 30 saniye',
    skipAll: 'Tüm Soruları Geç →',
    skipOne: 'Bu Soruyu Geç',
    finish: 'Hadi Başlayalım →',
    q: [
      {
        text: 'Hedefin nedir?',
        options: ['🎯 Kilo vermek istiyorum', '⚖️ Kilomi korumak istiyorum', '🥗 Daha sağlıklı beslenmek'],
      },
      {
        text: 'Günlük kalori hedefini otomatik hesaplayayım mı?',
        options: ['✅ Evet, otomatik hesapla', '✏️ Hayır, kendim belirleyeceğim'],
      },
      {
        text: 'Aktivite seviyeni nasıl tanımlarsın?',
        options: ['🛋️ Hareketsiz (masa başı)', '🚶 Orta aktif (haftada 2-3 gün)', '🏃 Aktif / Sporcu (hergün)'],
      },
    ],
  },
  en: {
    title: 'Quick Setup',
    subtitle: '3 quick questions · 30 seconds',
    skipAll: 'Skip All →',
    skipOne: 'Skip this question',
    finish: "Let's Start →",
    q: [
      {
        text: 'What is your goal?',
        options: ['🎯 Lose weight', '⚖️ Maintain weight', '🥗 Eat healthier'],
      },
      {
        text: 'Should I auto-calculate your daily calorie goal?',
        options: ['✅ Yes, calculate it for me', '✏️ No, I will set it myself'],
      },
      {
        text: 'How would you describe your activity level?',
        options: ['🛋️ Sedentary (desk job)', '🚶 Moderately active (2-3x/week)', '🏃 Active / Athletic (daily)'],
      },
    ],
  },
};

function getLang() {
  const saved = localStorage.getItem('calandlens_lang');
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  if (saved === 'tr') return 'tr';
  if (saved && I18N[saved]) return saved;
  if (browser === 'tr') return 'tr';
  return 'en';
}

function applyCalorieGoal(answers) {
  // Only if user chose auto-calculate (q1 answer = 0)
  if (answers[1] !== 0) return;
  const activityBase = [1700, 2000, 2400][answers[2] ?? 1];
  const loseAdj = answers[0] === 0 ? -300 : 0;
  localStorage.setItem(GOAL_KEY, String(activityBase + loseAdj));
}

export default function OnboardingQuiz({ onComplete }) {
  const text = I18N[getLang()] || I18N.en;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null); // for brief highlight before advance

  const total = text.q.length;
  const q = text.q[step];
  const isLast = step === total - 1;

  const advance = (newAnswers) => {
    if (step < total - 1) {
      setTimeout(() => {
        setStep(s => s + 1);
        setSelected(null);
      }, 220);
    } else {
      applyCalorieGoal(newAnswers);
      setTimeout(() => onComplete(), 220);
    }
  };

  const selectOption = (idx) => {
    setSelected(idx);
    const newAnswers = { ...answers, [step]: idx };
    setAnswers(newAnswers);
    advance(newAnswers);
  };

  const skipOne = () => {
    setSelected(null);
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      applyCalorieGoal(answers);
      onComplete();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #059669 0%, #0d9488 100%)' }}
    >
      {/* Top section: logo + title + progress */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
        <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl">
          <img src="/logo.png" alt="CalAndLens" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{text.title}</h1>
          <p className="text-emerald-100 text-sm mt-1">{text.subtitle}</p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center gap-2 mt-1">
          {text.q.map((_, i) => (
            <div
              key={i}
              className="h-2 rounded-full transition-all duration-400"
              style={{
                width: i === step ? 24 : 8,
                background: i <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom panel: question + options */}
      <div
        className="bg-white rounded-t-[32px] px-5 pt-7 pb-8 shadow-2xl"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
      >
        <p className="text-lg font-black text-gray-900 mb-5 leading-snug">{q.text}</p>

        <div className="space-y-3 mb-5">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => selectOption(idx)}
              className="w-full text-left px-4 py-3.5 rounded-2xl border-2 font-semibold text-sm transition-all duration-150 active:scale-[0.98]"
              style={{
                borderColor: selected === idx ? '#10b981' : '#e5e7eb',
                background: selected === idx ? '#ecfdf5' : '#ffffff',
                color: selected === idx ? '#065f46' : '#374151',
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Skip this question */}
        <button
          onClick={skipOne}
          className="w-full py-2 text-sm text-gray-400 font-semibold mb-3"
        >
          {isLast ? text.finish : text.skipOne}
        </button>

        {/* Skip all */}
        <button
          onClick={onComplete}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-black text-base rounded-2xl transition-colors"
          style={{ boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}
        >
          {text.skipAll}
        </button>
      </div>
    </div>
  );
}

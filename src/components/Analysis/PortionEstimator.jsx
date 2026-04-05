import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// Yemek tipine göre preset seçenekleri
const HINT_PRESETS = {
  soup:    [{ key: 'small', grams: 200 }, { key: 'medium', grams: 300 }, { key: 'large', grams: 400 }, { key: 'xlarge', grams: 500 }],
  side:    [{ key: 'small', grams: 60  }, { key: 'medium', grams: 120 }, { key: 'large', grams: 200 }, { key: 'xlarge', grams: 300 }],
  snack:   [{ key: 'small', grams: 30  }, { key: 'medium', grams: 60  }, { key: 'large', grams: 100 }, { key: 'xlarge', grams: 150 }],
  dessert: [{ key: 'small', grams: 50  }, { key: 'medium', grams: 80  }, { key: 'large', grams: 120 }, { key: 'xlarge', grams: 180 }],
  main:    [{ key: 'small', grams: 100 }, { key: 'medium', grams: 180 }, { key: 'large', grams: 280 }, { key: 'xlarge', grams: 400 }],
};

// El referansları
const HAND_REFS = [
  { emoji: '🤏', label_key: 'ref_pinch',  grams: 15  },
  { emoji: '✋', label_key: 'ref_palm',   grams: 80  },
  { emoji: '✊', label_key: 'ref_fist',   grams: 150 },
  { emoji: '🤲', label_key: 'ref_cupped', grams: 250 },
];

export default function PortionEstimator({ mealName, aiEstimate = 150, portionHint = 'main', onConfirm, onCancel }) {
  const { t } = useLanguage();
  const [grams, setGrams] = useState(aiEstimate);
  const [inputVal, setInputVal] = useState(String(aiEstimate));

  useEffect(() => {
    setGrams(aiEstimate);
    setInputVal(String(aiEstimate));
  }, [aiEstimate]);

  const presets = HINT_PRESETS[portionHint] || HINT_PRESETS.main;

  const handleSlider = (v) => { setGrams(v); setInputVal(String(v)); };
  const handleInput = (v) => {
    setInputVal(v);
    const n = parseInt(v, 10);
    if (!isNaN(n) && n >= 5 && n <= 2000) setGrams(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white">
          <h3 className="font-bold text-lg truncate">{mealName}</h3>
          <p className="text-emerald-100 text-sm mt-0.5">{t('portion.title')}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* AI estimate badge */}
          <div className="flex items-center gap-3 bg-blue-50 rounded-2xl px-4 py-3">
            <span className="text-2xl flex-shrink-0">🤖</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">{t('portion.ai_estimate')}</p>
              <p className="text-xs text-blue-500">{t('portion.ai_estimate_desc')} — <strong>{aiEstimate}g</strong></p>
            </div>
            <button
              onClick={() => handleSlider(aiEstimate)}
              className="ml-auto text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-lg hover:bg-blue-200 transition-colors flex-shrink-0"
            >
              {t('portion.use')}
            </button>
          </div>

          {/* Number input */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">{t('portion.question')}</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5" max="2000"
                value={inputVal}
                onChange={e => handleInput(e.target.value)}
                className="w-28 text-center text-3xl font-bold border-2 border-gray-200 focus:border-emerald-400 rounded-2xl py-3 outline-none transition-colors"
              />
              <span className="text-lg text-gray-500 font-medium">{t('portion.grams')}</span>
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range" min="10" max="700" step="5"
              value={grams}
              onChange={e => handleSlider(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10g</span><span>350g</span><span>700g</span>
            </div>
          </div>

          {/* Quick presets (dynamic per food type) */}
          <div className="grid grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.key}
                onClick={() => handleSlider(p.grams)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all
                  ${grams === p.grams
                    ? 'bg-emerald-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <span className="block">{t(`portion.presets.${p.key}`)}</span>
                <span className={`block font-normal ${grams === p.grams ? 'text-emerald-100' : 'text-gray-400'}`}>{p.grams}g</span>
              </button>
            ))}
          </div>

          {/* Hand references */}
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-2">👋 {t('portion.hand_ref')}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {HAND_REFS.map(ref => (
                <button
                  key={ref.label_key}
                  onClick={() => handleSlider(ref.grams)}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors"
                >
                  <span className="text-xl">{ref.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-500">{ref.grams}g</span>
                  <span className="text-[9px] text-gray-400">{t(`portion.${ref.label_key}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => onConfirm(grams)}
              className="flex-[2] py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors text-base"
            >
              {t('portion.confirm')} — {grams}g
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

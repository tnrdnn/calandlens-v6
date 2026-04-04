import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import MicroNutrientsPanel from './MicroNutrientsPanel';

export default function ResultModal({ result, photo, onAdd, onClose }) {
  const { t } = useLanguage();
  if (!result) return null;

  const macros = [
    { label: t('nutrition.protein'), value: result.protein, unit:'g', color:'bg-blue-100 text-blue-700' },
    { label: t('nutrition.carbs'),   value: result.carbs,   unit:'g', color:'bg-yellow-100 text-yellow-700' },
    { label: t('nutrition.fat'),     value: result.fat,     unit:'g', color:'bg-red-100 text-red-600' },
    { label: t('nutrition.sugar'),   value: result.sugar,   unit:'g', color:'bg-pink-100 text-pink-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {photo && <img src={photo} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/30"/>}
            <div>
              <p className="font-black text-xl">{result.icon} {result.name}</p>
              {result.portionGrams && (
                <p className="text-emerald-100 text-sm">{result.portionGrams}g porsiyon</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">
            {/* Calorie badge */}
            <div className="text-center py-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
              <p className="text-5xl font-black text-emerald-600">{Math.round(result.calories)}</p>
              <p className="text-gray-500 font-medium mt-1">{t('nutrition.calories')}</p>
              {result.confidence > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {t('analysis.confidence')}: {Math.round(result.confidence * 100)}%
                </p>
              )}
            </div>

            {/* Macros */}
            <div className="grid grid-cols-2 gap-2.5">
              {macros.map(m => (
                <div key={m.label} className={`rounded-2xl p-3.5 ${m.color}`}>
                  <p className="text-xs opacity-70 mb-0.5">{m.label}</p>
                  <p className="text-xl font-black">{Math.round(m.value * 10) / 10}
                    <span className="text-xs font-normal ml-0.5">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Micro nutrients */}
            <MicroNutrientsPanel totals={result}/>
          </div>
        </div>

        {/* Add button */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onAdd}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl transition-colors"
          >
            {t('analysis.add_meal')} ✓
          </button>
        </div>
      </div>
    </div>
  );
}

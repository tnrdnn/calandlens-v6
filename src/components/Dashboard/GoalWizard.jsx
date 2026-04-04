import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';

function calcBMR(weight, height, age, gender) {
  if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

const ACTIVITY_FACTORS = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, very_active:1.9 };
const GOAL_DELTA       = { lose: -500, maintain: 0, gain: 500 };

export default function GoalWizard({ onClose }) {
  const { t } = useLanguage();
  const { setGoal, setProfile } = useLocalStorage();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ weight:'', height:'', age:'', gender:'male', activity:'moderate', goal:'maintain' });
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calculate = () => {
    const bmr  = calcBMR(+form.weight, +form.height, +form.age, form.gender);
    const tdee = bmr * ACTIVITY_FACTORS[form.activity];
    const kcal = Math.round(tdee + GOAL_DELTA[form.goal]);
    setResult(Math.max(1200, kcal));
    setStep(2);
  };

  const handleSave = () => {
    setGoal(result);
    setProfile(form);
    onClose?.();
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 outline-none text-base";
  const selectCls = inputCls;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg">{t('wizard.title')}</h3>
            <p className="text-emerald-100 text-sm">{t('wizard.subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex px-6 pt-4 gap-2">
          {[t('wizard.step_personal'), t('wizard.step_goal'), t('wizard.step_result')].map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${i <= step ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('wizard.weight')}</label>
                  <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)}
                    className={inputCls} placeholder="70" min="30" max="300"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('wizard.height')}</label>
                  <input type="number" value={form.height} onChange={e => set('height', e.target.value)}
                    className={inputCls} placeholder="170" min="100" max="250"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('wizard.age')}</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                  className={inputCls} placeholder="30" min="10" max="120"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('wizard.gender')}</label>
                <div className="flex gap-2">
                  {['male','female'].map(g => (
                    <button key={g} onClick={() => set('gender', g)}
                      className={`flex-1 py-2.5 rounded-2xl font-semibold text-sm transition-colors
                        ${form.gender === g ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {t(`wizard.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => setStep(1)} disabled={!form.weight || !form.height || !form.age}
                className="w-full py-3.5 bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-2xl transition-colors">
                {t('common.next')} →
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t('wizard.activity')}</label>
                <select value={form.activity} onChange={e => set('activity', e.target.value)} className={selectCls}>
                  {['sedentary','light','moderate','active','very_active'].map(a => (
                    <option key={a} value={a}>{t(`wizard.${a}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">{t('wizard.goal')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['lose','maintain','gain'].map(g => (
                    <button key={g} onClick={() => set('goal', g)}
                      className={`py-3 rounded-2xl font-semibold text-xs transition-colors
                        ${form.goal === g ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-100 text-gray-600'}`}>
                      {t(`wizard.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl font-semibold text-gray-600">
                  {t('common.back')}
                </button>
                <button onClick={calculate} className="flex-[2] py-3 bg-emerald-500 text-white font-bold rounded-2xl">
                  {t('wizard.calculate')}
                </button>
              </div>
            </>
          )}

          {step === 2 && result && (
            <>
              <div className="text-center py-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                <p className="text-sm text-gray-500 mb-2">{t('wizard.your_goal')}</p>
                <p className="text-6xl font-black text-emerald-600">{result}</p>
                <p className="text-gray-500 font-medium mt-1">kcal / {t('history.today').toLowerCase()}</p>
              </div>
              <button onClick={handleSave}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg rounded-2xl transition-colors">
                {t('wizard.save')} ✓
              </button>
              <button onClick={() => setStep(0)} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-1">
                {t('wizard.recalculate')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { exportWeeklyPDF } from '../../services/pdfExport';

export default function WeeklyReport() {
  const { t, tArr, lang } = useLanguage();
  const { getWeeklyData, getGoal, getAllMeals, getWaterGoal } = useLocalStorage();
  const [exporting, setExporting] = useState(false);

  const data   = getWeeklyData();
  const goal   = getGoal();

  const withData    = data.filter(d => d.calories > 0);
  const avgCal      = withData.length ? Math.round(withData.reduce((s, d) => s + d.calories, 0) / withData.length) : 0;
  const bestDay     = withData.length ? withData.reduce((b, d) => Math.abs(d.calories - goal) < Math.abs(b.calories - goal) ? d : b, withData[0]) : null;
  const onTrack     = data.filter(d => d.calories >= goal * 0.85 && d.calories <= goal * 1.15).length;
  const consistency = data.length ? Math.round((withData.length / data.length) * 100) : 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      const allMeals  = getAllMeals();
      const waterGoal = getWaterGoal();
      const waterRaw  = localStorage.getItem('calandlens_water');
      const waterData = waterRaw ? JSON.parse(waterRaw) : {};
      await exportWeeklyPDF({ weeklyData: data, goal, allMeals, waterData, waterGoal, lang });
    } catch (e) {
      console.error('PDF export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const stat = (label, value, sub, icon) => (
    <div className="bg-gray-50 rounded-2xl p-4 text-center relative overflow-hidden">
      <div className="absolute top-2 right-2 text-xl opacity-20">{icon}</div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-xs font-semibold text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight">{t('report.title')}</h3>
            <p className="text-xs text-gray-400">{t('report.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors active:scale-95"
        >
          {exporting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>📄</span>
          )}
          {t('report.export_pdf')}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stat(t('report.avg_calories'), avgCal ? `${avgCal}` : '—', 'kcal/gün', '🔥')}
        {stat(t('report.days_on_track'), `${onTrack}/7`, `${Math.round((onTrack/7)*100)}%`, '🎯')}
        {stat(t('report.consistency'), `${consistency}%`, `${withData.length} gün kayıt`, '📈')}
        {stat(t('report.best_day'), bestDay ? bestDay.day : '—', bestDay ? `${bestDay.calories} kcal` : '', '🏆')}
      </div>
    </div>
  );
}

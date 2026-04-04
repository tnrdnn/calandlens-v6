import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import HistoryCalendar from './HistoryCalendar';
import DayDetail from './DayDetail';

export default function HistoryPage() {
  const { t } = useLanguage();
  const { getAllMeals, getGoal } = useLocalStorage();
  const [selectedDay, setSelectedDay] = useState(null);

  const allMealsMap = getAllMeals(); // { dateKey: Meal[] }
  const dailyGoal = getGoal();

  // Today as default selection
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMeals = allMealsMap[todayKey] || [];

  const handleSelectDay = (info) => setSelectedDay(info);

  const displayDay = selectedDay || { date: new Date(), meals: todayMeals };

  return (
    <div className="space-y-4 pb-24">
      <div className="px-1">
        <h2 className="text-2xl font-black text-gray-800">{t('history.title')}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{t('history.subtitle')}</p>
      </div>

      <HistoryCalendar
        allMealsMap={allMealsMap}
        onSelectDay={handleSelectDay}
        dailyGoal={dailyGoal}
      />

      <DayDetail
        date={displayDay.date}
        meals={displayDay.meals}
        dailyGoal={dailyGoal}
      />
    </div>
  );
}

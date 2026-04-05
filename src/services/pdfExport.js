/**
 * Generates a weekly nutrition report PDF
 * @param {object} params
 */
export async function exportWeeklyPDF({ weeklyData, goal, allMeals, waterData, waterGoal, stepsData, streak, lang = 'tr' }) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const margin = 16;
  let y = 0;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const col = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  const setFill  = (hex) => doc.setFillColor(...col(hex));
  const setColor = (hex) => doc.setTextColor(...col(hex));

  // ── Header ───────────────────────────────────────────────────────────────
  setFill('#10b981');
  doc.rect(0, 0, W, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  setColor('#ffffff');
  doc.text('CalAndLens', margin, 13);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(labels[lang].subtitle, margin, 20);

  const today = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(today, W - margin, 20, { align: 'right' });

  y = 35;

  // ── Section title ────────────────────────────────────────────────────────
  const sectionTitle = (text) => {
    setFill('#f0fdf4');
    doc.roundedRect(margin, y, W - margin * 2, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor('#047857');
    doc.text(text, margin + 3, y + 6.2);
    y += 13;
  };

  // ── Weekly stats ─────────────────────────────────────────────────────────
  sectionTitle(labels[lang].weeklyReport);

  const withData   = weeklyData.filter(d => d.calories > 0);
  const avgCal     = withData.length ? Math.round(withData.reduce((s, d) => s + d.calories, 0) / withData.length) : 0;
  const onTrack    = weeklyData.filter(d => d.calories >= goal * 0.85 && d.calories <= goal * 1.15).length;
  const consistency = weeklyData.length ? Math.round((withData.length / weeklyData.length) * 100) : 0;

  const statBoxes = [
    { label: labels[lang].avgCalories, value: avgCal ? `${avgCal} kcal` : '-' },
    { label: labels[lang].goal,        value: `${goal} kcal` },
    { label: labels[lang].onTrack,     value: `${onTrack}/7 ${labels[lang].days}` },
    { label: labels[lang].consistency, value: `${consistency}%` },
  ];
  const boxW = (W - margin * 2 - 9) / 4;
  statBoxes.forEach((s, i) => {
    const x = margin + i * (boxW + 3);
    setFill('#f9fafb');
    doc.roundedRect(x, y, boxW, 18, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setColor('#111827');
    doc.text(s.value, x + boxW / 2, y + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor('#6b7280');
    doc.text(s.label, x + boxW / 2, y + 14, { align: 'center' });
  });
  y += 24;

  // ── Daily breakdown chart ─────────────────────────────────────────────────
  sectionTitle(labels[lang].dailyBreakdown);

  const chartW = W - margin * 2;
  const chartH = 30;
  const maxCal = Math.max(...weeklyData.map(d => d.calories), goal, 1);
  const barW   = chartW / 7 - 2;

  weeklyData.forEach((d, i) => {
    const x    = margin + i * (chartW / 7);
    const barH = Math.max(1, (d.calories / maxCal) * chartH);
    const barY = y + chartH - barH;
    const isOnTrack = d.calories >= goal * 0.85 && d.calories <= goal * 1.15;
    setFill(d.calories === 0 ? '#e5e7eb' : isOnTrack ? '#10b981' : '#f59e0b');
    doc.roundedRect(x + 1, barY, barW, barH, 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setColor('#6b7280');
    doc.text(d.day, x + barW / 2 + 1, y + chartH + 5, { align: 'center' });
    if (d.calories > 0) {
      doc.setFontSize(6);
      setColor('#374151');
      doc.text(String(d.calories), x + barW / 2 + 1, barY - 1, { align: 'center' });
    }
  });

  // Goal line
  const goalY = y + chartH - (goal / maxCal) * chartH;
  doc.setDrawColor(239, 68, 68);
  doc.setLineDashPattern([2, 1], 0);
  doc.line(margin, goalY, margin + chartW, goalY);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(6.5);
  setColor('#ef4444');
  doc.text(`${labels[lang].goal} ${goal}`, margin + chartW + 1, goalY + 1);

  y += chartH + 12;

  // ── Meals table ───────────────────────────────────────────────────────────
  sectionTitle(labels[lang].mealDetail);

  const tableHeaders = [labels[lang].date, labels[lang].meals, 'kcal', labels[lang].protein, labels[lang].carbs, labels[lang].fat];
  const colWidths    = [28, 22, 22, 22, 22, 22];
  const tableW       = colWidths.reduce((a, b) => a + b, 0);
  const tableX       = margin + (W - margin * 2 - tableW) / 2;

  // Header row
  setFill('#10b981');
  doc.rect(tableX, y, tableW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  setColor('#ffffff');
  let cx = tableX;
  tableHeaders.forEach((h, i) => {
    doc.text(h, cx + colWidths[i] / 2, y + 5, { align: 'center' });
    cx += colWidths[i];
  });
  y += 7;

  // Data rows
  weeklyData.forEach((d, idx) => {
    const meals  = allMeals[d.date] || [];
    const protein = Math.round(meals.reduce((s, m) => s + (m.protein || 0), 0));
    const carbs   = Math.round(meals.reduce((s, m) => s + (m.carbs   || 0), 0));
    const fat     = Math.round(meals.reduce((s, m) => s + (m.fat     || 0), 0));

    setFill(idx % 2 === 0 ? '#f9fafb' : '#ffffff');
    doc.rect(tableX, y, tableW, 7, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setColor('#374151');

    const row = [d.date.slice(5), String(meals.length), d.calories ? String(d.calories) : '-', protein ? `${protein}g` : '-', carbs ? `${carbs}g` : '-', fat ? `${fat}g` : '-'];
    cx = tableX;
    row.forEach((v, i) => {
      doc.text(v, cx + colWidths[i] / 2, y + 5, { align: 'center' });
      cx += colWidths[i];
    });
    y += 7;
  });
  y += 6;

  // ── Water summary ─────────────────────────────────────────────────────────
  if (waterData) {
    sectionTitle(`💧 ${labels[lang].waterTitle}`);
    const totalWater   = Object.values(waterData).reduce((s, v) => s + v, 0);
    const avgWater     = weeklyData.length ? Math.round(totalWater / weeklyData.length) : 0;
    const waterBoxes   = [
      { label: labels[lang].totalWater, value: `${Math.round(totalWater / 1000 * 10) / 10} L` },
      { label: labels[lang].avgWater,   value: `${avgWater} ml` },
      { label: labels[lang].waterGoal,  value: `${waterGoal} ml` },
    ];
    const wBoxW = (W - margin * 2 - 6) / 3;
    waterBoxes.forEach((s, i) => {
      const x = margin + i * (wBoxW + 3);
      setFill('#eff6ff');
      doc.roundedRect(x, y, wBoxW, 16, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      setColor('#1d4ed8');
      doc.text(s.value, x + wBoxW / 2, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor('#6b7280');
      doc.text(s.label, x + wBoxW / 2, y + 13, { align: 'center' });
    });
    y += 22;
  }

  // ── Steps & Streak ────────────────────────────────────────────────────────
  if (stepsData || streak) {
    sectionTitle(`👟 ${labels[lang].stepsStreak}`);
    const extraBoxes = [];
    if (streak) {
      extraBoxes.push({ label: labels[lang].streakCurrent, value: `${streak.current} ${labels[lang].days}` });
      extraBoxes.push({ label: labels[lang].streakBest,    value: `${streak.best} ${labels[lang].days}` });
    }
    if (stepsData) {
      const totalSteps = Object.values(stepsData).reduce((s, v) => s + v, 0);
      const avgSteps   = weeklyData.length ? Math.round(totalSteps / weeklyData.length) : 0;
      extraBoxes.push({ label: labels[lang].stepsTotal, value: totalSteps.toLocaleString() });
      extraBoxes.push({ label: labels[lang].stepsAvg,   value: avgSteps.toLocaleString() });
    }
    const eBoxW = (W - margin * 2 - (extraBoxes.length - 1) * 3) / extraBoxes.length;
    extraBoxes.forEach((s, i) => {
      const x = margin + i * (eBoxW + 3);
      setFill('#faf5ff');
      doc.roundedRect(x, y, eBoxW, 16, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      setColor('#6d28d9');
      doc.text(s.value, x + eBoxW / 2, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor('#6b7280');
      doc.text(s.label, x + eBoxW / 2, y + 14, { align: 'center' });
    });
    y += 22;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  setFill('#f9fafb');
  doc.rect(0, 285, W, 12, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor('#9ca3af');
  doc.text('CalAndLens • AI Nutrition Tracker', margin, 292);
  doc.text(`${labels[lang].generated}: ${today}`, W - margin, 292, { align: 'right' });

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `CalAndLens_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ── Translations ─────────────────────────────────────────────────────────────
const labels = {
  tr: {
    subtitle: 'AI Besin Takip Uygulaması',
    weeklyReport: '7 Günlük Özet',
    dailyBreakdown: 'Günlük Kalori Grafiği',
    mealDetail: 'Günlük Detay Tablosu',
    avgCalories: 'Ort. Kalori',
    goal: 'Hedef',
    onTrack: 'Hedefe Ulaşılan',
    consistency: 'Tutarlılık',
    days: 'gün',
    date: 'Tarih',
    meals: 'Öğün',
    protein: 'Protein',
    carbs: 'Karbonhidrat',
    fat: 'Yağ',
    waterTitle: 'Su Takibi',
    totalWater: 'Toplam Su',
    avgWater: 'Günlük Ort.',
    waterGoal: 'Günlük Hedef',
    generated: 'Oluşturulma',
    stepsStreak: 'Adım & Seri',
    streakCurrent: 'Güncel Seri',
    streakBest: 'En İyi Seri',
    stepsTotal: 'Toplam Adım',
    stepsAvg: 'Günlük Ort. Adım',
  },
  en: {
    subtitle: 'AI Nutrition Tracker',
    weeklyReport: '7-Day Summary',
    dailyBreakdown: 'Daily Calorie Chart',
    mealDetail: 'Daily Detail Table',
    avgCalories: 'Avg. Calories',
    goal: 'Goal',
    onTrack: 'On Track',
    consistency: 'Consistency',
    days: 'days',
    date: 'Date',
    meals: 'Meals',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    waterTitle: 'Water Tracking',
    totalWater: 'Total Water',
    avgWater: 'Daily Avg.',
    waterGoal: 'Daily Goal',
    generated: 'Generated',
    stepsStreak: 'Steps & Streak',
    streakCurrent: 'Current Streak',
    streakBest: 'Best Streak',
    stepsTotal: 'Total Steps',
    stepsAvg: 'Daily Avg. Steps',
  },
  es: {
    subtitle: 'Seguimiento nutricional con IA',
    weeklyReport: 'Resumen de 7 días',
    dailyBreakdown: 'Gráfico de calorías',
    mealDetail: 'Tabla diaria',
    avgCalories: 'Cal. prom.',
    goal: 'Meta',
    onTrack: 'En objetivo',
    consistency: 'Consistencia',
    days: 'días',
    date: 'Fecha',
    meals: 'Comidas',
    protein: 'Proteína',
    carbs: 'Carbos',
    fat: 'Grasa',
    waterTitle: 'Agua',
    totalWater: 'Total',
    avgWater: 'Prom. diario',
    waterGoal: 'Meta diaria',
    generated: 'Generado',
    stepsStreak: 'Pasos y Racha',
    streakCurrent: 'Racha actual',
    streakBest: 'Mejor racha',
    stepsTotal: 'Total pasos',
    stepsAvg: 'Prom. diario pasos',
  },
  fr: {
    subtitle: 'Suivi nutritionnel par IA',
    weeklyReport: 'Résumé 7 jours',
    dailyBreakdown: 'Graphique calorique',
    mealDetail: 'Tableau journalier',
    avgCalories: 'Cal. moy.',
    goal: 'Objectif',
    onTrack: 'Dans l\'objectif',
    consistency: 'Régularité',
    days: 'jours',
    date: 'Date',
    meals: 'Repas',
    protein: 'Protéines',
    carbs: 'Glucides',
    fat: 'Lipides',
    waterTitle: 'Eau',
    totalWater: 'Total',
    avgWater: 'Moy. journalière',
    waterGoal: 'Objectif jour',
    generated: 'Généré le',
    stepsStreak: 'Pas & Série',
    streakCurrent: 'Série actuelle',
    streakBest: 'Meilleure série',
    stepsTotal: 'Total pas',
    stepsAvg: 'Moy. quotidienne pas',
  },
  de: {
    subtitle: 'KI-Ernährungstracker',
    weeklyReport: '7-Tage-Übersicht',
    dailyBreakdown: 'Tägliches Kaloriendiagramm',
    mealDetail: 'Tägliche Detailtabelle',
    avgCalories: 'Ø Kalorien',
    goal: 'Ziel',
    onTrack: 'Im Zielbereich',
    consistency: 'Beständigkeit',
    days: 'Tage',
    date: 'Datum',
    meals: 'Mahlzeiten',
    protein: 'Eiweiß',
    carbs: 'Kohlenhydrate',
    fat: 'Fett',
    waterTitle: 'Wasser',
    totalWater: 'Gesamt',
    avgWater: 'Tages-Ø',
    waterGoal: 'Tagesziel',
    generated: 'Erstellt am',
    stepsStreak: 'Schritte & Serie',
    streakCurrent: 'Aktuelle Serie',
    streakBest: 'Beste Serie',
    stepsTotal: 'Schritte gesamt',
    stepsAvg: 'Tages-Ø Schritte',
  },
  ar: {
    subtitle: 'تتبع التغذية بالذكاء الاصطناعي',
    weeklyReport: 'ملخص 7 أيام',
    dailyBreakdown: 'مخطط السعرات اليومية',
    mealDetail: 'جدول التفاصيل اليومية',
    avgCalories: 'متوسط السعرات',
    goal: 'الهدف',
    onTrack: 'في المسار',
    consistency: 'الانتظام',
    days: 'أيام',
    date: 'التاريخ',
    meals: 'الوجبات',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fat: 'دهون',
    waterTitle: 'تتبع الماء',
    totalWater: 'إجمالي الماء',
    avgWater: 'متوسط يومي',
    waterGoal: 'هدف يومي',
    generated: 'تم الإنشاء',
    stepsStreak: 'الخطوات والسلسلة',
    streakCurrent: 'السلسلة الحالية',
    streakBest: 'أفضل سلسلة',
    stepsTotal: 'إجمالي الخطوات',
    stepsAvg: 'متوسط الخطوات اليومية',
  },
  ru: {
    subtitle: 'ИИ трекер питания',
    weeklyReport: 'Отчёт за 7 дней',
    dailyBreakdown: 'График калорий',
    mealDetail: 'Детали по дням',
    avgCalories: 'Ср. калории',
    goal: 'Цель',
    onTrack: 'В норме',
    consistency: 'Регулярность',
    days: 'дней',
    date: 'Дата',
    meals: 'Приёмы',
    protein: 'Белки',
    carbs: 'Углеводы',
    fat: 'Жиры',
    waterTitle: 'Вода',
    totalWater: 'Итого',
    avgWater: 'Ср. в день',
    waterGoal: 'Дневная цель',
    generated: 'Создано',
    stepsStreak: 'Шаги и серия',
    streakCurrent: 'Текущая серия',
    streakBest: 'Лучшая серия',
    stepsTotal: 'Всего шагов',
    stepsAvg: 'Среднее шагов в день',
  },
};

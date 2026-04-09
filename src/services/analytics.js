const VISIT_KEY = 'cal_last_visit';

function getDeviceType() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Edge/i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  return 'Other';
}

export async function trackVisit() {
  try {
    const today = new Date().toDateString();
    if (localStorage.getItem(VISIT_KEY) === today) return;
    localStorage.setItem(VISIT_KEY, today);

    // Vercel Edge Function'a gönder — ülke bilgisi sunucu tarafında eklenir
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_type: getDeviceType(),
        browser:     getBrowser(),
        referrer:    document.referrer || 'direct',
      }),
    });
  } catch (_) {}
}

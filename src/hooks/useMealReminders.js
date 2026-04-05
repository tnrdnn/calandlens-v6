import { useEffect, useCallback } from 'react';

const REMINDERS = [
  { key: 'breakfast', hour: 8,  minute: 0  },
  { key: 'lunch',     hour: 12, minute: 0  },
  { key: 'dinner',    hour: 19, minute: 0  },
];

const STORAGE_KEY = 'calandlens_reminders_enabled';

export function getRemindersEnabled() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setRemindersEnabled(val) {
  localStorage.setItem(STORAGE_KEY, String(val));
}

// Calculate ms until next occurrence of hour:minute (today or tomorrow)
function msUntil(hour, minute) {
  const now  = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next - now;
}

let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function scheduleAll(t) {
  clearTimers();
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  REMINDERS.forEach(r => {
    const schedule = () => {
      const body = t(`meal.${r.key}`);
      new Notification('CalAndLens 🍽️', {
        body: `${body} ${t('reminders.time')}!`,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: `meal-${r.key}`,
      });
      // Reschedule for next day
      timers.push(setTimeout(schedule, 24 * 60 * 60 * 1000));
    };
    timers.push(setTimeout(schedule, msUntil(r.hour, r.minute)));
  });
}

export function useMealReminders(t) {
  const start = useCallback(() => {
    if (getRemindersEnabled()) scheduleAll(t);
  }, [t]);

  useEffect(() => {
    start();
    return clearTimers;
  }, [start]);

  const enable = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setRemindersEnabled(true);
      scheduleAll(t);
    }
    return perm;
  }, [t]);

  const disable = useCallback(() => {
    setRemindersEnabled(false);
    clearTimers();
  }, []);

  return { enable, disable };
}

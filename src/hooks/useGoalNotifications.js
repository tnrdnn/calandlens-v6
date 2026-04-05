import { useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY     = 'calandlens_goal_notif_enabled';
const FIRED_KEY       = 'calandlens_goal_notif_fired'; // { dateKey: { t80, t100, t120, evening } }

export function getGoalNotifsEnabled() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}
export function setGoalNotifsEnabled(val) {
  localStorage.setItem(STORAGE_KEY, String(val));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getFired() {
  try { return JSON.parse(localStorage.getItem(FIRED_KEY) || '{}'); } catch { return {}; }
}
function setFired(obj) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(obj));
}
function wasFired(tag) {
  const key = todayKey();
  return !!getFired()[key]?.[tag];
}
function markFired(tag) {
  const fired = getFired();
  const key = todayKey();
  fired[key] = { ...(fired[key] || {}), [tag]: true };
  setFired(fired);
}

function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted' && getGoalNotifsEnabled();
}

function send(title, body) {
  new Notification(title, { body, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png' });
}

// Called after every meal addition — fires at 80 / 100 / 120 % thresholds
export function fireGoalNotification(consumed, goal, t) {
  if (!canNotify()) return;
  const pct = consumed / goal;

  if (pct >= 1.2 && !wasFired('t120')) {
    markFired('t120');
    send('CalAndLens ⚠️', t('goal_notif.over_120'));
  } else if (pct >= 1.0 && !wasFired('t100')) {
    markFired('t100');
    send('CalAndLens 🎯', t('goal_notif.reached'));
  } else if (pct >= 0.8 && !wasFired('t80')) {
    markFired('t80');
    send('CalAndLens 💛', t('goal_notif.near_80'));
  }
}

let eveningTimer = null;

function clearEveningTimer() {
  if (eveningTimer) { clearTimeout(eveningTimer); eveningTimer = null; }
}

// Schedules evening check at 20:00 — fires if < 50% calories logged
function scheduleEvening(consumed, goal, t) {
  clearEveningTimer();
  if (!canNotify()) return;

  const now  = new Date();
  const fire = new Date();
  fire.setHours(20, 0, 0, 0);
  if (fire <= now) return; // already past 20:00 today

  const ms = fire - now;
  eveningTimer = setTimeout(() => {
    if (!canNotify()) return;
    if (wasFired('evening')) return;
    // Re-read storage at fire time — consumed may have changed
    const currentConsumed = consumed; // caller will update via re-render
    if (currentConsumed / goal < 0.5) {
      markFired('evening');
      send('CalAndLens 🌙', t('goal_notif.evening_low'));
    }
  }, ms);
}

export function useGoalNotifications(consumed, goal, t) {
  const prevConsumed = useRef(consumed);

  const enable = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setGoalNotifsEnabled(true);
    }
    return perm;
  }, []);

  const disable = useCallback(() => {
    setGoalNotifsEnabled(false);
    clearEveningTimer();
  }, []);

  // Schedule evening reminder once on mount (if enabled)
  useEffect(() => {
    if (getGoalNotifsEnabled()) {
      scheduleEvening(consumed, goal, t);
    }
    return clearEveningTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire threshold notification when consumed increases
  useEffect(() => {
    if (consumed > prevConsumed.current) {
      fireGoalNotification(consumed, goal, t);
    }
    prevConsumed.current = consumed;
  }, [consumed, goal, t]);

  return { enable, disable };
}

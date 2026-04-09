/**
 * PWA install detection hook.
 * - isMobile: true if user is on a phone/tablet
 * - isStandalone: true if already running as installed PWA
 * - isIOS: true if iOS (Safari, needs manual install steps)
 * - deferredPrompt: Android Chrome install prompt event (or null)
 * - triggerInstall(): fires the Android native install prompt
 * - dismissed: user has closed the guide banner
 * - dismiss(): save dismissal to localStorage
 */
import { useState, useEffect } from 'react';

const DISMISS_KEY = 'calandlens_pwa_dismissed';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem(DISMISS_KEY)
  );

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isIOS    = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') dismiss();
    return outcome === 'accepted';
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const showBanner = isMobile && !isStandalone && !dismissed;

  return { isMobile, isIOS, isStandalone, deferredPrompt, triggerInstall, dismissed, dismiss, showBanner };
}

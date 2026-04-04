import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import tr from '../locales/tr.json';
import en from '../locales/en.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

const LOCALES     = { tr, en, es, fr, de };
const SUPPORTED   = ['tr', 'en', 'es', 'fr', 'de'];
const STORAGE_KEY = 'calandlens_lang';

export const LANGUAGE_OPTIONS = [
  { code: 'tr', label: 'Türkçe',   flag: '🇹🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
];

function detectLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED.includes(saved)) return saved;
  const browser = (navigator.language || '').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : 'tr';
}

function deepGet(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => (acc != null ? acc[k] : null), obj);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = useCallback((code) => {
    if (!SUPPORTED.includes(code)) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
    document.documentElement.lang = code;
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const t = useCallback((key, vars = {}) => {
    const locale = LOCALES[lang] || LOCALES.tr;
    let val = deepGet(locale, key);
    if (val == null || typeof val !== 'string') val = deepGet(LOCALES.tr, key);
    if (val == null || typeof val !== 'string') return key;
    return val.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] != null ? vars[k] : `{{${k}}}`));
  }, [lang]);

  const tArr = useCallback((key) => {
    const locale = LOCALES[lang] || LOCALES.tr;
    const val = deepGet(locale, key);
    return Array.isArray(val) ? val : (deepGet(LOCALES.tr, key) || []);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tArr, LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside <LanguageProvider>');
  return ctx;
}

import { createContext, useContext, useEffect, useState } from 'react';
import translations from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('asc_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('asc_lang', lang);
  }, [lang]);

  const t = (key) => translations[key]?.[lang] ?? key;
  const toggleLang = () => setLang((l) => (l === 'en' ? 'te' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "@/lib/i18n/translations";

const STORAGE_KEY = "redihealth-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in translations) {
      // reading persisted preference after mount to avoid SSR/client hydration mismatch
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(stored as Lang);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

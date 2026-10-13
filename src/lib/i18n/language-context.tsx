"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { translations, type Lang, type Translations } from "@/lib/i18n/translations";
import { DEFAULT_LANG, LOCALE_COOKIE, getLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lang = getLangFromPathname(pathname) ?? DEFAULT_LANG;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE, lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    if (next === lang) return;
    const currentUrl = new URL(window.location.href);
    currentUrl.pathname = withLangPrefix(currentUrl.pathname, next);
    window.location.assign(currentUrl.toString());
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

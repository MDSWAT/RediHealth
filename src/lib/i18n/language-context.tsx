"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { translations, type Lang, type Translations } from "@/lib/i18n/translations";
import { DEFAULT_LANG, LOCALE_COOKIE, getLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lang = getLangFromPathname(pathname) ?? DEFAULT_LANG;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE, lang);
  }, [lang]);

  const setLang = (next: Lang) => {
    if (next === lang) return;
    router.push(withLangPrefix(pathname, next));
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

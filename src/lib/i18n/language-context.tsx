"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { translations, type Lang, type Translations } from "@/lib/i18n/translations";
import { DEFAULT_LANG, LOCALE_COOKIE, getLangFromPathname, isSupportedLang, withLangPrefix } from "@/lib/i18n/routing";
import {
  LOCALE_CHECKED_STORAGE_KEY,
  detectClientPreferredLocale,
  hasManualLocaleCookie,
  isAutomatedOrAuditUserAgent,
  markManualLocaleSelection,
} from "@/lib/i18n/locale-detection";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

function markLocaleChecked() {
  try {
    window.sessionStorage.setItem(LOCALE_CHECKED_STORAGE_KEY, "1");
  } catch {
    // Ignore storage failures in restricted browsing contexts.
  }
}

function redirectToLocale(nextLang: Lang) {
  const target = `${withLangPrefix(window.location.pathname, nextLang)}${window.location.search}${window.location.hash}`;
  window.location.replace(target);
}

/**
 * `requestLang` is the locale the server resolved for this request (the proxy puts it in a
 * header). The proxy rewrites /ro/about to /about, and usePathname() can return that rewritten
 * path on one side of hydration, which has no locale in it. Falling back to the request's
 * locale (instead of DEFAULT_LANG) keeps the server and client renders in the same language.
 */
export function LanguageProvider({ children, requestLang }: { children: ReactNode; requestLang?: Lang }) {
  const pathname = usePathname();
  const lang = getLangFromPathname(pathname) ?? requestLang ?? DEFAULT_LANG;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE, lang);
  }, [lang]);

  useEffect(() => {
    if (lang !== DEFAULT_LANG) return;
    if (hasManualLocaleCookie(document.cookie)) return;
    if (isAutomatedOrAuditUserAgent(navigator.userAgent, navigator.webdriver)) return;

    let alreadyChecked = false;
    try {
      alreadyChecked = window.sessionStorage.getItem(LOCALE_CHECKED_STORAGE_KEY) === "1";
    } catch {
      return;
    }
    if (alreadyChecked) return;

    let timeZone: string | undefined;
    try {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      timeZone = undefined;
    }

    const clientLanguages =
      navigator.languages && navigator.languages.length > 0
        ? navigator.languages
        : navigator.language
          ? [navigator.language]
          : undefined;

    const clientDetected = detectClientPreferredLocale({
      languages: clientLanguages,
      timeZone,
    });

    if (clientDetected && clientDetected !== DEFAULT_LANG) {
      markLocaleChecked();
      redirectToLocale(clientDetected);
      return;
    }

    const controller = new AbortController();
    fetch("/api/geo-locale", {
      method: "GET",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { lang?: unknown } | null) => {
        if (controller.signal.aborted) return;
        markLocaleChecked();
        if (!data || hasManualLocaleCookie(document.cookie)) return;
        if (typeof data.lang === "string" && isSupportedLang(data.lang) && data.lang !== DEFAULT_LANG) {
          redirectToLocale(data.lang);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          markLocaleChecked();
        }
      });

    return () => {
      controller.abort();
    };
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    markManualLocaleSelection();
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

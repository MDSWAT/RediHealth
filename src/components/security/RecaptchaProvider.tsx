"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { CaptchaAction } from "@/lib/security/recaptcha";

type RecaptchaApi = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: RecaptchaApi;
  }
}

const copy = {
  ru: {
    unavailable: "Проверка бота не работает. Перезагрузите страницу или напишите нам.",
    notice: "Защищено reCAPTCHA. Google",
    privacy: "Политика конфиденциальности",
    and: "и",
    terms: "Условия использования",
    apply: "применить.",
  },

  en: {
    unavailable: "The bot check is not working. Reload the page or write to us.",
    notice: "Protected by reCAPTCHA. Google's",
    privacy: "Privacy Policy",
    and: "and",
    terms: "Terms of Service",
    apply: "apply.",
  },
  ro: {
    unavailable: "Verificarea anti-roboți nu merge acum. Reîncarcă pagina sau scrie-ne.",
    notice: "Protejat de reCAPTCHA. Se aplică",
    privacy: "Politica de confidențialitate",
    and: "și",
    terms: "Termenii serviciului",
    apply: "Google.",
  },
  sq: {
    unavailable: "Kontrolli kundër robotëve nuk funksionon tani. Rifresko faqen ose na shkruaj.",
    notice: "Mbrojtur nga reCAPTCHA. Zbatohen",
    privacy: "Politika e privatësisë",
    and: "dhe",
    terms: "Kushtet e shërbimit",
    apply: "të Google.",
  },
  it: {
    unavailable: "Il controllo anti-bot non funziona. Ricarica la pagina o scrivici.",
    notice: "Protetto da reCAPTCHA. Si applicano",
    privacy: "l'Informativa sulla privacy",
    and: "e",
    terms: "i Termini di servizio",
    apply: "di Google.",
  },
  hr: {
    unavailable: "Provjera protiv robota trenutačno ne radi. Osvježi stranicu ili nam se javi.",
    notice: "Zaštićeno sustavom reCAPTCHA. Primjenjuju se",
    privacy: "pravila privatnosti",
    and: "i",
    terms: "uvjeti pružanja usluge",
    apply: "tvrtke Google.",
  },
  rom: {
    unavailable: "E dikhlipe mamuy roboturya na kerel buchi akana. Nevyar e rig vay lekhav amenge.",
    notice: "Arakhado katar reCAPTCHA. Labaren pes e",
    privacy: "garavipnaske pravila",
    and: "thaj",
    terms: "sluzhbake pravila",
    apply: "katar Google.",
  },
};

class CaptchaClientError extends Error {}

export function captchaErrorMessage(error: unknown, fallback: string): string {
  return error instanceof CaptchaClientError ? error.message : fallback;
}

const CaptchaContext = createContext<((action: CaptchaAction) => Promise<string>) | null>(null);
const CaptchaEnabledContext = createContext(false);

export function RecaptchaProvider({ children, nonce, enabled }: {
  children: ReactNode;
  nonce?: string;
  enabled: boolean;
}) {
  const { lang } = useLanguage();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const scriptFailed = useRef(false);

  const execute = useCallback(async (action: CaptchaAction): Promise<string> => {
    if (!enabled) return "";
    if (!siteKey || scriptFailed.current || !window.grecaptcha) {
      throw new CaptchaClientError(copy[lang].unavailable);
    }

    const api = window.grecaptcha;
    return new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new CaptchaClientError(copy[lang].unavailable)), 15_000);
      api.ready(() => {
        api.execute(siteKey, { action }).then((token) => {
          window.clearTimeout(timeout);
          if (token) resolve(token);
          else reject(new CaptchaClientError(copy[lang].unavailable));
        }, () => {
          window.clearTimeout(timeout);
          reject(new CaptchaClientError(copy[lang].unavailable));
        });
      });
    });
  }, [enabled, siteKey, lang]);

  return (
    <CaptchaContext.Provider value={execute}>
      <CaptchaEnabledContext.Provider value={enabled}>
      {enabled && siteKey ? (
        <Script
          id="google-recaptcha"
          src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`}
          nonce={nonce}
          strategy="afterInteractive"
          onError={() => { scriptFailed.current = true; }}
        />
      ) : null}
      {children}
      </CaptchaEnabledContext.Provider>
    </CaptchaContext.Provider>
  );
}

export function useRecaptcha() {
  const execute = useContext(CaptchaContext);
  if (!execute) throw new Error("useRecaptcha requires RecaptchaProvider");
  return execute;
}

export function RecaptchaNotice() {
  const { lang } = useLanguage();
  const enabled = useContext(CaptchaEnabledContext);
  if (!enabled) return null;
  const t = copy[lang];
  return (
    <p className="mt-4 text-xs text-muted-foreground">
      {t.notice}{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">{t.privacy}</a>{" "}
      {t.and}{" "}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">{t.terms}</a>{" "}
      {t.apply}
    </p>
  );
}

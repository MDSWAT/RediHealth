import { describe, expect, it } from "vitest";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { getCookiesDoc, getPrivacyDoc, getTermsDoc } from "@/lib/i18n/legal-docs-copy";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import type { Lang } from "@/lib/i18n/languages";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR, LEGAL_VERSION } from "@/lib/legal-config";
import {
  COOKIE_CONSENT_VERSION,
  parseCookieConsent,
} from "@/lib/privacy/cookie-consent";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

describe("legal config and cookie notice", () => {
  it("exposes confirmed REDI International operator details", () => {
    expect(LEGAL_VERSION).toBe("0.1");
    expect(LEGAL_OPERATOR.name).toBe("REDI International");
    expect(LEGAL_OPERATOR.streetAddress).toBe("44 Avenue des Jardins");
    expect(LEGAL_OPERATOR.bceNumber).toBe("0787330885");
    expect(LEGAL_OPERATOR.platformDomain).toBe("redi.healthcare");
  });

  it("parses valid cookie notice states and ignores invalid or outdated versions", () => {
    const raw = JSON.stringify({
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      updatedAt: "2026-11-20T06:00:00.000Z",
    });
    expect(parseCookieConsent(raw)).toEqual({
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      updatedAt: "2026-11-20T06:00:00.000Z",
    });
    expect(parseCookieConsent(encodeURIComponent(raw))?.necessary).toBe(true);
    expect(parseCookieConsent(JSON.stringify({ version: "0.0", necessary: true, updatedAt: "x" }))).toBeNull();
    expect(parseCookieConsent("not-json")).toBeNull();
  });

  it("keeps cookie notice button copy short, sentence-cased and free of ampersands across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = cookieConsentCopy[lang];
      const buttons = [copy.acknowledge, copy.openSettings, copy.footerSettingsLink];
      for (const label of buttons) {
        expect(label.length, `${lang}: "${label}" exceeds 28 chars`).toBeLessThanOrEqual(28);
        expect(/^\p{Lu}/u.test(label), `${lang}: "${label}" should start uppercase`).toBe(true);
        expect(label, `${lang}: "${label}" must not contain "&"`).not.toContain("&");
      }
      expect(LEGAL_EFFECTIVE_DATE[lang]).toBeTruthy();
    }
  });

  it("ships complete legal documents with no draft placeholders and no Meta Pixel mentions across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const bundle = JSON.stringify({
        legal: getLegalCopy(lang),
        terms: getTermsDoc(lang),
        privacy: getPrivacyDoc(lang),
        cookies: getCookiesDoc(lang),
        cookieBanner: cookieConsentCopy[lang],
      });
      expect(bundle).toContain("REDI International");
      expect(bundle).toContain("0787330885");
      expect(bundle).not.toMatch(/\[DE VALIDAT|\[DE VERIFICAT|\[EMAIL |\[FURNIZOR|\[ANALYTICS|\[DATA INTR/);
      expect(bundle).not.toMatch(/meta\s*pixel|2195130208072639|fbevents|facebook|_fbp|_fbc/i);
      expect(bundle).not.toContain(" & ");
    }
  });
});

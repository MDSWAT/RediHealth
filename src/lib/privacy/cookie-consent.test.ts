import { describe, expect, it } from "vitest";
import { cookieConsentCopy } from "@/components/security/cookie-consent-copy";
import { getCookiesDoc, getPrivacyDoc, getTermsDoc } from "@/lib/i18n/legal-docs-copy";
import { getLegalCopy } from "@/lib/i18n/legal-translations";
import type { Lang } from "@/lib/i18n/languages";
import { LEGAL_EFFECTIVE_DATE, LEGAL_OPERATOR, LEGAL_VERSION, META_PIXEL_ID } from "@/lib/legal-config";
import {
  COOKIE_CONSENT_VERSION,
  isMetaPixelAllowedPath,
  parseCookieConsent,
} from "@/lib/privacy/cookie-consent";

const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

describe("legal config and Meta Pixel safeguards", () => {
  it("exposes confirmed REDI International operator details and Meta Pixel ID", () => {
    expect(LEGAL_VERSION).toBe("0.1");
    expect(LEGAL_OPERATOR.name).toBe("REDI International");
    expect(LEGAL_OPERATOR.streetAddress).toBe("44 Avenue des Jardins");
    expect(LEGAL_OPERATOR.bceNumber).toBe("0787330885");
    expect(LEGAL_OPERATOR.platformDomain).toBe("redi.healthcare");
    expect(META_PIXEL_ID).toBe("2195130208072639");
  });

  it("blocks Meta Pixel on all sensitive health, consultation, account and staff routes", () => {
    const blocked = [
      "/health-check",
      "/health-check/note",
      "/health-assistant",
      "/ai-assistant",
      "/prescription-review",
      "/get-help",
      "/medic-online/meet/room-1",
      "/medic-online/asteptare",
      "/medic-online/asteptare/token-1",
      "/medic-online/programare",
      "/contul-meu",
      "/patient-portal",
      "/patient-portal/secret-token",
      "/sign-in",
      "/panel",
      "/panel/patients",
      "/demo",
      "/offline",
    ];
    for (const path of blocked) {
      expect(isMetaPixelAllowedPath(path), `expected ${path} to be blocked`).toBe(false);
    }
  });

  it("allows Meta Pixel on public informational routes once consented", () => {
    const allowed = [
      "/",
      "/about",
      "/contact",
      "/privacy",
      "/cookies",
      "/terms",
      "/accessibility",
      "/health-information",
      "/health-information/articles/fever",
      "/find-help",
      "/medic-online",
      "/mediatori",
      "/stiri",
      "/news",
    ];
    for (const path of allowed) {
      expect(isMetaPixelAllowedPath(path), `expected ${path} to be allowed`).toBe(true);
    }
  });

  it("parses valid consent cookies and ignores invalid or outdated versions", () => {
    const raw = JSON.stringify({
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      marketing: true,
      updatedAt: "2026-11-20T06:00:00.000Z",
    });
    expect(parseCookieConsent(raw)).toEqual({
      version: COOKIE_CONSENT_VERSION,
      necessary: true,
      marketing: true,
      updatedAt: "2026-11-20T06:00:00.000Z",
    });
    expect(parseCookieConsent(encodeURIComponent(raw))?.marketing).toBe(true);
    expect(parseCookieConsent(JSON.stringify({ version: "0.0", necessary: true, marketing: true, updatedAt: "x" }))).toBeNull();
    expect(parseCookieConsent("not-json")).toBeNull();
  });

  it("keeps cookie banner button copy short, sentence-cased and free of ampersands across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const copy = cookieConsentCopy[lang];
      const buttons = [copy.necessaryOnly, copy.acceptAll, copy.openSettings, copy.saveChoices, copy.footerSettingsLink];
      for (const label of buttons) {
        expect(label.length, `${lang}: "${label}" exceeds 28 chars`).toBeLessThanOrEqual(28);
        expect(/^\p{Lu}/u.test(label), `${lang}: "${label}" should start uppercase`).toBe(true);
        expect(label, `${lang}: "${label}" must not contain "&"`).not.toContain("&");
      }
      expect(LEGAL_EFFECTIVE_DATE[lang]).toBeTruthy();
    }
  });

  it("ships complete legal documents with no draft placeholders across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const bundle = JSON.stringify({
        legal: getLegalCopy(lang),
        terms: getTermsDoc(lang),
        privacy: getPrivacyDoc(lang),
        cookies: getCookiesDoc(lang),
      });
      expect(bundle).toContain("REDI International");
      expect(bundle).toContain("0787330885");
      expect(bundle).toContain("2195130208072639");
      expect(bundle).not.toMatch(/\[DE VALIDAT|\[DE VERIFICAT|\[EMAIL |\[FURNIZOR|\[ANALYTICS|\[DATA INTR/);
      expect(bundle).not.toContain(" & ");
    }
  });
});

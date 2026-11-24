import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { COUNTRY_LABELS, SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import { COUNTRY_AREAS, getAreaFieldCopy } from "@/lib/country-areas";
import { LanguageContext } from "@/lib/i18n/language-context";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { languages, translations, type Lang } from "@/lib/i18n/translations";

const SUPPORTED_LANGS: Lang[] = languages.map((item) => item.code);
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";
import { MediatorAccompanimentTimeline } from "./MediatorAccompanimentTimeline";
import {
  buildCallbackPayload,
  callbackStarterCopy,
  isValidCallbackPhone,
  MediatorCallbackStarter,
  normalizeCallbackPhone,
  submitCallbackStarter,
  validateCallbackStarter,
} from "./MediatorCallbackStarter";
import { heroCopy, MediatorPublicHero } from "./MediatorPublicHero";
import {
  mediatorPageCopy,
  mediatorPageDescriptions,
  mediatorStaffStripCopy,
  mediatorTimelineCopy,
} from "./mediator-page-copy";

const mockedHeaderState = vi.hoisted(() => ({ lang: "ro" as string }));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-redihealth-lang": mockedHeaderState.lang }),
  cookies: async () => ({
    get: () => undefined,
  }),
}));

import MediatoriPublicPage from "@/app/mediatori/page";

const RecaptchaBox = RecaptchaProvider as ComponentType<{
  enabled: boolean;
  nonce?: string;
  children?: ReactNode;
}>;

function renderWithProviders(lang: Lang, node: ReturnType<typeof createElement>) {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      createElement(RecaptchaBox, { enabled: false }, node),
    ),
  );
}

describe("MediatorCallbackStarter under RecaptchaProvider (enabled: false)", () => {
  it.each(SUPPORTED_LANGS)("renders country selector, accessible area, phone, consent, and single-line CTA in %s", (lang) => {
    const html = renderWithProviders(
      lang,
      createElement(MediatorCallbackStarter, { lang, country: "RO", countries: [...SUPPORTED_COUNTRIES] }),
    );
    const copy = callbackStarterCopy[lang];

    expect(html).toContain('id="solicita-heading"');
    expect(html).toContain(copy.title);
    expect(html).toContain('name="country"');
    expect(html).toContain('name="county"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('type="tel"');
    expect(html).toContain('name="name"');
    expect(html).toContain('name="privacyConsent"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain(`href="${withLangPrefix("/privacy", lang)}"`);
    expect(html).toContain(`href="${withLangPrefix("/get-help?mode=mediator", lang)}"`);
    expect(html).toContain('type="submit"');
    expect(html).toContain("min-h-12");
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain(copy.submit);

    for (const code of SUPPORTED_COUNTRIES) {
      expect(html).toContain(`value="${code}"`);
      expect(html).toContain(COUNTRY_LABELS[code][lang]);
    }

    for (const county of ROMANIAN_COUNTIES) {
      expect(html).toContain(`value="${county}"`);
    }
  });

  it.each(SUPPORTED_COUNTRIES)("renders administrative areas for %s while keeping country selector, phone, and consent", (code) => {
    const html = renderWithProviders(
      "en",
      createElement(MediatorCallbackStarter, { lang: "en", country: code, countries: [...SUPPORTED_COUNTRIES] }),
    );

    expect(html).toContain('name="country"');
    expect(html).toContain('name="county"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="privacyConsent"');
    for (const area of COUNTRY_AREAS[code]) {
      expect(html).toContain(`value="${area.replace(/'/g, "&#x27;")}"`);
    }
  });
});

describe("MediatorCallbackStarter validation and /api/medical-help-requests submission", () => {
  it("normalizes and validates phone numbers cleanly", () => {
    expect(normalizeCallbackPhone(" +40 (721) 000-111 ")).toBe("+40721000111");
    expect(isValidCallbackPhone("0721 000 111")).toBe(true);
    expect(isValidCallbackPhone("+40 721 000 111")).toBe(true);
    expect(isValidCallbackPhone("0721")).toBe(false);
    expect(isValidCallbackPhone("0721 abc 111")).toBe(false);
    expect(isValidCallbackPhone("1".repeat(16))).toBe(false);
  });

  it("returns localized field errors for invalid area, phone, and unchecked consent across all countries", () => {
    const roErrors = validateCallbackStarter(
      { county: "", phone: "123", privacyConsent: false, country: "RO" },
      callbackStarterCopy.ro,
      "ro",
    );
    expect(roErrors.county).toBe(getAreaFieldCopy("RO", "ro").error);
    expect(roErrors.phone).toBe(callbackStarterCopy.ro.phoneError);
    expect(roErrors.privacyConsent).toBe(callbackStarterCopy.ro.privacyConsentError);

    const invalidCounty = validateCallbackStarter(
      { county: "UnknownCounty", phone: "0721000111", privacyConsent: true, country: "RO" },
      callbackStarterCopy.en,
      "en",
    );
    expect(invalidCounty.county).toBe(getAreaFieldCopy("RO", "en").error);
    expect(invalidCounty.phone).toBeUndefined();
    expect(invalidCounty.privacyConsent).toBeUndefined();

    const mismatchedArea = validateCallbackStarter(
      { county: "Cluj", phone: "+355 69 200 0000", privacyConsent: true, country: "AL" },
      callbackStarterCopy.sq,
      "sq",
    );
    expect(mismatchedArea.county).toBe(getAreaFieldCopy("AL", "sq").error);

    const validAreas: Record<CountryCode, string> = {
      RO: "Cluj",
      AL: "Tiranë",
      IT: "Lazio",
      MD: "Chișinău",
      HR: "Grad Zagreb",
    };
    for (const [country, county] of Object.entries(validAreas) as [CountryCode, string][]) {
      const res = validateCallbackStarter(
        { county, phone: "+40 721 000 111", privacyConsent: true, country },
        callbackStarterCopy.en,
        "en",
      );
      expect(res, country).toEqual({});
    }
  });

  it("builds the exact /api/medical-help-requests payload with valid area and country", () => {
    const payload = buildCallbackPayload({
      name: "  Maria I.  ",
      phone: " 0721 000 111 ",
      county: "Cluj",
      country: "RO",
      lang: "ro",
      captchaToken: "tok_123",
    });

    expect(payload).toEqual({
      name: "Maria I.",
      phone: "0721000111",
      description: "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Cluj, RO, limba: ro)",
      country: "RO",
      county: "Cluj",
      privacyConsent: true,
      captchaToken: "tok_123",
    });
    expect(payload.description.length).toBeGreaterThanOrEqual(10);
    expect(SUPPORTED_COUNTRIES).toContain(payload.country);

    const albaniaPayload = buildCallbackPayload({
      name: "Arben D.",
      phone: "+355 69 200 0000",
      county: "Tiranë",
      country: "AL",
      lang: "sq",
      captchaToken: "tok_456",
    });
    expect(albaniaPayload).toEqual({
      name: "Arben D.",
      phone: "+355692000000",
      description: "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Tiranë, AL, limba: sq)",
      country: "AL",
      county: "Tiranë",
      privacyConsent: true,
      captchaToken: "tok_456",
    });

    // A one-tap reason is added for the mediator in Romanian, whatever language the form is in.
    const withReason = buildCallbackPayload({
      name: "",
      phone: "0721000111",
      county: "Cluj",
      country: "RO",
      lang: "hr",
      captchaToken: "tok_123",
      reason: 1,
    });
    expect(withReason.description).toBe(
      "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Cluj, RO, limba: hr, nevoie: acte și asigurare)",
    );
  });

  it("executes help_request reCAPTCHA and posts payload with REQUEST_LANG_HEADER", async () => {
    const executeCaptcha = vi.fn().mockResolvedValue("captcha-token-abc");
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, email_sent: true }), { status: 201 }),
    );

    const result = await submitCallbackStarter({
      name: "Ion P.",
      phone: "0722 333 444",
      county: "Bihor",
      country: "RO",
      lang: "en",
      executeCaptcha,
      fetchImpl,
    });

    expect(result).toEqual({ ok: true });
    expect(executeCaptcha).toHaveBeenCalledWith("help_request");
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/medical-help-requests");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      [REQUEST_LANG_HEADER]: "en",
    });
    expect(JSON.parse(String(init.body))).toEqual({
      name: "Ion P.",
      phone: "0722333444",
      description: "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Bihor, RO, limba: en)",
      country: "RO",
      county: "Bihor",
      privacyConsent: true,
      captchaToken: "captcha-token-abc",
    });
  });

  it("handles 429 rate-limit, 400 validation errors, and captcha errors cleanly", async () => {
    const rateLimited = await submitCallbackStarter({
      name: "",
      phone: "0722333444",
      county: "Bihor",
      country: "RO",
      lang: "ro",
      executeCaptcha: vi.fn().mockResolvedValue(""),
      fetchImpl: vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Too many" }), { status: 429 })),
    });
    expect(rateLimited).toEqual({ ok: false, kind: "rate_limit" });

    const serverError = await submitCallbackStarter({
      name: "",
      phone: "0722333444",
      county: "Bihor",
      country: "RO",
      lang: "ro",
      executeCaptcha: vi.fn().mockResolvedValue(""),
      fetchImpl: vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "Bad request" }), { status: 400 })),
    });
    expect(serverError).toEqual({ ok: false, kind: "error" });

    const boom = new Error("Verification failed");
    const captchaFailure = await submitCallbackStarter({
      name: "",
      phone: "0722333444",
      county: "Bihor",
      country: "RO",
      lang: "ro",
      executeCaptcha: vi.fn().mockRejectedValue(boom),
      fetchImpl: vi.fn(),
    });
    expect(captchaFailure).toEqual({ ok: false, kind: "error", error: boom });
  });
});

describe("/mediatori page layout, accompaniment timeline, and calm patient hero", () => {
  it.each(SUPPORTED_LANGS)("renders hero, #solicita starter with its limits, no repeated timeline, and subtle bottom sign-in strip in %s", async (lang) => {
    mockedHeaderState.lang = lang;
    const element = await MediatoriPublicPage();
    const html = renderWithProviders(lang, element);

    const callbackAnchorHref = 'href="#solicita"';
    const solicitaId = 'id="solicita"';
    const signInHref = `href="${withLangPrefix("/sign-in", lang)}"`;

    expect(html).toContain(heroCopy[lang].title);
    expect(html).toContain(callbackAnchorHref);

    // The three-step timeline repeated the hero and the form lead, so the page no longer shows it.
    expect(html).not.toContain(mediatorTimelineCopy[lang].title);
    expect(html).not.toContain("bg-amber-care-soft/55");

    // Before sending: when the call comes, and what a mediator does not do.
    const starter = callbackStarterCopy[lang];
    expect(html).toContain(starter.lead);
    expect(html).toContain(starter.limitsTitle);
    expect(html).toContain(starter.limitAdvice);
    expect(html).toContain(starter.limitAvailability);
    expect(html).toContain(starter.successNotice.replace(/'/g, "&#x27;"));
    for (const option of starter.reasonOptions) {
      expect(html).toContain(`>${option}</button>`);
    }

    // Patient callback starter comes immediately after hero & sign-in strip at the bottom.
    expect(html).toContain(solicitaId);
    expect(html).toContain(mediatorStaffStripCopy[lang].prompt);
    expect(html).toContain(mediatorStaffStripCopy[lang].signIn);
    expect(html).toContain(signInHref);

    const heroEnd = html.indexOf("</section>");
    const signInIndex = html.indexOf(signInHref);
    const solicitaIndex = html.indexOf(solicitaId);
    expect(heroEnd).toBeGreaterThan(-1);
    expect(html.slice(0, heroEnd)).not.toContain("/get-help?mode=mediator");
    expect(solicitaIndex).toBeGreaterThan(heroEnd);
    expect(signInIndex).toBeGreaterThan(solicitaIndex);

    for (const code of SUPPORTED_COUNTRIES) {
      expect(html).toContain(`value="${code}"`);
    }
    const expectedSelectedByLang: Record<Lang, CountryCode> = {
      ro: "RO",
      en: "RO",
      rom: "RO",
      sq: "AL",
      it: "IT",
      hr: "HR",
      ru: "MD",
    };
    const expectedCountry = expectedSelectedByLang[lang];
    expect(html).toMatch(new RegExp(`<option value="${expectedCountry}"[^>]*selected`));
  });

  it("keeps MediatorPublicHero free of /sign-in chrome and /get-help detours", () => {
    for (const lang of SUPPORTED_LANGS) {
      const heroHtml = renderWithProviders(lang, createElement(MediatorPublicHero, { lang }));
      expect(heroHtml).not.toContain("/sign-in");
      expect(heroHtml).not.toContain("/get-help?mode=mediator");
      expect(heroHtml).toContain('href="#solicita"');
      expect(heroHtml).toContain(heroCopy[lang].ctaCallback);
    }
  });

  it("renders MediatorAccompanimentTimeline cleanly with zero status dots or rounded-full", () => {
    const timelineHtml = renderToStaticMarkup(createElement(MediatorAccompanimentTimeline, { lang: "en" }));
    expect(timelineHtml).toContain("<ol");
    expect(timelineHtml.match(/<li\b/g)?.length).toBe(3);
    expect(timelineHtml).not.toContain("rounded-full");
    expect(timelineHtml).not.toMatch(/>0[123]</);
  });
});

describe("mediator localization, casing, and UI source invariants across all 7 locales", () => {
  it("keeps all copy dictionaries complete across 7 locales with clean punctuation and no ndërmjetës", () => {
    for (const lang of SUPPORTED_LANGS) {
      const hero = heroCopy[lang];
      const timeline = mediatorTimelineCopy[lang];
      const staff = mediatorStaffStripCopy[lang];
      const starter = callbackStarterCopy[lang];
      const page = mediatorPageCopy[lang];
      const desc = mediatorPageDescriptions[lang];

      const strings: string[] = [
        desc,
        page.whoIsTitle,
        page.whoIsDesc,
        ...page.bullets,
        hero.title,
        hero.subtitle,
        hero.ctaCallback,
        hero.card1Title,
        hero.card1Desc,
        hero.card2Title,
        hero.card2Desc,
        hero.card3Title,
        hero.card3Desc,
        timeline.title,
        timeline.lead,
        ...timeline.steps.flatMap((s) => [s.title, s.body]),
        staff.regionLabel,
        staff.prompt,
        staff.signIn,
        starter.title,
        starter.lead,
        starter.limitsTitle,
        starter.limitAdvice,
        starter.limitAvailability,
        starter.reasonLabel,
        ...starter.reasonOptions,
        starter.reassurance,
        starter.fullFormPrompt,
        starter.fullFormLink,
        starter.countyLabel,
        starter.countyPlaceholder,
        starter.countyError,
        starter.phoneLabel,
        starter.phonePlaceholder,
        starter.phoneHint,
        starter.phoneError,
        starter.nameLabel,
        starter.optionalTag,
        starter.namePlaceholder,
        starter.privacyConsent,
        starter.privacyPolicyLabel,
        starter.privacyConsentError,
        starter.submit,
        starter.submitting,
        starter.genericError,
        starter.rateLimitError,
        starter.successTitle,
        starter.successBody("Cluj", "0721000111"),
        starter.successNotice,
        starter.sendAnother,
      ];

      for (const value of strings) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value).not.toContain("&");
        expect(value).not.toContain("·");
        if (lang === "sq") {
          expect(value.toLowerCase()).not.toContain("ndërmjetës");
        }
      }

      // Single-line CTA labels must start uppercase and stay concise across all 7 locales.
      const buttonLabels = [
        hero.ctaCallback,
        starter.submit,
        starter.submitting,
        starter.sendAnother,
        starter.fullFormLink,
        staff.signIn,
        ...starter.reasonOptions,
      ];
      for (const label of buttonLabels) {
        expect(label).toMatch(/^\p{Lu}/u);
        expect(label.length).toBeLessThanOrEqual(28);
      }
    }
  });

  it("enforces file-level design system invariants on touched mediator files", () => {
    const files = [
      path.join(process.cwd(), "src/app/mediatori/page.tsx"),
      path.join(process.cwd(), "src/components/mediator/MediatorPublicHero.tsx"),
      path.join(process.cwd(), "src/components/mediator/MediatorAccompanimentTimeline.tsx"),
      path.join(process.cwd(), "src/components/mediator/MediatorCallbackStarter.tsx"),
      path.join(process.cwd(), "src/components/mediator/mediator-page-copy.ts"),
    ];

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf8");
      expect(source).not.toContain("rounded-full");
      expect(source).not.toContain("transition-all");
      expect(source).not.toContain("tracking-widest");
      expect(source).not.toContain("uppercase");
      expect(source).not.toContain(" · ");
      expect(source).not.toContain("ArrowRightIcon");
      expect(source).not.toContain("Reveal");
      expect(source).not.toMatch(/animate-(pulse|ping)/);
      expect(source).not.toMatch(/border-l-[24]/);
    }

    const heroSource = readFileSync(
      path.join(process.cwd(), "src/components/mediator/MediatorPublicHero.tsx"),
      "utf8",
    );
    expect(heroSource).not.toContain("md:grid-cols-3");
    expect(heroSource).not.toMatch(/"0[123]"/);

    const starterSource = readFileSync(
      path.join(process.cwd(), "src/components/mediator/MediatorCallbackStarter.tsx"),
      "utf8",
    );
    expect(starterSource).toContain('aria-invalid={Boolean(errors.county)}');
    expect(starterSource).toContain('aria-invalid={Boolean(errors.phone)}');
    expect(starterSource).toContain('aria-invalid={Boolean(errors.privacyConsent)}');
    expect(starterSource).toContain('role="alert"');
    expect(starterSource).toContain('role="status"');
    expect(starterSource).toContain("aria-busy={isSubmitting}");
  });
});

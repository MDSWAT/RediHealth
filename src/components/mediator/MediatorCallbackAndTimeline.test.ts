import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";
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
  it.each(SUPPORTED_LANGS)("renders accessible county, phone, consent, and single-line CTA in %s", (lang) => {
    const html = renderWithProviders(
      lang,
      createElement(MediatorCallbackStarter, { lang, country: "RO" }),
    );
    const copy = callbackStarterCopy[lang];

    expect(html).toContain('id="solicita-heading"');
    expect(html).toContain(copy.title);
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

    for (const county of ROMANIAN_COUNTIES) {
      expect(html).toContain(`value="${county}"`);
    }
  });

  it("omits county selector for non-RO countries while keeping phone and consent", () => {
    const html = renderWithProviders(
      "sq",
      createElement(MediatorCallbackStarter, { lang: "sq", country: "AL" }),
    );

    expect(html).not.toContain('name="county"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('name="privacyConsent"');
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

  it("returns localized field errors for invalid county, phone, and unchecked consent", () => {
    const roErrors = validateCallbackStarter(
      { county: "", phone: "123", privacyConsent: false, country: "RO" },
      callbackStarterCopy.ro,
    );
    expect(roErrors.county).toBe(callbackStarterCopy.ro.countyError);
    expect(roErrors.phone).toBe(callbackStarterCopy.ro.phoneError);
    expect(roErrors.privacyConsent).toBe(callbackStarterCopy.ro.privacyConsentError);

    const invalidCounty = validateCallbackStarter(
      { county: "UnknownCounty", phone: "0721000111", privacyConsent: true, country: "RO" },
      callbackStarterCopy.en,
    );
    expect(invalidCounty.county).toBe(callbackStarterCopy.en.countyError);
    expect(invalidCounty.phone).toBeUndefined();
    expect(invalidCounty.privacyConsent).toBeUndefined();

    const nonRoValid = validateCallbackStarter(
      { county: "", phone: "+355 69 200 0000", privacyConsent: true, country: "AL" },
      callbackStarterCopy.sq,
    );
    expect(nonRoValid).toEqual({});
  });

  it("builds the exact /api/medical-help-requests payload with valid Romanian county and description >= 10 chars", () => {
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
      description: "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Cluj, limba: ro)",
      country: "RO",
      county: "Cluj",
      privacyConsent: true,
      captchaToken: "tok_123",
    });
    expect(payload.description.length).toBeGreaterThanOrEqual(10);
    expect(SUPPORTED_COUNTRIES).toContain(payload.country);
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
      description: "Solicitare apel mediator sanitar din /mediatori#solicita (Zona: Bihor, limba: en)",
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
  it.each(SUPPORTED_LANGS)("renders hero, warm 3-step timeline, #solicita starter, and quiet bottom sign-in strip in %s", async (lang) => {
    mockedHeaderState.lang = lang;
    const element = await MediatoriPublicPage();
    const html = renderWithProviders(lang, element);

    const requestHref = `href="${withLangPrefix("/get-help?mode=mediator", lang)}"`;
    const callbackAnchorHref = 'href="#solicita"';
    const solicitaId = 'id="solicita"';
    const signInHref = `href="${withLangPrefix("/sign-in", lang)}"`;

    expect(html).toContain(heroCopy[lang].title);
    expect(html).toContain(requestHref);
    expect(html).toContain(callbackAnchorHref);

    // Accompaniment timeline tokens and 3 numbered steps without decorative prefixes.
    expect(html).toContain("bg-amber-care-soft/55");
    expect(html).toContain("border-amber-care-border");
    expect(html).toContain(mediatorTimelineCopy[lang].title);
    for (const step of mediatorTimelineCopy[lang].steps) {
      expect(html).toContain(step.title);
      expect(html).toContain(step.body);
    }
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).toContain(">3<");

    // Patient callback starter & quiet bottom staff strip ordering.
    expect(html).toContain(solicitaId);
    expect(html).toContain(mediatorStaffStripCopy[lang].prompt);
    expect(html).toContain(mediatorStaffStripCopy[lang].signIn);
    expect(html).toContain(signInHref);

    const heroEnd = html.indexOf("</section>");
    const signInIndex = html.indexOf(signInHref);
    const solicitaIndex = html.indexOf(solicitaId);
    expect(heroEnd).toBeGreaterThan(-1);
    expect(solicitaIndex).toBeGreaterThan(heroEnd);
    expect(signInIndex).toBeGreaterThan(solicitaIndex);
  });

  it("keeps MediatorPublicHero free of /sign-in chrome", () => {
    for (const lang of SUPPORTED_LANGS) {
      const heroHtml = renderWithProviders(lang, createElement(MediatorPublicHero, { lang }));
      expect(heroHtml).not.toContain("/sign-in");
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
        hero.ctaRequest,
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
        hero.ctaRequest,
        hero.ctaCallback,
        starter.submit,
        starter.submitting,
        starter.sendAnother,
        starter.fullFormLink,
        staff.signIn,
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
    }

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

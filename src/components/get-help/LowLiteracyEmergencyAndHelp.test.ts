import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  QUICK_HELP_TOPICS,
  buildRequestDescription,
  normalizeHelpPhone,
} from "@/components/get-help/RequestHelpForm";
import { signsAudioCopy } from "@/components/emergency/EmergencySignsModal";
import NotFound from "@/app/not-found";
import { LanguageContext } from "@/lib/i18n/language-context";
import { RecaptchaProvider } from "@/components/security/RecaptchaProvider";
import { GetHelpPageContent } from "@/components/get-help/GetHelpPageContent";
import { MediatorPublicHero } from "@/components/mediator/MediatorPublicHero";
import { translations, type Lang } from "@/lib/i18n/translations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const root = join(__dirname, "..", "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

function startsUpper(s: string) {
  const first = s.charAt(0);
  return first === first.toUpperCase();
}

describe("Scenario 4: emergency signs modal", () => {
  it("has localized sentence-case listen and stop labels", () => {
    for (const lang of LANGS) {
      const c = signsAudioCopy[lang];
      expect(c.listen.length).toBeGreaterThan(2);
      expect(c.stop.length).toBeGreaterThan(2);
      expect(c.listen).not.toContain("&");
      expect(startsUpper(c.listen)).toBe(true);
      expect(startsUpper(c.stop)).toBe(true);
    }
    expect(signsAudioCopy.sq.listen).toBe("Dëgjo shenjat");
  });

  it("uses large touch targets, number badges and no pills", () => {
    const modal = read("components/emergency/EmergencySignsModal.tsx");
    const gate = read("components/emergency/EmergencyDialerGate.tsx");
    expect(modal).toContain("useReadAloud");
    expect(modal).toContain("h-11 w-11");
    expect(modal).not.toContain("h-10 w-10");
    expect(modal).toContain("min-h-14");
    expect(modal).toContain("tabular-nums");
    expect(modal).not.toContain("rounded-full");
    const button = read("components/ui/Button.tsx");
    expect(gate).toContain("h-11 w-11");
    expect(gate).not.toContain("h-10 w-10");
    expect(gate).toContain("<Button");
    expect(gate).toContain('size="lg"');
    expect(button).toContain("min-h-12");
    expect(button).toContain("whitespace-nowrap");
    expect(gate).not.toContain("rounded-full");
  });
});

describe("Scenario 5: callback request without free text", () => {
  it("offers five quick topics per language, each valid for the API", () => {
    for (const lang of LANGS) {
      const topics = QUICK_HELP_TOPICS[lang];
      expect(topics).toHaveLength(5);
      for (const topic of topics) {
        expect(topic.text.length).toBeGreaterThanOrEqual(20);
        expect(topic.label).not.toContain("&");
        expect(startsUpper(topic.label)).toBe(true);
      }
    }
  });

  it("pads short descriptions so the server accepts them", () => {
    for (const lang of LANGS) {
      expect(buildRequestDescription("febra", lang).length).toBeGreaterThanOrEqual(10);
      expect(buildRequestDescription("  durere  ", lang)).toContain("durere");
    }
    expect(buildRequestDescription("  durere mare de cap  ", "ro")).toBe("durere mare de cap");
  });

  it("normalizes phone numbers", () => {
    expect(normalizeHelpPhone(" (0721) 000.000 ")).toBe("0721000000");
    expect(normalizeHelpPhone("+40 721-000-000")).toBe("+40721000000");
  });

  it("page content has square step badges, page-header listen button, and a 112 button", () => {
    const page = read("components/get-help/GetHelpPageContent.tsx");
    expect(page).not.toContain("rounded-full");
    expect(page).toContain("EmergencyDialerGate");
    expect(page).toContain("useReadAloud");
    expect(page).toContain("ListenButton");
    expect(page).toContain("tabular-nums");
    const form = read("components/get-help/RequestHelpForm.tsx");
    expect(form).not.toContain("useReadAloud");
    expect(form).not.toContain("rounded-full");
  });
});

describe("Scenario 6: 404 rescue actions", () => {
  it("renders search, assistant, doctor and find-help actions", () => {
    const html = renderToStaticMarkup(createElement(NotFound));
    expect(html).toContain("/health-assistant");
    expect(html).toContain("/medic-online");
    expect(html).toContain("/find-help");
    expect(html).toContain("<button");
    expect(html).not.toContain("&amp;");
  });

  it("source keeps rescue contracts", () => {
    const src = read("app/not-found.tsx");
    const button = read("components/ui/Button.tsx");
    expect(src).toContain("openSmartSearch");
    expect(src).toContain("<Button");
    expect(src).toContain('size="lg"');
    expect(button).toContain("min-h-12");
    expect(button).toContain("whitespace-nowrap");
    for (const lang of LANGS) expect(src).toContain(`${lang}: {`);
    expect(src).not.toContain("ndërmjetës");
  });
});

describe("P44: get-help mediator mode & mediatori request link", () => {
  it("switches GetHelpPageContent hero title and lead when mode is mediator and keeps default otherwise", () => {
    const renderMode = (lang: Lang, mode?: "mediator") =>
      renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang, setLang: () => {}, t: translations[lang] } },
          createElement(
            RecaptchaProvider as ComponentType<{ enabled: boolean }>,
            { enabled: false },
            createElement(GetHelpPageContent, {
              countries: ["RO"],
              initialCountry: "RO",
              mode,
            }),
          ),
        ),
      );

    const enMediatorHtml = renderMode("en", "mediator");
    expect(enMediatorHtml).toContain("Ask a health mediator for help");
    expect(enMediatorHtml).toContain("Tell us briefly what you need. A health mediator will call you.");
    expect(enMediatorHtml).not.toContain("Ask a person for help");

    const enDefaultHtml = renderMode("en");
    expect(enDefaultHtml).toContain("Ask a person for help");
    expect(enDefaultHtml).not.toContain("Ask a health mediator for help");

    for (const lang of LANGS) {
      const { getHelpPage } = translations[lang];
      expect(getHelpPage.mediatorHeroTitle.length).toBeGreaterThan(5);
      expect(getHelpPage.mediatorHeroParagraph.length).toBeGreaterThan(10);
      expect(getHelpPage.mediatorHeroTitle).not.toContain("&");
      expect(getHelpPage.mediatorHeroParagraph).not.toContain("&");
      const html = renderMode(lang, "mediator");
      expect(html).toContain(getHelpPage.mediatorHeroTitle);
      expect(html).toContain(getHelpPage.mediatorHeroParagraph);
    }

    expect(translations.sq.getHelpPage.mediatorHeroTitle).toContain("mediator");
    expect(translations.sq.getHelpPage.mediatorHeroTitle).not.toContain("ndërmjetës");
    expect(translations.sq.getHelpPage.mediatorHeroParagraph).not.toContain("ndërmjetës");
  });

  it("wires mode=mediator from /get-help page searchParams and points /mediatori hero CTA to #solicita", () => {
    const pageSrc = read("app/get-help/page.tsx");
    expect(pageSrc).toContain("searchParams");
    expect(pageSrc).toContain('=== "mediator"');
    expect(pageSrc).toContain("mode={mode}");

    const mediatorHeroSrc = read("components/mediator/MediatorPublicHero.tsx");
    expect(mediatorHeroSrc).not.toContain('aria-haspopup="dialog"');
    expect(mediatorHeroSrc).not.toContain("/get-help?mode=mediator");
    expect(mediatorHeroSrc).toContain('href="#solicita"');

    const mediatorHeroHtml = renderToStaticMarkup(createElement(MediatorPublicHero));
    expect(mediatorHeroHtml).toContain('href="#solicita"');
    expect(mediatorHeroHtml).not.toContain("/get-help?mode=mediator");

    const enMediatorHeroHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", setLang: () => {}, t: translations.en } },
        createElement(MediatorPublicHero),
      ),
    );
    expect(enMediatorHeroHtml).toContain('href="#solicita"');
    expect(enMediatorHeroHtml).not.toContain("/get-help?mode=mediator");
  });
});

describe("P43: request-help field order, what-happens sentence, and error/hint copy", () => {
  it("renders whatHappensSummary above the form, keeps only the 112 box in aside, and places problem + quick taps first", () => {
    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", setLang: () => {}, t: translations.en } },
        createElement(
          RecaptchaProvider as ComponentType<{ enabled: boolean }>,
          { enabled: false },
          createElement(GetHelpPageContent, {
            countries: ["RO", "MD"],
            initialCountry: "RO",
          }),
        ),
      ),
    );

    const summary = translations.en.getHelpPage.whatHappensSummary;
    expect(summary).toBe("We read your message, then call you back and help you get to the right place.");
    expect(html.indexOf(summary)).toBeGreaterThan(-1);
    expect(html.indexOf(summary)).toBeLessThan(html.indexOf("<form"));
    expect(html).not.toContain("<ol");
    expect(html).toContain(translations.en.getHelpPage.sidebar.emergencyTitle);

    const orderedIds = [
      'id="description"',
      'id="phone"',
      'id="country"',
      'id="county"',
      'id="name"',
      'id="email"',
      'name="privacyConsent"',
      'type="submit"',
    ];
    let prev = -1;
    for (const marker of orderedIds) {
      const idx = html.indexOf(marker);
      expect(idx, `missing marker ${marker}`).toBeGreaterThan(prev);
      prev = idx;
    }

    const firstQuickTapIdx = html.indexOf(QUICK_HELP_TOPICS.en[0].label);
    expect(firstQuickTapIdx).toBeGreaterThan(html.indexOf("<form"));
    expect(firstQuickTapIdx).toBeLessThan(html.indexOf('id="phone"'));
  });

  it("updates errorDescription and descriptionHint across all 7 locales while keeping legal privacyConsent unchanged", () => {
    expect(translations.en.getHelpPage.form.errorDescription).toBe(
      "Write a few words about the problem.",
    );
    expect(translations.en.getHelpPage.form.descriptionHint).toBe(
      "You do not need to give your ID number or medical records.",
    );
    expect(translations.en.getHelpPage.form.privacyConsent).toBe("I have read and agree to the");

    for (const lang of LANGS) {
      const page = translations[lang].getHelpPage;
      expect(page.whatHappensSummary.length).toBeGreaterThan(15);
      expect(page.whatHappensSummary).not.toContain("&");
      expect(page.form.errorDescription).not.toMatch(/10/);
      expect(page.form.errorDescription).not.toContain("&");
      expect(page.form.descriptionHint).not.toContain("&");
    }

    expect(translations.sq.getHelpPage.whatHappensSummary).not.toContain("ndërmjetës");
  });
});

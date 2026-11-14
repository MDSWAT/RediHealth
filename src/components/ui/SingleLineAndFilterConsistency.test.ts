import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HEALTH_HUB_EXPLORER_COPY } from "@/components/health-information/HealthInformationPageContent";
import { SubjectHeaderToolbar } from "@/components/health-information/SubjectHeaderToolbar";
import { SUMMARY_COPY, TriageSummaryCard } from "@/components/health-check/TriageSummaryCard";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { FilterDropdown, FilterMenuGroup, FilterMenuOption } from "@/components/ui/FilterDropdown";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const ROOT = process.cwd();
const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

function readSrc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf8");
}

function renderWithLang(lang: Lang, element: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      element,
    ),
  );
}

describe("Single-line icon actions & cross-page filter consistency", () => {
  it("renders iconOnly FamilyShareButton with a crisp 44x44 touch target and accessible labels", () => {
    const html = renderWithLang(
      "en",
      createElement(FamilyShareButton, {
        title: "Guardia Medica",
        text: "Via Giovanni Fincato 4, Vicenza",
        lang: "en",
        iconOnly: true,
      }),
    );

    expect(html).toContain("h-11");
    expect(html).toContain("w-11");
    expect(html).toContain("min-h-11");
    expect(html).toContain("min-w-11");
    expect(html).toContain("shrink-0");
    expect(html).toContain("aria-label=");
    expect(html).toContain("title=");
    expect(html).toContain("sr-only");
    expect(html).not.toContain("rounded-full");

    const source = readSrc("src/components/ui/FamilyShareButton.tsx");
    expect(source).toContain("resolvedAlign === \"right\"");
    expect(source).toContain("right-0");
  });

  it("renders shared FilterDropdown and FilterMenuOption with uniform tokens and zero pills", () => {
    const dropdownHtml = renderToStaticMarkup(
      createElement(
        FilterDropdown,
        {
          id: "test-filter",
          label: "Category",
          value: "All topics",
          align: "right",
          hideLabel: true,
        },
        createElement(
          FilterMenuGroup,
          { label: "Topics" },
          createElement(FilterMenuOption, { selected: true, onSelect: () => {} }, "All topics"),
        ),
      ),
    );

    expect(dropdownHtml).toContain("min-h-12");
    expect(dropdownHtml).toContain("border-border-control");
    expect(dropdownHtml).toContain("focus-visible:ring-ring");
    expect(dropdownHtml).not.toContain("rounded-full");

    const optionHtml = renderToStaticMarkup(
      createElement(
        FilterMenuGroup,
        { label: "Topics" },
        createElement(FilterMenuOption, { key: "a", selected: true, onSelect: () => {} }, "Selected"),
        createElement(FilterMenuOption, { key: "b", selected: false, onSelect: () => {} }, "Other"),
      ),
    );

    expect(optionHtml).toContain("aria-pressed=\"true\"");
    expect(optionHtml).toContain("aria-pressed=\"false\"");
    expect(optionHtml).toContain("min-h-11");
    expect(optionHtml).toContain("focus-visible:ring-ring");
    expect(optionHtml).not.toContain("rounded-full");
  });

  it("enforces flex-nowrap single-line action rows across utility bars and cards", () => {
    const files = [
      "src/components/find-help/FindHelpExplorer.tsx",
      "src/components/health-check/TriageSummaryCard.tsx",
      "src/components/health-check/HealthCheckExplorer.tsx",
      "src/components/telemed/MedicOnlineHero.tsx",
      "src/components/telemed/BookingSmsConfirmation.tsx",
      "src/components/health-assistant/PrescriptionStructuredResult.tsx",
      "src/components/portal/PatientPortalView.tsx",
    ];

    for (const file of files) {
      expect(readSrc(file), `${file} missing flex-nowrap single-line action row`).toContain("flex-nowrap");
    }

    const hcSource = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    const routingMatch = hcSource.match(
      /const renderRoutingStack = [\s\S]*?(?=\n\s*async function handleCopyDiagnosticSheet)/,
    );
    expect(routingMatch?.[0]).toContain("sm:flex-wrap");
    expect(routingMatch?.[0]).toContain("whitespace-nowrap");

    const summarySource = readSrc("src/components/health-check/TriageSummaryCard.tsx");
    expect(summarySource).toContain("sm:flex-nowrap");
    expect(summarySource).toContain("flex-nowrap items-center");
  });

  it("keeps desktop header utility triggers compact at 2xl breakpoints without label jumps", () => {
    for (const file of [
      "src/components/layout/Header.tsx",
      "src/components/layout/ComfortMenu.tsx",
    ]) {
      const source = readSrc(file);
      expect(source, `${file} still has hidden 2xl:inline`).not.toContain("hidden 2xl:inline");
    }
  });

  it("replaces raw <select> dropdowns in health directories with FilterDropdown while preserving openSmartSearch()", () => {
    for (const file of [
      "src/components/health-information/HealthArticleDirectory.tsx",
      "src/components/health-information/InformedHealthDirectory.tsx",
    ]) {
      const source = readSrc(file);
      expect(source, `${file} must use FilterDropdown`).toContain("FilterDropdown");
      expect(source, `${file} must preserve openSmartSearch()`).toContain("openSmartSearch()");
      expect(source, `${file} must not render native <select>`).not.toContain("<select");
      expect(source, `${file} must not use type="search"`).not.toContain("type=\"search\"");
    }
  });

  it("harmonizes topic and article subject routes with TopicMetaBadge and SubjectHeaderToolbar", () => {
    for (const file of [
      "src/app/health-information/topics/[topic]/page.tsx",
      "src/app/health-information/articles/[article]/page.tsx",
    ]) {
      const source = readSrc(file);
      expect(source, `${file} missing TopicMetaBadge`).toContain("TopicMetaBadge");
      expect(source, `${file} missing SubjectHeaderToolbar`).toContain("SubjectHeaderToolbar");
      expect(source, `${file} still uses focus-visible:ring-sapphire`).not.toContain("focus-visible:ring-sapphire");
    }

    const toolbarHtml = renderWithLang(
      "ro",
      createElement(SubjectHeaderToolbar, {
        uiLang: "ro",
        contentLang: "ro",
        textToSpeak: "Informație medicală clară despre alergii.",
        simpleTakeaway: "Simptomele ușoare răspund bine la evitarea declanșatorilor.",
      }),
    );

    expect(toolbarHtml).toContain("aria-pressed=");
    expect(toolbarHtml).toContain("role=\"note\"");
    expect(toolbarHtml).toContain("Pe scurt");
  });

  it("keeps all 7 locales of HEALTH_HUB_EXPLORER_COPY and SUMMARY_COPY free of ampersands and middle dots", () => {
    for (const lang of ALL_LANGS) {
      const hubCopy = HEALTH_HUB_EXPLORER_COPY[lang];
      expect(hubCopy).toBeDefined();
      for (const value of Object.values(hubCopy)) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value).not.toContain("&");
        expect(value).not.toContain("\u00b7");
      }

      const summaryCopy = SUMMARY_COPY[lang];
      expect(summaryCopy).toBeDefined();
      expect(summaryCopy.listen.trim().length).toBeGreaterThan(0);
      expect(summaryCopy.stopListening.trim().length).toBeGreaterThan(0);
      for (const value of Object.values(summaryCopy)) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value).not.toContain("&");
        expect(value).not.toContain("\u00b7");
      }
    }
  });

  it("centers TriageSummaryCard mobile icon buttons and hides the QR hint until requested", () => {
    for (const lang of ["ru", "ro"] as const) {
      const html = renderWithLang(
        lang,
        createElement(TriageSummaryCard, {
          lang,
          bodyArea: "Head and neck",
          symptoms: ["Neck pain"],
          recommendationDetail: "Recommendation: See a doctor today",
          noteUrl: `https://redihealth.org/${lang}/health-check/note?qr=1`,
        }),
      );

      expect(html).toContain("justify-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end");
      expect(html).not.toContain("items-center justify-end gap-2");
      expect(html).toContain('data-qr-trigger="inline"');
      expect(html).toContain('aria-expanded="false"');
      expect(html).not.toContain(SUMMARY_COPY[lang].qrHint);
    }
  });
});

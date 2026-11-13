import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FindHelpPrompt } from "@/components/find-help/FindHelpPrompt";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import { ASSISTANT_COPY } from "@/components/health-assistant/assistant-copy";
import { COPY } from "@/components/health-check/health-check-copy";
import { TopicNextSteps } from "@/components/health-information/TopicNextSteps";
import { contulMeuCopy } from "@/components/portal/contul-meu-copy";
import { Button } from "@/components/ui/Button";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const ROOT = process.cwd();
const ALL_LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

type ButtonPropsWithoutRequiredChildren = ComponentProps<typeof Button> extends infer P
  ? P extends unknown
    ? Omit<P, "children"> & { children?: ReactNode }
    : never
  : never;

const ButtonCompat = Button as ComponentType<ButtonPropsWithoutRequiredChildren>;

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

function assertInteractiveTagsSingleLine(html: string, contextLabel: string) {
  const tags = Array.from(html.matchAll(/<(button|a)\b([^>]*)>/g));
  expect(tags.length, `${contextLabel} should render at least one button/link`).toBeGreaterThan(0);

  for (const [fullTag, tagName, attrs] of tags) {
    const classMatch = attrs.match(/\bclass="([^"]*)"/);
    expect(classMatch, `${contextLabel} <${tagName}> missing class attribute: ${fullTag}`).not.toBeNull();
    expect(
      classMatch?.[1],
      `${contextLabel} <${tagName}> missing whitespace-nowrap: ${fullTag}`,
    ).toContain("whitespace-nowrap");
  }
}

describe("Zero two-line buttons across all 7 locales", () => {
  it("keeps button and CTA copy <= 28 chars, sentence-cased, and free of ampersands across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const findHelp = findHelpLinks(lang);
      const hcCopy = COPY[lang];
      const hcUi = getHealthCheckTranslations(lang).ui;
      const assistant = ASSISTANT_COPY[lang];
      const portal = contulMeuCopy[lang];

      const buttonStrings: Array<[string, string]> = [
        ["FIND_HELP_LINKS.nearestPharmacy", findHelp.nearestPharmacy],
        ["FIND_HELP_LINKS.nearbyPlace", findHelp.nearbyPlace],
        ["FIND_HELP_LINKS.pharmacyFirst", findHelp.pharmacyFirst],
        ["FIND_HELP_LINKS.familyDoctor", findHelp.familyDoctor],
        ["FIND_HELP_LINKS.hospital", findHelp.hospital],
        ["COPY.confirmYes", hcCopy.confirmYes],
        ["COPY.confirmNo", hcCopy.confirmNo],
        ["COPY.change", hcCopy.change],
        ["COPY.showMoreBody", hcCopy.showMoreBody],
        ["COPY.showLessBody", hcCopy.showLessBody],
        ["COPY.doctorBook", hcCopy.doctorBook],
        ["COPY.doctorNow", hcCopy.doctorNow],
        ["COPY.readAbout", hcCopy.readAbout],
        ["COPY.forSelf", hcCopy.forSelf],
        ["COPY.forChild", hcCopy.forChild],
        ["COPY.otherAssistant", hcCopy.otherAssistant],
        ["COPY.otherDoctor", hcCopy.otherDoctor],
        ["COPY.listen", hcCopy.listen],
        ["COPY.stopListening", hcCopy.stopListening],
        ["COPY.largeText", hcCopy.largeText],
        ["COPY.noExtraFinish", hcCopy.noExtraFinish],
        ["COPY.copySheet", hcCopy.copySheet],
        ["COPY.copiedSheet", hcCopy.copiedSheet],
        ["COPY.showAllAreaSymptoms", hcCopy.showAllAreaSymptoms],
        ["COPY.openMenu", hcCopy.openMenu],
        ["COPY.close", hcCopy.close],
        ["healthCheckTranslations.ui.resetButton", hcUi.resetButton],
        ["healthCheckTranslations.ui.backButton", hcUi.backButton],
        ["healthCheckTranslations.ui.nextButton", hcUi.nextButton],
        ["healthCheckTranslations.ui.finishButton", hcUi.finishButton],
        ["healthCheckTranslations.ui.copySummary", hcUi.copySummary],
        ["healthCheckTranslations.ui.copied", hcUi.copied],
        ["healthCheckTranslations.ui.sendWhatsApp", hcUi.sendWhatsApp],
        ["healthCheckTranslations.ui.showDoctor", hcUi.showDoctor],
        ["healthCheckTranslations.ui.requestMediatorHelp", hcUi.requestMediatorHelp],
        ["healthCheckTranslations.ui.scheduleDoctor", hcUi.scheduleDoctor],
        ["healthCheckTranslations.ui.readEducationalTopic", hcUi.readEducationalTopic],
        ["ASSISTANT_COPY.machine.back", assistant.machine.back],
        ["ASSISTANT_COPY.tree.bodyMapLink", assistant.tree.bodyMapLink],
        ["ASSISTANT_COPY.learn.readGuide", assistant.learn.readGuide],
        ["ASSISTANT_COPY.learn.browseGuides", assistant.learn.browseGuides],
        ["ASSISTANT_COPY.risk.quickButton", assistant.risk.quickButton],
        ["ASSISTANT_COPY.risk.yes", assistant.risk.yes],
        ["ASSISTANT_COPY.risk.no", assistant.risk.no],
        ["ASSISTANT_COPY.risk.submit", assistant.risk.submit],
        ["ASSISTANT_COPY.gate.callNow", assistant.gate.callNow],
        ["ASSISTANT_COPY.gate.yesSeeTips", assistant.gate.yesSeeTips],
        ["ASSISTANT_COPY.gate.noNoneOfThese", assistant.gate.noNoneOfThese],
        ["ASSISTANT_COPY.symptoms.bodyMapCta", assistant.symptoms.bodyMapCta],
        ["ASSISTANT_COPY.symptoms.callNow", assistant.symptoms.callNow],
        ["ASSISTANT_COPY.rx.submit", assistant.rx.submit],
        ["ASSISTANT_COPY.result.listenMedicine", assistant.result.listenMedicine],
        ["ASSISTANT_COPY.result.stopMedicine", assistant.result.stopMedicine],
        ["ASSISTANT_COPY.result.print", assistant.result.print],
        ["contulMeuCopy.backHome", portal.backHome],
      ];

      for (const [key, value] of buttonStrings) {
        expect(value.length, `${lang}.${key} too long: "${value}"`).toBeLessThanOrEqual(28);
        expect(/^\p{Lu}/u.test(value), `${lang}.${key} must start with capital letter: "${value}"`).toBe(true);
        expect(value, `${lang}.${key} must not contain "&": "${value}"`).not.toContain("&");
      }
    }
  });

  it("SSR-renders FindHelpPrompt, TopicNextSteps, UniversalDoctorExit, and Button with whitespace-nowrap in all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const findHelpHtml = renderWithLang(lang, createElement(FindHelpPrompt, { lang }));
      assertInteractiveTagsSingleLine(findHelpHtml, `FindHelpPrompt(${lang})`);

      const nextStepsHtml = renderWithLang(lang, createElement(TopicNextSteps, { lang }));
      assertInteractiveTagsSingleLine(nextStepsHtml, `TopicNextSteps(${lang})`);

      const doctorExitHtml = renderWithLang(lang, createElement(UniversalDoctorExit, { pathway: "learn" }));
      assertInteractiveTagsSingleLine(doctorExitHtml, `UniversalDoctorExit(${lang})`);

      const buttonHtml = renderWithLang(
        lang,
        createElement(
          "div",
          null,
          createElement(ButtonCompat, { variant: "primary", size: "sm" }, ASSISTANT_COPY[lang].gate.callNow),
          createElement(ButtonCompat, { variant: "action", size: "md" }, ASSISTANT_COPY[lang].rx.submit),
          createElement(
            ButtonCompat,
            {
              variant: "secondary",
              size: "lg",
              href: `/${lang}/medic-online`,
            },
            findHelpLinks(lang).nearestPharmacy,
          ),
          createElement(ButtonCompat, { variant: "outline", size: "md" }, COPY[lang].change),
          createElement(ButtonCompat, { variant: "ghost", size: "sm" }, contulMeuCopy[lang].backHome),
        ),
      );
      assertInteractiveTagsSingleLine(buttonHtml, `Button(${lang})`);
    }
  });

  it("verifies HealthCheckExplorer Screenshot 1 & 2 layout and single-line fixes", () => {
    const source = readSrc("src/components/health-check/HealthCheckExplorer.tsx");

    expect(source).toMatch(/<p[^>]*whitespace-nowrap[^>]*>[\s\S]*?\{stepIndicatorText\}[\s\S]*?<\/p>/);
    expect(source).not.toContain("max-lg:border-transparent");
    expect(source).not.toContain("mask-image:linear-gradient");

    const placeLinkMatch = source.match(
      /const placeLink = [\s\S]*?(?=\n\s*const renderRoutingStack =)/,
    );
    expect(placeLinkMatch).not.toBeNull();
    const placeLinkOpeningTags = Array.from(placeLinkMatch![0].matchAll(/<Link\b[\s\S]*?>/g));
    expect(placeLinkOpeningTags.length).toBeGreaterThan(0);
    for (const [linkTag] of placeLinkOpeningTags) {
      expect(linkTag).toContain("whitespace-nowrap");
    }

    const routingStackMatch = source.match(
      /const renderRoutingStack = [\s\S]*?(?=\n\s*async function handleCopyDiagnosticSheet)/,
    );
    expect(routingStackMatch).not.toBeNull();
    const routingLinkOpeningTags = Array.from(routingStackMatch![0].matchAll(/<Link\b[\s\S]*?>/g));
    expect(routingLinkOpeningTags.length).toBeGreaterThanOrEqual(3);
    for (const [linkTag] of routingLinkOpeningTags) {
      expect(linkTag).toContain("whitespace-nowrap");
    }
  });

  it("enforces sentence-case uppercase start on all ASSISTANT_COPY tree option titles and plainTitles across all 7 locales", () => {
    for (const lang of ALL_LANGS) {
      const options = ASSISTANT_COPY[lang].tree.options;
      for (const [key, option] of Object.entries(options)) {
        expect(option.title, `${lang}.tree.options.${key}.title must start with uppercase letter or digit`).toMatch(
          /^[\p{Lu}\p{N}]/u,
        );
        expect(
          option.plainTitle,
          `${lang}.tree.options.${key}.plainTitle must start with uppercase letter or digit`,
        ).toMatch(/^[\p{Lu}\p{N}]/u);
      }
    }
  });
});

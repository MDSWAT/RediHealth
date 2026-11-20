import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ASSISTANT_COPY } from "@/components/health-assistant/assistant-copy";
import {
  PrescriptionStructuredResult,
  buildMedicineSpeechParts,
  buildPrescriptionSpeechText,
} from "@/components/health-assistant/PrescriptionStructuredResult";
import { TriageDecisionTree } from "@/components/health-assistant/TriageDecisionTree";
import { PathwayRisk } from "@/components/health-assistant/pathways/PathwayRisk";
import { AnatomicalBodyMap, BODY_MAP_COPY } from "@/components/health-check/AnatomicalBodyMap";
import { AREA_VIEW_SWITCH_COPY } from "@/components/health-check/HealthCheckExplorer";
import { READING_LEVEL_COPY } from "@/components/health-information/ReadingLevelSwitcher";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { initialTriageState, triageReducer } from "@/lib/triage-state";

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

const OWNED_SOURCE_FILES = [
  "src/components/health-assistant/TriageStateMachine.tsx",
  "src/components/health-information/ReadingLevelSwitcher.tsx",
  "src/components/health-assistant/TriageDecisionTree.tsx",
  "src/components/health-assistant/LegalRightsCard.tsx",
  "src/components/health-assistant/MediatorRequestModal.tsx",
  "src/components/health-assistant/pathways/PathwayRisk.tsx",
  "src/components/health-assistant/pathways/PathwayNavigation.tsx",
  "src/components/health-check/HealthCheckExplorer.tsx",
  "src/components/health-check/AnatomicalBodyMap.tsx",
  "src/components/health-check/TriageNoteView.tsx",
  "src/components/health-check/TriageSummaryCard.tsx",
  "src/components/find-help/FindHelpExplorer.tsx",
  "src/components/get-help/GetHelpPageContent.tsx",
  "src/components/emergency/DispatcherScriptAccordion.tsx",
] as const;

describe("Care tools design-system consistency", () => {
  it("eliminates scale transforms and uses calm press utilities with reduced-motion guards", () => {
    for (const file of OWNED_SOURCE_FILES) {
      const src = readSrc(file);
      expect(src, `${file} contains scale transform`).not.toMatch(/\b(?:active|hover|group-hover|motion-safe:active|motion-safe:group-hover):scale-/);
    }

    const buttonSrc = readSrc("src/components/ui/Button.tsx");
    expect(buttonSrc).toContain("press-row");
    expect(buttonSrc).toContain("press-solid");
    expect(buttonSrc).toContain("motion-reduce:transition-none");

    for (const file of [
      "src/components/health-assistant/TriageStateMachine.tsx",
      "src/components/health-assistant/LegalRightsCard.tsx",
      "src/components/health-assistant/MediatorRequestModal.tsx",
      "src/components/health-assistant/pathways/PathwayRisk.tsx",
      "src/components/find-help/FindHelpExplorer.tsx",
    ]) {
      const src = readSrc(file);
      expect(src, file).toContain("press-row");
      if (src.includes("<Button")) {
        expect(buttonSrc).toContain("motion-reduce:transition-none");
      } else {
        expect(src, file).toContain("motion-reduce:transition-none");
      }
    }

    expect(readSrc("src/components/health-assistant/pathways/PathwayRisk.tsx")).toContain('variant="action"');
    expect(readSrc("src/components/find-help/FindHelpExplorer.tsx")).toContain("press-solid");
  });

  it("replaces focus-visible:ring-sapphire and outline-primary with focus-visible:ring-ring", () => {
    for (const file of OWNED_SOURCE_FILES) {
      const src = readSrc(file);
      expect(src, `${file} still has focus-visible:ring-sapphire`).not.toContain("focus-visible:ring-sapphire");
      expect(src, `${file} still has focus-visible:outline-primary`).not.toContain("focus-visible:outline-primary");
    }

    expect(readSrc("src/components/ui/Button.tsx")).toContain("focus-visible:ring-ring");
    for (const file of [
      "src/components/health-assistant/TriageStateMachine.tsx",
      "src/components/health-information/ReadingLevelSwitcher.tsx",
      "src/components/health-assistant/TriageDecisionTree.tsx",
      "src/components/health-assistant/LegalRightsCard.tsx",
      "src/components/health-assistant/MediatorRequestModal.tsx",
      "src/components/health-assistant/pathways/PathwayRisk.tsx",
      "src/components/health-check/HealthCheckExplorer.tsx",
      "src/components/health-check/AnatomicalBodyMap.tsx",
      "src/components/health-check/TriageSummaryCard.tsx",
      "src/components/find-help/FindHelpExplorer.tsx",
      "src/components/get-help/GetHelpPageContent.tsx",
      "src/components/emergency/DispatcherScriptAccordion.tsx",
    ]) {
      const src = readSrc(file);
      if (src.includes("<Button")) {
        expect(src, file).toMatch(/focus-visible:ring-ring|<Button\b/);
      } else {
        expect(src, file).toContain("focus-visible:ring-ring");
      }
    }
  });

  it("uses canonical radii (rounded-lg, rounded-md, rounded-sm) and removes pill chips/badges/bars", () => {
    const stateMachine = readSrc("src/components/health-assistant/TriageStateMachine.tsx");
    expect(stateMachine).not.toContain("rounded-full");
    expect(stateMachine).toContain("rounded-lg");
    expect(stateMachine).not.toContain("· {stepLabel}");

    const risk = readSrc("src/components/health-assistant/pathways/PathwayRisk.tsx");
    expect(risk).not.toContain("rounded-full");
    expect(risk).toContain("rounded-sm");

    const nav = readSrc("src/components/health-assistant/pathways/PathwayNavigation.tsx");
    expect(nav).not.toContain("rounded-full");
    expect(nav).toContain("rounded-md");
    expect(nav).toContain("tabular-nums");

    const accordion = readSrc("src/components/emergency/DispatcherScriptAccordion.tsx");
    expect(accordion).not.toContain("rounded-full");
    expect(accordion).toContain("rounded-md");
    expect(accordion).toContain("tabular-nums");

    const explorer = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    expect(explorer).not.toContain("<AssistantNavigation");
    expect(explorer).toContain("h-1 flex-1 rounded-sm");
    expect(explorer).toContain("inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg");

    for (const file of [
      "src/components/health-assistant/HealthAssistant.tsx",
      "src/components/health-assistant/AiChatAssistant.tsx",
      "src/components/health-assistant/PrescriptionReview.tsx",
      "src/components/find-help/FindHelpPageContent.tsx",
    ]) {
      expect(readSrc(file), `${file} still renders <AssistantNavigation`).not.toContain("<AssistantNavigation");
    }
  });

  it("enforces 44px touch targets (min-h-11) and border-border-control across controls", () => {
    const stateMachine = readSrc("src/components/health-assistant/TriageStateMachine.tsx");
    expect(stateMachine).toContain("min-h-11");
    expect(stateMachine).toContain("border-border-control");
    expect(stateMachine).not.toContain("min-h-10");

    const switcher = readSrc("src/components/health-information/ReadingLevelSwitcher.tsx");
    expect(switcher).toContain("min-h-11");
    expect(switcher).not.toContain("min-h-10");
    expect(Object.keys(READING_LEVEL_COPY)).toEqual(["ru", "ro", "en", "sq", "it", "hr", "rom"]);
    expect(stateMachine).not.toContain("<ReadingLevelSwitcher");
    expect(stateMachine).not.toContain("TriagePlainLanguageToggle");

    const readingTools = readSrc("src/components/health-check/readingTools.ts");
    expect(readingTools).not.toContain("useLargeText");
    for (const file of [
      "src/components/health-check/HealthCheckExplorer.tsx",
      "src/components/find-help/FindHelpExplorer.tsx",
      "src/components/health-assistant/PrescriptionReview.tsx",
    ]) {
      const src = readSrc(file);
      expect(src, `${file} still references useLargeText`).not.toContain("useLargeText");
      expect(src, `${file} still renders A+ button`).not.toContain(">A+<");
    }

    const tree = readSrc("src/components/health-assistant/TriageDecisionTree.tsx");
    expect(tree).toContain("min-h-[56px]");
    expect(tree).not.toContain("min-h-9");

    const bodyMap = readSrc("src/components/health-check/AnatomicalBodyMap.tsx");
    expect(bodyMap).toContain("min-h-11");
    expect(bodyMap).not.toContain("min-h-10");
    expect(bodyMap).toContain("border-border-control");

    const explorer = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    expect(explorer).toContain("-my-1.5 inline-flex min-h-11 items-center rounded-md");
    expect(explorer).toContain("inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-body");
    expect(explorer).toContain("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-2.5 text-body");

    const findHelp = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(findHelp).toContain("min-h-11");
    expect(findHelp).toContain("border-border-control");
    expect(findHelp).toContain("rounded-(--radius-control)");
    expect(findHelp).not.toContain("min-h-9");
  });

  it("wraps /health-check/note top bar and note card in a readable max-w-3xl Container with print classes intact", () => {
    const noteView = readSrc("src/components/health-check/TriageNoteView.tsx");
    expect(noteView).toContain('<Container className="max-w-3xl">');
    expect(noteView).toContain("print:hidden");
  });

  it("hides PathwayRisk result previews until all 3 questions are answered, then replaces questions with the result", () => {
    const roRisk = ASSISTANT_COPY.ro.risk;

    const renderRisk = (step: 2 | 3, answers: { q1?: boolean; q2?: boolean; q3?: boolean }) =>
      renderToStaticMarkup(
        createElement(
          LanguageContext.Provider,
          { value: { lang: "ro", t: translations.ro, setLang: () => {} } },
          createElement(PathwayRisk, {
            step,
            answers,
            plainLanguage: false,
            onAnswer: () => {},
          }),
        ),
      );

    const unansweredHtml = renderRisk(2, {});
    expect(unansweredHtml).not.toContain(roRisk.quickTitle);
    expect(unansweredHtml).not.toContain(roRisk.quickButton);
    expect(unansweredHtml).not.toContain("data-risk-submit");
    expect(unansweredHtml).toContain(roRisk.questions.q1.title);
    expect(unansweredHtml).toContain(roRisk.questions.q2.title);
    expect(unansweredHtml).toContain(roRisk.questions.q3.title);

    const partialHtml = renderRisk(2, { q1: true });
    expect(partialHtml).not.toContain(roRisk.quickTitle);
    expect(partialHtml).not.toContain("data-risk-submit");

    let state = triageReducer(initialTriageState, { type: "SELECT_PATHWAY", pathway: "risk" });
    state = triageReducer(state, { type: "SET_RISK_ANSWER", question: "q1", value: false });
    state = triageReducer(state, { type: "SET_RISK_ANSWER", question: "q2", value: true });
    expect(state.step).toBe(2);
    state = triageReducer(state, { type: "SET_RISK_ANSWER", question: "q3", value: false });
    expect(state.step).toBe(3);

    const completedHtml = renderRisk(state.step as 3, state.riskAnswers);
    expect(completedHtml).toContain(roRisk.resultHeading);
    expect(completedHtml).not.toContain(roRisk.heading);
    expect(completedHtml).not.toContain(roRisk.questions.q1.title);
  });

  it("opens HealthCheckExplorer on the 3D body on phones, keeps the list one tap away, and defers 3D mount in list mode (P01)", () => {
    const explorerSrc = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    // The body is still the default; a "List" choice made on an earlier visit is remembered.
    expect(explorerSrc).toContain(
      'const effectiveMobileAreaMode: "3d" | "list" = mobileAreaModeOverride ?? storedAreaMode ?? "3d";',
    );
    // Full screen: a tap selects without moving on; Save selection confirms.
    expect(explorerSrc).toContain('stepRef.current === "area" && !bodyFullScreenRef.current');
    const bodyMapSrc = readSrc("src/components/health-check/AnatomicalBodyMap.tsx");
    expect(bodyMapSrc).toContain("data-hc-fullscreen");
    expect(bodyMapSrc).toContain("onConfirmSelection?.()");
    expect(bodyMapSrc).toContain("{dict.ui.backButton}");
    expect(explorerSrc).toContain('const mobileListOnly = effectiveMobileAreaMode === "list" && stepId !== "result";');
    expect(explorerSrc).not.toContain('stepId === "area" && effectiveMobileAreaMode');
    expect(explorerSrc).toContain("deferred={mobileListOnly && !isDesktop}");
    expect(AREA_VIEW_SWITCH_COPY.en.bodyPicture).toBe("Body picture");
    expect(Object.keys(AREA_VIEW_SWITCH_COPY)).toEqual(["ro", "en", "sq", "it", "hr", "rom", "ru"]);

    const questionPos = explorerSrc.indexOf("{currentQuestion}");
    const switchPos = explorerSrc.indexOf("AREA_VIEW_SWITCH_COPY[activeLang]");
    const areaListPos = explorerSrc.indexOf("<AreaOptionCard");
    expect(questionPos).toBeGreaterThan(-1);
    expect(switchPos).toBeGreaterThan(questionPos);
    expect(areaListPos).toBeGreaterThan(switchPos);

    const deferredHtml = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(AnatomicalBodyMap, {
          deferred: true,
          selectedPart: null,
          onSelectPart: () => {},
        }),
      ),
    );
    expect(deferredHtml).toBe("");
  });

  it("uses 44px labelled mobile 3D toolbar, D-pad inside Options, visible layer rows, and zero hover-only tooltips (P39)", () => {
    const bodyMapSrc = readSrc("src/components/health-check/AnatomicalBodyMap.tsx");

    expect(bodyMapSrc).toContain("isPanel");
    expect(bodyMapSrc).toContain("inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border-control");
    expect(bodyMapSrc).toContain("{showTools && isDesktopLayout && (");
    expect(bodyMapSrc).toContain("{!isDesktopLayout && (");
    expect(bodyMapSrc).toContain("aria-label={t.turnBody}");
    expect(bodyMapSrc).toContain("inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 text-body font-semibold");
    expect(bodyMapSrc).toContain("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg");
    expect(bodyMapSrc).toContain("flex min-h-11 w-full items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-left text-body font-medium");
    expect(bodyMapSrc).toContain("flex flex-col gap-2");

    // Step 3: hover-only tooltip spans deleted
    expect(bodyMapSrc).not.toContain("group-hover/pad");
    expect(bodyMapSrc).not.toContain("group-hover/tool");

    expect(Object.keys(BODY_MAP_COPY)).toEqual(["ru", "ro", "en", "sq", "it", "hr", "rom"]);
    for (const locale of Object.values(BODY_MAP_COPY)) {
      expect(locale.inside.trim().length).toBeGreaterThan(0);
      expect(locale.turnBody.trim().length).toBeGreaterThan(0);
      expect(Object.keys(locale.layers).sort()).toEqual(["hybrid", "muscular", "organs", "skeletal", "surface"]);
    }
    expect(BODY_MAP_COPY.en.inside).toBe("Inside");
    expect(BODY_MAP_COPY.en.turnBody).toBe("Turn the body");
    expect(BODY_MAP_COPY.en.layers).toEqual({
      surface: "Skin",
      muscular: "Muscles",
      skeletal: "Bones",
      organs: "Organs",
      hybrid: "Whole body",
    });
  });

  it("flattens TriageDecisionTree into 56px hero rows, updates step-1 heading, and removes duplicate body-map entry (P13)", () => {
    const treeSrc = readSrc("src/components/health-assistant/TriageDecisionTree.tsx");
    expect(treeSrc).toContain("min-h-[56px]");
    expect(treeSrc).toContain("border-b border-ink-950/[0.08]");
    expect(treeSrc).toContain("<ChevronRightIcon");
    expect(treeSrc).not.toContain("surface-spotlight");
    expect(treeSrc).not.toContain("card-interactive");
    expect(treeSrc).not.toContain("list-in");
    expect(treeSrc).not.toContain("bodyMapPrompt");
    expect(treeSrc).not.toContain("bodyMapLink");

    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(TriageDecisionTree, {
          onSelectPathway: () => {},
          onSubmitIntentQuery: () => {},
          plainLanguage: false,
        }),
      ),
    );
    expect(html).toContain("Tell us what is happening");
    expect(html).not.toContain("How can we help you today?");
    expect(html).not.toContain("/health-check");
    for (const id of ["symptoms", "prescription", "risk", "learn", "navigation"]) {
      expect(html).toContain(`data-triage-option="${id}"`);
    }
    expect(html).toContain("Community mediator support");

    expect(ASSISTANT_COPY.en.tree.heading).toBe("Tell us what is happening");
    expect(ASSISTANT_COPY.en.tree.plainHeading).toBe("Tell us what is happening");
    expect(ASSISTANT_COPY.en.symptoms.bodyMapCta).toBe("Show on a body picture");
    for (const locale of Object.values(ASSISTANT_COPY)) {
      expect(locale.symptoms.bodyMapHint).not.toContain("3D");
      expect(locale.symptoms.bodyMapCta).not.toContain("3D");
    }
  });

  it("keeps safety words, open status, triage dt labels, prescription facts, and search prose at body size and AA contrast (P10)", () => {
    const explorerSrc = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    expect(explorerSrc).toContain("{urgentPrefix ? <span className=\"text-primary\">{urgentPrefix}: </span> : null}");
    expect(explorerSrc).toContain("{urgent ? <span className=\"text-primary\">{dict.ui.urgentBadge}: </span> : null}");
    expect(explorerSrc).not.toContain("mt-0.5 block text-meta font-semibold text-primary");

    const summarySrc = readSrc("src/components/health-check/TriageSummaryCard.tsx");
    expect(summarySrc).toContain('<dt className="text-meta font-semibold text-foreground">{row.label}</dt>');
    expect(summarySrc).toContain('<dd className="text-body leading-snug text-foreground">{row.value}</dd>');
    expect(summarySrc).not.toContain('<dt className="text-meta font-medium text-muted-foreground">{row.label}</dt>');

    const findHelpSrc = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(findHelpSrc).toContain('<span className="text-body font-semibold text-foreground">\n                                  {copy.openNowLive}');
    expect(findHelpSrc).toContain('<span className="text-body font-medium text-muted-foreground">\n                                  {copy.closedNowLive}');
    expect(findHelpSrc).not.toContain("text-live-sage");

    const rxSrc = readSrc("src/components/health-assistant/PrescriptionStructuredResult.tsx");
    const namePos = rxSrc.indexOf("{renderWithUnclearHighlights(med.name)}");
    const strengthPos = rxSrc.indexOf('<p className="mt-0.5 text-body font-medium text-muted-foreground tabular-nums">');
    expect(namePos).toBeGreaterThan(-1);
    expect(strengthPos).toBeGreaterThan(namePos);
    expect(rxSrc).toContain("mt-3 text-body leading-relaxed tabular-nums text-foreground");
    expect(rxSrc).toContain('<p className="mt-2 text-body font-semibold text-amber-care dark:text-amber-care-border">');
    expect(rxSrc).toContain("{renderWithUnclearHighlights(result.unclearDoseSentence(med.name))}");

    const searchSrc = readSrc("src/components/search/SmartSearchModal.tsx");
    expect(searchSrc).not.toMatch(/text-ink-900\/(?:45|50|55|60|70|75|80)/);
    expect(searchSrc).not.toMatch(/dark:text-paper\/(?:45|50|55|65|70|75|80)/);
    expect(searchSrc).toContain('<ol className="list-decimal space-y-1.5 pl-5 text-body text-foreground dark:text-paper">');
  });

  it("writes medicine food rule, course length, and unclear dose as full 16px sentences and reads them in speech (P05)", () => {
    const rxSrc = readSrc("src/components/health-assistant/PrescriptionStructuredResult.tsx");
    expect(rxSrc).not.toContain("hasBadges");
    expect(rxSrc).toContain("{result.strengthLabel}: {renderWithUnclearHighlights(med.strength)}");
    expect(rxSrc).toContain('<p className="mt-3 text-body leading-relaxed tabular-nums text-foreground">');
    expect(rxSrc).toContain('<p className="mt-2 text-body font-semibold text-amber-care dark:text-amber-care-border">');

    for (const [locale, copy] of Object.entries(ASSISTANT_COPY)) {
      const r = copy.result;
      expect(r.strengthLabel.trim().length, `${locale}.strengthLabel`).toBeGreaterThan(0);
      expect(r.strengthLabel).not.toContain("&");
      for (const timing of ["before_meal", "with_meal", "after_meal"] as const) {
        const sentence = r.foodTimingSentence[timing];
        expect(sentence.trim().length, `${locale}.foodTimingSentence.${timing}`).toBeGreaterThan(0);
        expect(sentence).not.toContain("&");
      }
      const dur = r.durationSentence("7 days");
      expect(dur).toContain("7 days");
      expect(dur).not.toContain("&");
      const unclear = r.unclearDoseSentence("Amoxicillin");
      expect(unclear).toContain("Amoxicillin");
      expect(unclear).not.toContain("&");
      if (locale === "sq") {
        expect(`${r.strengthLabel} ${unclear}`).not.toMatch(/ndërmjetës/i);
      }
    }

    const html = renderToStaticMarkup(
      createElement(
        LanguageContext.Provider,
        { value: { lang: "en", t: translations.en, setLang: () => {} } },
        createElement(PrescriptionStructuredResult, {
          aiMessage: "Check with your pharmacist before starting.",
          medicines: [
            {
              name: "Amoxicillin",
              strength: "500 mg",
              foodTiming: "before_meal",
              duration: "7 days",
              morning: "[unclear]",
            },
          ],
        }),
      ),
    );
    expect(html).toContain("Strength: 500 mg");
    expect(html).toContain("Take it before food.");
    expect(html).toContain("Take it for 7 days.");
    expect(html).toContain("We could not read the dose for Amoxicillin. Ask your pharmacist.");
    expect(html).toContain("text-body leading-relaxed tabular-nums text-foreground");
    expect(html).toContain("text-body font-semibold text-amber-care dark:text-amber-care-border");

    const enParts = buildMedicineSpeechParts(
      {
        name: "Amoxicillin",
        strength: "500 mg",
        foodTiming: "before_meal",
        duration: "7 days",
        morning: "[unclear]",
      },
      ASSISTANT_COPY.en.result,
    );
    expect(enParts).toContain("Amoxicillin, Strength: 500 mg.");
    expect(enParts).toContain("Take it before food.");
    expect(enParts).toContain("Take it for 7 days.");
    expect(enParts).toContain("We could not read the dose for Amoxicillin. Ask your pharmacist.");

    const enSpeech = buildPrescriptionSpeechText(
      [
        {
          name: "Amoxicillin",
          strength: "500 mg",
          foodTiming: "before_meal",
          duration: "7 days",
          morning: "[unclear]",
        },
      ],
      "Check with your pharmacist.",
      ASSISTANT_COPY.en.result,
      ASSISTANT_COPY.en.rx.rules,
    );
    expect(enSpeech).toContain("Take it before food.");
    expect(enSpeech).toContain("Take it for 7 days.");
    expect(enSpeech).toContain("We could not read the dose for Amoxicillin. Ask your pharmacist.");

    const roSpeech = buildMedicineSpeechParts(
      { name: "Paracetamol", strength: "500 mg", foodTiming: "after_meal", duration: "5 zile" },
      ASSISTANT_COPY.ro.result,
    );
    expect(roSpeech).toContain("Paracetamol, Concentrație: 500 mg.");
    expect(roSpeech).toContain("Se ia după masă.");
    expect(roSpeech).toContain("Se ia timp de 5 zile.");

    const ruSpeech = buildMedicineSpeechParts(
      { name: "Ибупрофен", strength: "400 мг", foodTiming: "with_meal", duration: "7 дней" },
      ASSISTANT_COPY.ru.result,
    );
    expect(ruSpeech).toContain("Ибупрофен, Дозировка: 400 мг.");
    expect(ruSpeech).toContain("Принимайте во время еды.");
    expect(ruSpeech).toContain("Принимайте 7 дней.");
  });
});

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ASSISTANT_COPY } from "@/components/health-assistant/assistant-copy";
import { PathwayRisk } from "@/components/health-assistant/pathways/PathwayRisk";
import { TRIAGE_READING_LEVEL_COPY } from "@/components/health-assistant/TriagePlainLanguageToggle";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";
import { initialTriageState, triageReducer } from "@/lib/triage-state";

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

const OWNED_SOURCE_FILES = [
  "src/components/health-assistant/TriageStateMachine.tsx",
  "src/components/health-assistant/TriagePlainLanguageToggle.tsx",
  "src/components/health-assistant/TriageDecisionTree.tsx",
  "src/components/health-assistant/LegalRightsCard.tsx",
  "src/components/health-assistant/MediatorRequestModal.tsx",
  "src/components/health-assistant/pathways/PathwayRisk.tsx",
  "src/components/health-assistant/pathways/PathwayNavigation.tsx",
  "src/components/health-assistant/pathways/PathwaySymptomsMild.tsx",
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

    for (const file of [
      "src/components/health-assistant/TriageStateMachine.tsx",
      "src/components/health-assistant/LegalRightsCard.tsx",
      "src/components/health-assistant/MediatorRequestModal.tsx",
      "src/components/health-assistant/pathways/PathwayRisk.tsx",
      "src/components/find-help/FindHelpExplorer.tsx",
    ]) {
      const src = readSrc(file);
      expect(src, file).toContain("press-row");
      expect(src, file).toContain("motion-reduce:transition-none");
    }

    expect(readSrc("src/components/health-assistant/pathways/PathwayRisk.tsx")).toContain("press-solid");
    expect(readSrc("src/components/find-help/FindHelpExplorer.tsx")).toContain("press-solid");
  });

  it("replaces focus-visible:ring-sapphire and outline-primary with focus-visible:ring-ring", () => {
    for (const file of OWNED_SOURCE_FILES) {
      const src = readSrc(file);
      expect(src, `${file} still has focus-visible:ring-sapphire`).not.toContain("focus-visible:ring-sapphire");
      expect(src, `${file} still has focus-visible:outline-primary`).not.toContain("focus-visible:outline-primary");
    }

    for (const file of [
      "src/components/health-assistant/TriageStateMachine.tsx",
      "src/components/health-assistant/TriagePlainLanguageToggle.tsx",
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
      expect(readSrc(file), file).toContain("focus-visible:ring-ring");
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
    expect(explorer).toContain("<AssistantNavigation />");
    expect(explorer).toContain("h-1 flex-1 rounded-sm");
    expect(explorer).toContain("inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg");
  });

  it("enforces 44px touch targets (min-h-11) and border-border-control across controls", () => {
    const stateMachine = readSrc("src/components/health-assistant/TriageStateMachine.tsx");
    expect(stateMachine).toContain("min-h-11");
    expect(stateMachine).toContain("border-border-control");
    expect(stateMachine).not.toContain("min-h-10");

    const toggle = readSrc("src/components/health-assistant/TriagePlainLanguageToggle.tsx");
    expect(toggle).toContain("min-h-11");
    expect(toggle).not.toContain("min-h-10");
    expect(Object.keys(TRIAGE_READING_LEVEL_COPY)).toEqual(["ru", "en", "ro", "sq", "it", "hr", "rom"]);

    const tree = readSrc("src/components/health-assistant/TriageDecisionTree.tsx");
    expect(tree).toContain("min-h-11");
    expect(tree).not.toContain("min-h-9");

    const bodyMap = readSrc("src/components/health-check/AnatomicalBodyMap.tsx");
    expect(bodyMap).toContain("min-h-11");
    expect(bodyMap).not.toContain("min-h-10");
    expect(bodyMap).toContain("border-border-control");

    const explorer = readSrc("src/components/health-check/HealthCheckExplorer.tsx");
    expect(explorer).toContain("-my-1.5 inline-flex min-h-11 items-center rounded-md");
    expect(explorer).toContain("inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-xs");
    expect(explorer).toContain("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-2.5 text-sm");

    const findHelp = readSrc("src/components/find-help/FindHelpExplorer.tsx");
    expect(findHelp).toContain("inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border-control");
    expect(findHelp).not.toContain("min-h-9");
  });

  it("keeps mild self-care list markers sapphire while preserving primary for emergency warnings", () => {
    const mild = readSrc("src/components/health-assistant/pathways/PathwaySymptomsMild.tsx");
    expect(mild).toContain("marker:text-sapphire");
    expect(mild).not.toMatch(/<ol[^>]*marker:text-primary/);
    expect(mild).toContain("shrink-0 text-primary");
    expect(mild).toContain("list-disc marker:text-primary");
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
});

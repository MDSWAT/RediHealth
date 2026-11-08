"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { TriageDecisionTree } from "@/components/health-assistant/TriageDecisionTree";
import { TriagePlainLanguageToggle } from "@/components/health-assistant/TriagePlainLanguageToggle";
import { PathwayLearn } from "@/components/health-assistant/pathways/PathwayLearn";
import { PathwayRisk } from "@/components/health-assistant/pathways/PathwayRisk";
import { PathwaySymptomsEmergencyGate } from "@/components/health-assistant/pathways/PathwaySymptomsEmergencyGate";
import { PathwaySymptomsMild } from "@/components/health-assistant/pathways/PathwaySymptomsMild";
import { PathwayPrescription } from "@/components/health-assistant/pathways/PathwayPrescription";
import { PathwayNavigation } from "@/components/health-assistant/pathways/PathwayNavigation";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";
import { useLanguage } from "@/lib/i18n/language-context";
import { initialTriageState, PathwayId, triageReducer } from "@/lib/triage-state";

const READING_LEVEL_KEY = "redihealth_reading_level";

interface TriageStateMachineProps {
  initialPathway?: PathwayId;
  initialCampaign?: string;
  initialEntry?: string;
  className?: string;
}

export function TriageStateMachine({
  initialPathway,
  initialCampaign,
  initialEntry,
  className = "",
}: TriageStateMachineProps) {
  const copy = useAssistantCopy();
  const { lang } = useLanguage();
  const [state, dispatch] = useReducer(triageReducer, {
    ...initialTriageState,
    // Plain language is the default reading level, as on the topic pages.
    plainLanguage: true,
    step: initialPathway ? 2 : 1,
    pathway: initialPathway || null,
    campaign: initialCampaign,
    entry: initialEntry,
  });

  // Changes whenever a different step view replaces the current one.
  const viewKey = `${state.step}-${state.pathway ?? "none"}-${state.symptomData.hasEmergencySigns ?? "u"}`;
  // The view shown on arrival is already in place; only views the person moves to settle in.
  const [arrivalViewKey] = useState(viewKey);

  const cardRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Restore the reader's reading level. The topic pages store it under redihealth_reading_level;
  // redihealth_plain_language is the assistant's older key, still read for returning visitors.
  useEffect(() => {
    try {
      const shared = localStorage.getItem(READING_LEVEL_KEY);
      const legacy = localStorage.getItem("redihealth_plain_language");
      const storedPlain =
        shared === "simple" ? true : shared === "complete" ? false : legacy === "false" ? false : null;
      if (storedPlain === false) {
        dispatch({ type: "TOGGLE_PLAIN_LANGUAGE", value: false });
      }
    } catch {
      // Ignore
    }
  }, []);

  function toggleReadingLevel() {
    const nextPlain = !state.plainLanguage;
    dispatch({ type: "TOGGLE_PLAIN_LANGUAGE", value: nextPlain });
    try {
      localStorage.setItem(READING_LEVEL_KEY, nextPlain ? "simple" : "complete");
    } catch {
      // Ignore
    }
  }

  // Handle keyboard Escape to go back
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented && state.step > 1) {
        dispatch({ type: "GO_BACK" });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.step]);

  // A new step replaces the content the person just clicked in: bring the top of the card back
  // into view on small screens and move focus to the new step so screen readers start there.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
    contentRef.current?.focus({ preventScroll: true });
  }, [viewKey]);

  const stepLabel = copy.machine.stepOf(state.step);

  return (
    <section
      ref={cardRef}
      data-triage-card
      aria-label={copy.machine.intro}
      className={`max-w-2xl rounded-xl border border-border bg-card p-5 shadow-xs sm:p-8 ${className}`}
    >
      <div className="mb-6 border-b border-border pb-4">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-h-[44px] items-center gap-3">
            {state.step > 1 ? (
              <button
                type="button"
                onClick={() => dispatch({ type: "GO_BACK" })}
                className="-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>{copy.machine.back}</span>
              </button>
            ) : null}
            <p className="text-sm text-muted-foreground tabular-nums">
              {stepLabel}
            </p>
          </div>

          <TriagePlainLanguageToggle
            enabled={state.plainLanguage}
            onToggle={toggleReadingLevel}
          />
        </div>

        <div
          className="mt-3 flex h-1 w-full gap-1.5"
          role="progressbar"
          aria-label={copy.machine.progressLabel}
          aria-valuenow={state.step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuetext={stepLabel}
        >
          {[1, 2, 3].map((segment) => (
            <div
              key={segment}
              className={`h-1 flex-1 rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-calm)] ${
                state.step >= segment ? "bg-sapphire dark:bg-sapphire-border" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div
        key={viewKey}
        ref={contentRef}
        tabIndex={-1}
        className={viewKey === arrivalViewKey ? undefined : "assistant-step-in"}
      >
        {state.step === 1 && (
          <TriageDecisionTree
            onSelectPathway={(pathway) => dispatch({ type: "SELECT_PATHWAY", pathway })}
            onSubmitIntentQuery={(query) => {
              // English, Albanian and Italian text is routed here first; the shared classifier is Romanian-only.
              const localPathway = classifyLocalIntent(query, lang);
              if (localPathway) dispatch({ type: "SELECT_PATHWAY", pathway: localPathway });
              else dispatch({ type: "SUBMIT_INTENT_SEARCH", query });
            }}
            plainLanguage={state.plainLanguage}
          />
        )}

        {state.step >= 2 && state.pathway === "learn" && (
          <PathwayLearn
            step={state.step as 2 | 3}
            selectedTopicId={state.learnTopicId}
            onSelectTopic={(topicId) => dispatch({ type: "SET_LEARN_TOPIC", topicId })}
            plainLanguage={state.plainLanguage}
          />
        )}

        {state.step >= 2 && state.pathway === "risk" && (
          <PathwayRisk
            step={state.step as 2 | 3}
            answers={state.riskAnswers}
            onAnswer={(question, value) => dispatch({ type: "SET_RISK_ANSWER", question, value })}
            onQuickResolve={() => dispatch({ type: "COMPLETE_RISK_ASSESSMENT" })}
            plainLanguage={state.plainLanguage}
          />
        )}

        {state.step >= 2 && state.pathway === "symptoms" && (
          <>
            {state.step === 2 && state.symptomData.hasEmergencySigns === undefined ? (
              <PathwaySymptomsEmergencyGate
                onSelectEmergency={() => dispatch({ type: "SET_SYMPTOM_EMERGENCY", hasEmergency: true })}
                onSelectMild={() => dispatch({ type: "SET_SYMPTOM_EMERGENCY", hasEmergency: false })}
                plainLanguage={state.plainLanguage}
              />
            ) : (
              <PathwaySymptomsMild
                step={state.step as 2 | 3}
                hasEmergencySigns={state.symptomData.hasEmergencySigns}
                mildCategory={state.symptomData.mildCategory}
                onSelectCategory={(category) => dispatch({ type: "SET_MILD_CATEGORY", category })}
                plainLanguage={state.plainLanguage}
              />
            )}
          </>
        )}

        {state.step >= 2 && state.pathway === "prescription" && (
          <PathwayPrescription
            step={state.step as 2 | 3}
            input={state.prescriptionInput}
            onSelectInput={(method, medicineName) =>
              dispatch({ type: "SET_PRESCRIPTION_INPUT", method, medicineName })
            }
            plainLanguage={state.plainLanguage}
          />
        )}

        {state.step >= 2 && state.pathway === "navigation" && (
          <PathwayNavigation
            step={state.step as 2 | 3}
            selectedScenario={state.navigationScenario}
            onSelectScenario={(scenario) => dispatch({ type: "SET_NAVIGATION_SCENARIO", scenario })}
            plainLanguage={state.plainLanguage}
          />
        )}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {stepLabel}
      </p>
    </section>
  );
}

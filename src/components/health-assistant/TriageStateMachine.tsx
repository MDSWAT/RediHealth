"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { TriageDecisionTree } from "@/components/health-assistant/TriageDecisionTree";
import { TriagePlainLanguageToggle } from "@/components/health-assistant/TriagePlainLanguageToggle";
import { PathwayLearn } from "@/components/health-assistant/pathways/PathwayLearn";
import { PathwayRisk } from "@/components/health-assistant/pathways/PathwayRisk";
import { PathwaySymptomsEmergencyGate } from "@/components/health-assistant/pathways/PathwaySymptomsEmergencyGate";
import { PathwaySymptomsMild } from "@/components/health-assistant/pathways/PathwaySymptomsMild";
import { PathwayPrescription } from "@/components/health-assistant/pathways/PathwayPrescription";
import { PathwayNavigation } from "@/components/health-assistant/pathways/PathwayNavigation";
import {
  type LearnTopicId,
  type MildCategoryId,
  type NavigationScenarioId,
  useAssistantCopy,
} from "@/components/health-assistant/assistant-copy";
import { classifyLocalIntent } from "@/components/health-assistant/intent-keywords";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  getCalmMotionSnapshot,
  getReadingLevelSnapshot,
  setReadingLevel,
  subscribeComfort,
} from "@/lib/comfort-preferences";
import {
  initialTriageState,
  PathwayId,
  triageReducer,
  type TriageAction,
  type TriageState,
} from "@/lib/triage-state";

type TrailActionType = "JUMP_TO_START" | "JUMP_TO_GATE" | "JUMP_TO_STEP2";

type LocalTriageAction =
  | TriageAction
  | { type: "JUMP_TO_START" }
  | { type: "JUMP_TO_GATE" }
  | { type: "JUMP_TO_STEP2" };

function computeDisplayStep(state: TriageState): number {
  if (state.step === 1 || !state.pathway) return 1;
  if (state.pathway === "symptoms") {
    if (state.step === 3) return 4;
    return state.symptomData.hasEmergencySigns === false ? 3 : 2;
  }
  return state.step;
}

function enhancedTriageReducer(state: TriageState, action: LocalTriageAction): TriageState {
  if (action.type === "JUMP_TO_START") {
    return {
      ...initialTriageState,
      plainLanguage: state.plainLanguage,
      campaign: state.campaign,
      entry: state.entry,
    };
  }
  if (action.type === "JUMP_TO_GATE") {
    return {
      ...state,
      step: 2,
      symptomData: {},
    };
  }
  if (action.type === "JUMP_TO_STEP2") {
    if (state.pathway === "symptoms") {
      return {
        ...state,
        step: 2,
        symptomData: {
          hasEmergencySigns: state.symptomData.hasEmergencySigns === true ? undefined : false,
        },
      };
    }
    return {
      ...state,
      step: 2,
      learnTopicId: undefined,
      riskAnswers: {},
      prescriptionInput: {},
      navigationScenario: undefined,
    };
  }
  if (action.type === "GO_BACK" && state.pathway === "symptoms") {
    if (state.step === 3 && state.symptomData.hasEmergencySigns === true) {
      return { ...state, step: 2, symptomData: {} };
    }
    if (state.step === 3 && state.symptomData.hasEmergencySigns === false) {
      return { ...state, step: 2, symptomData: { hasEmergencySigns: false } };
    }
    if (state.step === 2 && state.symptomData.hasEmergencySigns === false) {
      return { ...state, step: 2, symptomData: {} };
    }
  }
  return triageReducer(state, action);
}

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
  const [state, dispatch] = useReducer(enhancedTriageReducer, {
    ...initialTriageState,
    // Plain language is the default reading level, as on the topic pages.
    plainLanguage: true,
    step: initialPathway ? 2 : 1,
    pathway: initialPathway || null,
    campaign: initialCampaign,
    entry: initialEntry,
  });

  const totalSteps = state.pathway === "symptoms" ? 4 : 3;
  const displayStep = computeDisplayStep(state);

  // Changes whenever a different step view replaces the current one.
  const viewKey = `${displayStep}-${state.pathway ?? "none"}-${state.symptomData.hasEmergencySigns ?? "u"}`;

  const cardRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const prevAnimStepRef = useRef(displayStep);

  // Browser/mobile Back history synchronization
  const pushedCountRef = useRef(0);
  const prevStepForHistoryRef = useRef(displayStep);
  const fromPopStateRef = useRef(false);
  const ignorePopCountRef = useRef(0);
  const displayStepRef = useRef(displayStep);
  useEffect(() => {
    displayStepRef.current = displayStep;
  }, [displayStep]);

  useEffect(() => {
    window.history.replaceState(
      { ...(window.history.state ?? {}), triageManaged: true, triageStep: displayStepRef.current },
      "",
    );
    const handlePopState = () => {
      if (ignorePopCountRef.current > 0) {
        ignorePopCountRef.current -= 1;
        return;
      }
      if (displayStepRef.current > 1) {
        pushedCountRef.current = Math.max(0, pushedCountRef.current - 1);
        fromPopStateRef.current = true;
        dispatch({ type: "GO_BACK" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const prev = prevStepForHistoryRef.current;
    prevStepForHistoryRef.current = displayStep;
    if (fromPopStateRef.current) {
      fromPopStateRef.current = false;
      return;
    }
    if (displayStep > prev) {
      const delta = displayStep - prev;
      for (let i = 0; i < delta; i += 1) {
        pushedCountRef.current += 1;
        window.history.pushState(
          { ...(window.history.state ?? {}), triageManaged: true, triageStep: prev + i + 1 },
          "",
        );
      }
    }
  }, [displayStep]);

  const unwindHistoryBy = useCallback((stepsBack: number) => {
    const toPop = Math.min(stepsBack, pushedCountRef.current);
    if (toPop > 0 && typeof window !== "undefined") {
      pushedCountRef.current -= toPop;
      ignorePopCountRef.current += 1;
      window.history.go(-toPop);
    }
  }, []);

  const stepBack = useCallback(() => {
    if (displayStepRef.current <= 1) return;
    dispatch({ type: "GO_BACK" });
    unwindHistoryBy(1);
  }, [unwindHistoryBy]);

  const handleTrailSelect = useCallback(
    (action: TrailActionType, stepsBack: number) => {
      dispatch({ type: action });
      unwindHistoryBy(stepsBack);
    },
    [unwindHistoryBy],
  );

  // Directional horizontal motion (±10px imperatively on contentRef, instant under prefers-reduced-motion)
  useEffect(() => {
    const prev = prevAnimStepRef.current;
    prevAnimStepRef.current = displayStep;
    if (prev === displayStep) return;
    const el = contentRef.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || getCalmMotionSnapshot()) {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.transition = "";
      return;
    }
    const offsetPx = displayStep < prev ? -10 : 10;
    if (typeof el.animate === "function") {
      const anim = el.animate(
        [
          { opacity: 0, transform: `translate3d(${offsetPx}px, 0, 0)` },
          { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        { duration: 220, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
      );
      return () => anim.cancel();
    }
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translate3d(${offsetPx}px, 0, 0)`;
    const rafId = window.requestAnimationFrame(() => {
      el.style.transition =
        "transform var(--dur-base) var(--ease-out-calm), opacity var(--dur-base) var(--ease-out-calm)";
      el.style.opacity = "1";
      el.style.transform = "translate3d(0, 0, 0)";
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [viewKey, displayStep]);

  // Keep reading level synced with the global comfort preferences store.
  const plainLanguageRef = useRef(state.plainLanguage);
  useEffect(() => {
    plainLanguageRef.current = state.plainLanguage;
  }, [state.plainLanguage]);

  useEffect(() => {
    const syncReadingLevel = () => {
      const nextPlain = getReadingLevelSnapshot() === "simple";
      if (nextPlain !== plainLanguageRef.current) {
        dispatch({ type: "TOGGLE_PLAIN_LANGUAGE", value: nextPlain });
      }
    };
    syncReadingLevel();
    return subscribeComfort(syncReadingLevel);
  }, []);

  function toggleReadingLevel() {
    const nextPlain = !state.plainLanguage;
    dispatch({ type: "TOGGLE_PLAIN_LANGUAGE", value: nextPlain });
    setReadingLevel(nextPlain ? "simple" : "complete");
  }

  // Handle keyboard Escape to go back
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !e.defaultPrevented && displayStepRef.current > 1) {
        dispatch({ type: "GO_BACK" });
        unwindHistoryBy(1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [unwindHistoryBy]);

  // Bring top of card into view on small screens and move focus to the new step
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || getCalmMotionSnapshot();
      card.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
    contentRef.current?.focus({ preventScroll: true });
  }, [viewKey]);

  const stepLabel = copy.machine.stepOf(displayStep, totalSteps);

  // Build clickable Selected Answers Trail chips (pure serializable render data)
  const trailItems: { key: string; label: string; action: TrailActionType; stepsBack: number }[] = [];
  if (displayStep > 1 && state.pathway) {
    const pathwayOption = copy.tree.options[state.pathway];
    const pathwayLabel = pathwayOption.title;
    trailItems.push({
      key: "pathway",
      label: pathwayLabel,
      action: "JUMP_TO_START",
      stepsBack: displayStep - 1,
    });

    if (state.pathway === "symptoms" && state.symptomData.hasEmergencySigns !== undefined) {
      trailItems.push({
        key: "gate",
        label: state.symptomData.hasEmergencySigns ? copy.gate.yesSeeTips : copy.gate.noNoneOfThese,
        action: "JUMP_TO_GATE",
        stepsBack: Math.max(1, displayStep - 2),
      });
    }

    if (displayStep === totalSteps) {
      if (
        state.pathway === "symptoms" &&
        state.symptomData.hasEmergencySigns === false &&
        state.symptomData.mildCategory
      ) {
        const cat = copy.symptoms.categories[state.symptomData.mildCategory as MildCategoryId];
        if (cat) {
          trailItems.push({
            key: "mildCategory",
            label: cat.title,
            action: "JUMP_TO_STEP2",
            stepsBack: 1,
          });
        }
      } else if (state.pathway === "learn" && state.learnTopicId) {
        const topic = copy.learn.topics[state.learnTopicId as LearnTopicId];
        if (topic) {
          trailItems.push({
            key: "learnTopic",
            label: topic.title,
            action: "JUMP_TO_STEP2",
            stepsBack: 1,
          });
        }
      } else if (state.pathway === "navigation" && state.navigationScenario) {
        const scenario = copy.nav.scenarios[state.navigationScenario as NavigationScenarioId];
        if (scenario) {
          trailItems.push({
            key: "navScenario",
            label: scenario.title,
            action: "JUMP_TO_STEP2",
            stepsBack: 1,
          });
        }
      } else if (state.pathway === "prescription" && state.prescriptionInput.method) {
        const rxLabel = state.prescriptionInput.medicineName
          ? state.prescriptionInput.medicineName
          : state.prescriptionInput.method === "photo"
            ? copy.rx.photoTitle
            : copy.rx.searchTitle;
        trailItems.push({
          key: "rxInput",
          label: rxLabel,
          action: "JUMP_TO_STEP2",
          stepsBack: 1,
        });
      }
    }
  }

  return (
    <section
      ref={cardRef}
      data-triage-card
      aria-label={copy.machine.intro}
      className={`min-w-0 overflow-hidden scroll-mt-[calc(var(--chrome-h,0px)+1rem)] rounded-2xl border border-stone-200/90 bg-card shadow-(--shadow-card-rest) dark:border-stone-800 ${className}`}
    >
      <header className="relative flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-200/80 bg-muted/25 px-4 py-3.5 sm:flex-nowrap sm:gap-4 sm:px-7 dark:border-stone-800">
        <div className="flex min-h-11 w-full items-center justify-between gap-3 sm:w-auto sm:min-w-0 sm:justify-start">
          {displayStep > 1 ? (
            <>
              <button
                type="button"
                onClick={stepBack}
                className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border-control bg-card px-3.5 py-2 text-sm font-semibold text-sapphire shadow-2xs press-row transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/40 hover:bg-sapphire-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{copy.machine.back}</span>
              </button>
              <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground tabular-nums sm:text-sm">
                <span aria-hidden="true" className="sm:hidden">
                  {displayStep} / {totalSteps}
                </span>
                <span className="sr-only sm:not-sr-only">{stepLabel}</span>
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              {/* Decorative 20px SVG mark matching hero instrument header */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Icons/Logo.svg" alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
              <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-foreground tabular-nums">
                {stepLabel}
              </p>
            </div>
          )}
        </div>

        <TriagePlainLanguageToggle
          enabled={state.plainLanguage}
          onToggle={toggleReadingLevel}
        />

        {/* Full-bleed 2px sapphire progress hairline along bottom edge of instrument header */}
        <div
          className="absolute inset-x-0 bottom-0 h-0.5 bg-stone-200/80 dark:bg-stone-800"
          role="progressbar"
          aria-label={copy.machine.progressLabel}
          aria-valuenow={displayStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuetext={stepLabel}
        >
          <div
            className="h-full bg-sapphire transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none dark:bg-sapphire-border"
            style={{ width: `${(displayStep / totalSteps) * 100}%` }}
          />
        </div>
      </header>

      <div className="p-5 sm:p-7">
        {trailItems.length > 1 && (
          <nav
            aria-label={copy.machine.selectedTrailLabel}
            className="mb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ol className="flex items-center gap-x-1 text-xs text-muted-foreground sm:text-[0.8125rem]">
              {trailItems.map((item, index) => (
                <li key={item.key} className="flex shrink-0 items-center">
                  {index > 0 && (
                    <span aria-hidden="true" className="mx-1 text-muted-foreground/50">
                      ›
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTrailSelect(item.action, item.stepsBack)}
                    className="-my-1.5 inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-1.5 py-1.5 font-medium text-sapphire press-row transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          key={viewKey}
          ref={contentRef}
          tabIndex={-1}
        >
        {state.step === 1 && (
          <TriageDecisionTree
            onSelectPathway={(pathway) => dispatch({ type: "SELECT_PATHWAY", pathway })}
            onSubmitIntentQuery={(query) => {
              // English, Albanian and Italian text is routed here first; the shared classifier is Romanian-only.
              const localPathway = classifyLocalIntent(query, lang);
              if (localPathway) {
                dispatch({ type: "SUBMIT_INTENT_SEARCH", query });
                dispatch({ type: "SELECT_PATHWAY", pathway: localPathway });
              } else {
                dispatch({ type: "SUBMIT_INTENT_SEARCH", query });
              }
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
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {stepLabel}
      </p>
    </section>
  );
}

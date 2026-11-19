"use client";

import { ArrowRightIcon } from "@/components/ui/icons";
import { LegalRightsCard } from "@/components/health-assistant/LegalRightsCard";
import { MediatorRequestModal } from "@/components/health-assistant/MediatorRequestModal";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import {
  getAssistantCopy,
  type NavigationScenarioId,
  useAssistantCopy,
} from "@/components/health-assistant/assistant-copy";
import {
  optionArrow,
  optionRow,
  optionTitle,
  stepHeading,
  stepLead,
  subHeading,
} from "@/components/health-assistant/step-ui";

interface PathwayNavigationProps {
  step: 2 | 3;
  selectedScenario?: NavigationScenarioId;
  onSelectScenario: (scenario: NavigationScenarioId) => void;
  plainLanguage: boolean;
}

const SCENARIO_IDS: NavigationScenarioId[] = ["family_doctor", "no_insurance_id", "hospital_documents"];

export function PathwayNavigation({ step, selectedScenario, onSelectScenario }: PathwayNavigationProps) {
  const { nav } = useAssistantCopy();

  if (step === 2) {
    return (
      <div>
        <h2 className={stepHeading}>{nav.heading}</h2>
        <p className={stepLead}>{nav.lead}</p>

        <ul className="mt-5 grid grid-cols-1 gap-3">
          {SCENARIO_IDS.map((id) => {
            const scenario = nav.scenarios[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectScenario(id)}
                  className={`${optionRow} sm:px-6`}
                >
                  <span className="min-w-0 flex-1">
                    <span className={`${optionTitle} sm:text-title`}>{scenario.title}</span>
                    {/* Body size, not the 14px option text: these lines decide which path to take. */}
                    <span className="mt-1 block text-body text-muted-foreground">{scenario.desc}</span>
                  </span>
                  <ArrowRightIcon aria-hidden="true" className={optionArrow} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const currentId = SCENARIO_IDS.find((id) => id === selectedScenario) ?? SCENARIO_IDS[0];
  const scenario = nav.scenarios[currentId];

  return (
    <div>
      <h2 className="text-section font-semibold leading-snug text-foreground text-balance">{scenario.title}</h2>

      <h3 className={`mt-8 ${subHeading}`}>{nav.planHeading}</h3>
      {/*
        The one bold element on this page: the steps are a real sequence (where to go, what to
        bring, what if uninsured), drawn as a path. Each number sits on a sapphire line that joins
        it to the next, so the reader sees how far the path goes before reading a word.
      */}
      <ol className="mt-5">
        {scenario.steps.map((item, idx) => {
          const isLast = idx === scenario.steps.length - 1;
          return (
            <li key={item.title} className="relative flex gap-4 sm:gap-5">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[1.1875rem] top-11 bottom-1 w-0.5 rounded-md bg-sapphire/20 dark:bg-sapphire-border/25"
                />
              )}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-sapphire bg-background text-lead font-semibold tabular-nums text-sapphire dark:border-sapphire-border dark:text-sapphire-border"
              >
                {idx + 1}
              </span>
              <div className={`min-w-0 pt-1.5 ${isLast ? "" : "pb-7"}`}>
                <p className="text-title font-semibold leading-snug text-foreground">{item.title}</p>
                <p className="mt-1.5 max-w-(--measure-reading) text-reading text-foreground/85">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <LegalRightsCard className="mt-10" />

      <section className="mt-10 border-t border-border pt-8">
        <h3 className={subHeading}>{nav.mediatorTitle}</h3>
        <p className="mt-1 text-body text-muted-foreground">{nav.mediatorBody}</p>
        {/* Mediators read requests in Romanian, so the scenario is sent in Romanian on every page. */}
        <MediatorRequestModal className="mt-4" defaultScenario={getAssistantCopy("ro").nav.scenarios[currentId].title} />
      </section>

      <UniversalDoctorExit pathway="navigation" summary={nav.summary(scenario.title)} />
    </div>
  );
}

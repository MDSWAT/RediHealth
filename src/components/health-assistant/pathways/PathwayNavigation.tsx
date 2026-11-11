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
  optionDesc,
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

        <ul className="mt-6 grid grid-cols-1 gap-3">
          {SCENARIO_IDS.map((id) => {
            const scenario = nav.scenarios[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectScenario(id)}
                  className={optionRow}
                >
                  <span className="min-w-0 flex-1">
                    <span className={optionTitle}>{scenario.title}</span>
                    <span className={optionDesc}>{scenario.desc}</span>
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
      <h2 className={stepHeading}>{scenario.title}</h2>

      <h3 className={`mt-6 ${subHeading}`}>{nav.planHeading}</h3>
      <ol className="mt-3 space-y-4">
        {scenario.steps.map((item, idx) => (
          <li key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sapphire-soft text-sm font-semibold tabular-nums text-sapphire"
            >
              {idx + 1}
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <LegalRightsCard className="mt-8" />

      <section className="mt-8 border-t border-border pt-6">
        <h3 className={subHeading}>{nav.mediatorTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{nav.mediatorBody}</p>
        {/* Mediators read requests in Romanian, so the scenario is sent in Romanian on every page. */}
        <MediatorRequestModal className="mt-4" defaultScenario={getAssistantCopy("ro").nav.scenarios[currentId].title} />
      </section>

      <UniversalDoctorExit pathway="navigation" summary={nav.summary(scenario.title)} />
    </div>
  );
}

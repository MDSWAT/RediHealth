"use client";

import { LegalRightsCard } from "@/components/health-assistant/LegalRightsCard";
import { MediatorRequestModal } from "@/components/health-assistant/MediatorRequestModal";
import { UniversalDoctorExit } from "@/components/health-assistant/UniversalDoctorExit";
import {
  getAssistantCopy,
  type NavigationScenarioId,
  useAssistantCopy,
} from "@/components/health-assistant/assistant-copy";

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
        <h2 className="text-lg font-semibold text-foreground">{nav.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{nav.lead}</p>

        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border">
          {SCENARIO_IDS.map((id) => {
            const scenario = nav.scenarios[id];
            return (
              <li key={id}>
                <button
                  type="button"
                  data-triage-option={id}
                  onClick={() => onSelectScenario(id)}
                  className="flex min-h-[56px] w-full flex-col items-start bg-card px-4 py-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/50 focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sapphire sm:px-5"
                >
                  <span className="text-base font-semibold text-foreground">{scenario.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{scenario.desc}</span>
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
      <h2 className="text-lg font-semibold text-foreground">{scenario.title}</h2>

      <h3 className="mt-5 text-sm font-semibold text-foreground">{nav.planHeading}</h3>
      <ol className="mt-3 space-y-4">
        {scenario.steps.map((item, idx) => (
          <li key={item.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border text-sm font-semibold tabular-nums text-foreground"
            >
              {idx + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-base font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <LegalRightsCard className="mt-8" />

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-base font-semibold text-foreground">{nav.mediatorTitle}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{nav.mediatorBody}</p>
        {/* Mediators read requests in Romanian, so the scenario is sent in Romanian on every page. */}
        <MediatorRequestModal className="mt-4" defaultScenario={getAssistantCopy("ro").nav.scenarios[currentId].title} />
      </section>

      <UniversalDoctorExit pathway="navigation" summary={nav.summary(scenario.title)} />
    </div>
  );
}

"use client";

import { PathwayId } from "@/lib/triage-state";
import { TriageInputBar } from "@/components/health-assistant/TriageInputBar";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  stepHeading,
  stepLead,
} from "@/components/health-assistant/step-ui";

interface TriageDecisionTreeProps {
  onSelectPathway: (pathway: PathwayId) => void;
  onSubmitIntentQuery: (query: string) => void;
  plainLanguage: boolean;
}

const PATHWAY_OPTIONS: {
  id: PathwayId;
  /** A health mediator (a person) helps on this path; said in one line under the option. */
  mediator?: boolean;
}[] = [
  { id: "symptoms" },
  { id: "prescription" },
  { id: "risk" },
  { id: "learn" },
  { id: "navigation", mediator: true },
];

export function TriageDecisionTree({
  onSelectPathway,
  onSubmitIntentQuery,
  plainLanguage,
}: TriageDecisionTreeProps) {
  const { tree } = useAssistantCopy();

  return (
    <div>
      <h2 className={stepHeading}>
        {plainLanguage ? tree.plainHeading : tree.heading}
      </h2>
      <p className={stepLead}>{tree.lead}</p>

      {/* Flat five-row pathway list matching the hero row recipe */}
      <ul className="mt-5">
        {PATHWAY_OPTIONS.map(({ id, mediator }) => {
          const option = tree.options[id];
          return (
            <li
              key={id}
              className="border-b border-ink-950/[0.08] last:border-b-0 dark:border-ink-800"
            >
              <button
                type="button"
                data-triage-option={id}
                onClick={() => onSelectPathway(id)}
                className="press-row group relative -mx-2 flex min-h-[56px] w-[calc(100%+1rem)] items-center justify-between gap-3.5 rounded-xl px-2 py-2.5 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:-mx-3 sm:min-h-[58px] sm:w-[calc(100%+1.5rem)] sm:px-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-title font-semibold leading-snug text-foreground transition-colors duration-[var(--dur-fast)] group-hover:text-sapphire dark:group-hover:text-sapphire-light">
                    {plainLanguage ? option.plainTitle : option.title}
                  </span>
                  <span className="mt-0.5 block text-body text-muted-foreground">
                    {option.subtitle}
                  </span>
                  {mediator && (
                    <span className="mt-1 block text-meta font-semibold text-amber-care">
                      {tree.mediatorTag}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} plainLanguage={plainLanguage} />
    </div>
  );
}

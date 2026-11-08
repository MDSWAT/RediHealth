"use client";

import {
  ActivityIcon,
  BookIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  HandHelpingIcon,
} from "@/components/ui/icons";
import { PathwayId } from "@/lib/triage-state";
import { TriageInputBar } from "@/components/health-assistant/TriageInputBar";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";

interface TriageDecisionTreeProps {
  onSelectPathway: (pathway: PathwayId) => void;
  onSubmitIntentQuery: (query: string) => void;
  plainLanguage: boolean;
}

const PATHWAYS: { id: PathwayId; icon: typeof BookIcon; urgent?: boolean }[] = [
  { id: "learn", icon: BookIcon },
  { id: "risk", icon: ClipboardCheckIcon },
  { id: "symptoms", icon: ActivityIcon, urgent: true },
  { id: "prescription", icon: FileTextIcon },
  { id: "navigation", icon: HandHelpingIcon },
];

export function TriageDecisionTree({
  onSelectPathway,
  onSubmitIntentQuery,
  plainLanguage,
}: TriageDecisionTreeProps) {
  const { tree } = useAssistantCopy();

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground text-balance sm:text-2xl">
        {plainLanguage ? tree.plainHeading : tree.heading}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tree.lead}</p>

      <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border">
        {PATHWAYS.map(({ id, icon: Icon, urgent }) => {
          const option = tree.options[id];
          return (
            <li key={id}>
              <button
                type="button"
                data-triage-option={id}
                onClick={() => onSelectPathway(id)}
                className="group flex min-h-[64px] w-full items-start gap-3.5 bg-card px-4 py-4 text-left transition-colors duration-[var(--dur-fast)] hover:bg-muted/50 focus-visible:relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-5"
              >
                <Icon
                  className={`mt-0.5 h-5 w-5 shrink-0 ${urgent ? "text-primary" : "text-sapphire dark:text-sapphire-border"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-foreground">
                    {plainLanguage ? option.plainTitle : option.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                    {option.subtitle}
                  </span>
                </span>
                <ChevronRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] group-hover:translate-x-0.5" />
              </button>
            </li>
          );
        })}
      </ul>

      <TriageInputBar onSubmitQuery={onSubmitIntentQuery} />
    </div>
  );
}

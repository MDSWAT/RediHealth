"use client";

import { AlertCircleIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";

interface PathwaySymptomsEmergencyGateProps {
  onSelectEmergency: () => void;
  onSelectMild: () => void;
  plainLanguage: boolean;
}

export function PathwaySymptomsEmergencyGate({
  onSelectEmergency,
  onSelectMild,
  plainLanguage,
}: PathwaySymptomsEmergencyGateProps) {
  const { gate } = useAssistantCopy();
  const signs = plainLanguage ? gate.plainSigns : gate.signs;

  return (
    <div>
      <div className="rounded-lg border border-red-200 bg-red-50/70 p-5 dark:border-red-900/50 dark:bg-red-950/20 sm:p-6">
        <h2 className="flex items-start gap-2.5 text-lg font-semibold text-red-950 dark:text-red-100">
          <AlertCircleIcon className="mt-1 h-5 w-5 shrink-0 text-red-700 dark:text-red-300" />
          <span>{plainLanguage ? gate.plainHeading : gate.heading}</span>
        </h2>
        <ul className="mt-3 space-y-1.5 pl-[1.875rem] text-base leading-relaxed text-red-950 dark:text-red-100">
          {signs.map((sign) => (
            <li key={sign} className="list-disc marker:text-red-700 dark:marker:text-red-300">
              {sign}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            data-gate-emergency
            onClick={onSelectEmergency}
            className="min-h-[48px] flex-1 rounded-lg bg-red-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-red-800"
          >
            {gate.yes}
          </button>
          <button
            type="button"
            data-gate-mild
            onClick={onSelectMild}
            className="min-h-[48px] flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
          >
            {gate.no}
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-muted-foreground">{gate.note}</p>
    </div>
  );
}

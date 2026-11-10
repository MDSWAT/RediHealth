"use client";

import { AlertCircleIcon, PhoneIcon } from "@/components/ui/icons";
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
      <div className="rounded-lg border border-primary/30 bg-primary-soft/55 p-5 sm:p-6">
        <h2 className="flex items-start gap-2.5 text-lg font-semibold text-foreground">
          <AlertCircleIcon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span>{plainLanguage ? gate.plainHeading : gate.heading}</span>
        </h2>
        <ul className="mt-3 space-y-1.5 pl-[1.875rem] text-base leading-relaxed text-foreground">
          {signs.map((sign) => (
            <li key={sign} className="list-disc marker:text-primary">
              {sign}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2.5">
          <a
            href="tel:112"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-center text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            <span>{gate.callNow}</span>
          </a>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              data-gate-emergency
              onClick={onSelectEmergency}
              className="min-h-12 rounded-lg border border-primary/35 bg-card px-4 py-2.5 text-center text-sm font-semibold text-primary transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {gate.yesSeeTips}
            </button>
            <button
              type="button"
              data-gate-mild
              onClick={onSelectMild}
              className="min-h-12 rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2"
            >
              {gate.noNoneOfThese}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-muted-foreground">{gate.note}</p>
    </div>
  );
}

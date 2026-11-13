"use client";

import { PhoneIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  dangerOutlineButton,
  dangerPanel,
  emergencyButton,
  secondaryButton,
  stepHeading,
} from "@/components/health-assistant/step-ui";

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
      <div className={dangerPanel}>
        <h2 className={stepHeading}>
          {plainLanguage ? gate.plainHeading : gate.heading}
        </h2>
        <ul className="mt-4 space-y-2 pl-5 text-base leading-relaxed text-foreground">
          {signs.map((sign) => (
            <li key={sign} className="list-disc marker:text-primary">
              {sign}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <a
            href="tel:112"
            className={`w-full whitespace-nowrap ${emergencyButton}`}
          >
            <PhoneIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{gate.callNow}</span>
          </a>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              data-gate-emergency
              onClick={onSelectEmergency}
              className={`max-w-full ${dangerOutlineButton}`}
            >
              <span className="min-w-0 truncate">{gate.yesSeeTips}</span>
            </button>
            <button
              type="button"
              data-gate-mild
              onClick={onSelectMild}
              className={`max-w-full ${secondaryButton}`}
            >
              <span className="min-w-0 truncate">{gate.noNoneOfThese}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gate.note}</p>
    </div>
  );
}

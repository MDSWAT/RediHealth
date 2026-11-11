"use client";

import { AlertCircleIcon, PhoneIcon } from "@/components/ui/icons";
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
        <h2 className={`flex items-start gap-3 ${stepHeading}`}>
          <AlertCircleIcon className="mt-1 h-5 w-5 shrink-0 text-primary sm:mt-1.5" aria-hidden="true" />
          <span>{plainLanguage ? gate.plainHeading : gate.heading}</span>
        </h2>
        <ul className="mt-4 space-y-2 pl-8 text-base leading-relaxed text-foreground">
          {signs.map((sign) => (
            <li key={sign} className="list-disc marker:text-primary">
              {sign}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <a
            href="tel:112"
            className={`w-full ${emergencyButton}`}
          >
            <PhoneIcon className="h-5 w-5" aria-hidden="true" />
            <span>{gate.callNow}</span>
          </a>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              data-gate-emergency
              onClick={onSelectEmergency}
              className={dangerOutlineButton}
            >
              {gate.yesSeeTips}
            </button>
            <button
              type="button"
              data-gate-mild
              onClick={onSelectMild}
              className={secondaryButton}
            >
              {gate.noNoneOfThese}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gate.note}</p>
    </div>
  );
}

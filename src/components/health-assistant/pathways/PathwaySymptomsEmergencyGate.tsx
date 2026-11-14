"use client";

import { Button } from "@/components/ui/Button";
import { PhoneIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import {
  dangerPanel,
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
        <ul className="mt-4 space-y-2 pl-5 text-body text-foreground">
          {signs.map((sign) => (
            <li key={sign} className="list-disc marker:text-primary">
              {sign}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3">
          <Button
            href="tel:112"
            variant="primary"
            size="lg"
            fullWidth
          >
            <PhoneIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">{gate.callNow}</span>
          </Button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              data-gate-emergency
              onClick={onSelectEmergency}
              className="border-primary/40 text-primary hover:border-primary hover:bg-primary-soft/70 focus-visible:ring-primary"
            >
              <span className="min-w-0 truncate">{gate.yesSeeTips}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              data-gate-mild
              onClick={onSelectMild}
            >
              <span className="min-w-0 truncate">{gate.noNoneOfThese}</span>
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-body text-muted-foreground">{gate.note}</p>
    </div>
  );
}

"use client";

import { AlertCircleIcon, ClockIcon } from "@/components/ui/icons";
import { MedicationScheduleTimeline } from "@/components/health-assistant/MedicationScheduleTimeline";
import { PrescriptionAudioPlayer } from "@/components/health-assistant/PrescriptionAudioPlayer";
import { PrescriptionDoctorBridge } from "@/components/health-assistant/PrescriptionDoctorBridge";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { ParsedPrescription } from "@/lib/prescription-parser";

interface PrescriptionStructuredResultProps {
  parsed: ParsedPrescription;
  /** The assistant's own reply, written in the page language by the API. */
  aiMessage?: string;
  className?: string;
}

export function PrescriptionStructuredResult({ parsed, aiMessage, className = "" }: PrescriptionStructuredResultProps) {
  const { result } = useAssistantCopy();
  const speechText = result.speech(aiMessage?.trim() || parsed.plainSummary, parsed.warnings.join(". "));

  return (
    <div className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{result.heading}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{result.lead}</p>
        </div>
        <PrescriptionAudioPlayer speechText={speechText} className="shrink-0" />
      </div>

      {aiMessage?.trim() ? (
        <section className="mt-6 rounded-lg bg-muted/50 p-4">
          <h3 className="text-sm font-semibold text-foreground">{result.assistantHeading}</h3>
          <p className="mt-1.5 max-w-prose whitespace-pre-line text-base leading-relaxed text-foreground">{aiMessage}</p>
        </section>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold text-foreground">{result.medicinesHeading}</h3>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {parsed.medicines.map((med, idx) => (
              <li key={`${med.name}-${idx}`} className="flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{med.name}</span>
                  {med.instructions && (
                    <span className="mt-0.5 block text-sm text-muted-foreground">{med.instructions}</span>
                  )}
                </div>
                {med.strength && (
                  <span className="shrink-0 text-sm font-medium tabular-nums text-muted-foreground">{med.strength}</span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-foreground">{result.durationHeading}</h3>
          <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClockIcon className="h-5 w-5 shrink-0 text-amber-care" />
            {parsed.duration}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.durationNote}</p>
        </section>
      </div>

      <section className="mt-8 border-t border-border pt-6">
        <MedicationScheduleTimeline heading={result.scheduleHeading} schedule={parsed.schedule} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground">{result.warningsHeading}</h3>
        <ul className="mt-3 space-y-2.5">
          {parsed.warnings.map((warn, idx) => (
            <li key={`${warn}-${idx}`} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />
              <span>{warn}</span>
            </li>
          ))}
        </ul>
      </section>

      <PrescriptionDoctorBridge drugsList={parsed.medicines.map((m) => m.name)} />
    </div>
  );
}

"use client";

import { AlertCircleIcon, CheckCircleIcon, PhoneIcon, PrinterIcon } from "@/components/ui/icons";
import { PrescriptionAudioPlayer } from "@/components/health-assistant/PrescriptionAudioPlayer";
import { PrescriptionDoctorBridge } from "@/components/health-assistant/PrescriptionDoctorBridge";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";

interface PrescriptionStructuredResultProps {
  /** The assistant's own explanation, written in the page language by the API. */
  aiMessage?: string;
  /** Text transcribed from the photo exactly as written (unreadable words are marked [unclear]). */
  prescriptionText?: string;
  /** True when the assistant flagged the request as a possible emergency. */
  emergency?: boolean;
  className?: string;
}

/**
 * Shows only what the assistant actually read and explained, in the page language.
 * No doses, times or durations are filled in on the client: the prescription and the
 * pharmacist stay the source of truth.
 */
export function PrescriptionStructuredResult({
  aiMessage,
  prescriptionText,
  emergency = false,
  className = "",
}: PrescriptionStructuredResultProps) {
  const { result, rx, symptoms } = useAssistantCopy();
  const message = aiMessage?.trim() ?? "";
  const transcript = prescriptionText?.trim() ?? "";
  const speechText = result.speech(message, rx.rules.join(" "));

  return (
    <div className={className}>
      <div className="flex flex-col items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{result.heading}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{result.lead}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
          <PrescriptionAudioPlayer speechText={speechText} />
          <button
            type="button"
            onClick={() => window.print()}
            aria-label={result.printAria}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
          >
            <PrinterIcon className="h-4 w-4 text-muted-foreground" />
            <span>{result.print}</span>
          </button>
        </div>
      </div>

      {emergency ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-red-200/90 bg-red-50/70 p-4 dark:border-red-900/50 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-red-950 dark:text-red-100">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-300" />
            <span>{result.emergency}</span>
          </p>
          <a
            href="tel:112"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-red-800"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{symptoms.callNow}</span>
          </a>
        </div>
      ) : null}

      {message ? (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">{result.assistantHeading}</h3>
          <p className="mt-1.5 max-w-prose whitespace-pre-line text-base leading-relaxed text-foreground">{message}</p>
        </section>
      ) : null}

      {transcript ? (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">{result.transcriptHeading}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{result.transcriptNote}</p>
          <p className="mt-2 whitespace-pre-line rounded-lg bg-muted/60 p-4 font-mono text-sm leading-relaxed text-foreground">
            {transcript}
          </p>
        </section>
      ) : null}

      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-foreground">{result.rulesHeading}</h3>
        <ul className="mt-3 space-y-2.5">
          {rx.rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>

      <PrescriptionDoctorBridge />
    </div>
  );
}

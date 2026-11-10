"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PhoneIcon,
  PrinterIcon,
} from "@/components/ui/icons";
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

const UNCLEAR_CAPTURE_REGEX =
  /(\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|\?{2,})\])/gi;

function isUnclearMarker(token: string): boolean {
  return /^\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|\?{2,})\]$/i.test(
    token
  );
}

function renderWithUnclearHighlights(text: string): ReactNode {
  const parts = text.split(UNCLEAR_CAPTURE_REGEX);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (!part) return null;
    if (isUnclearMarker(part)) {
      return (
        <mark
          key={`${part}-${index}`}
          className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-amber-care-border bg-amber-care-soft px-1.5 py-0.5 align-baseline font-sans text-xs font-semibold text-foreground dark:border-amber-care/45 dark:bg-amber-care/20"
        >
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 text-amber-care dark:text-amber-care-border" />
          <span>{part}</span>
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function splitExplanationIntoBlocks(raw: string): string[] {
  const normalized = raw.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  let chunks = normalized
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 1) {
    const byListMarkers = normalized
      .split(/\n(?=(?:[-•*]|\d+[.)])\s+)/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);
    if (byListMarkers.length > 1) {
      chunks = byListMarkers;
    } else {
      const byLines = normalized
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      if (byLines.length > 1) {
        chunks = byLines;
      }
    }
  }

  return chunks.map((chunk) => chunk.replace(/^[-•*]\s+/, "").trim()).filter(Boolean);
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
  const explanationBlocks = splitExplanationIntoBlocks(message);

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  function handlePrint() {
    setIsPrinting(true);
    requestAnimationFrame(() => {
      window.print();
    });
  }

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
            onClick={handlePrint}
            aria-label={result.printAria}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <PrinterIcon className="h-4 w-4 text-muted-foreground" />
            <span>{result.print}</span>
          </button>
        </div>
      </div>

      {emergency ? (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary-soft/55 p-4 dark:border-primary/40 dark:bg-primary/15 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2.5 text-sm font-medium leading-relaxed text-foreground">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{result.emergency}</span>
          </p>
          <a
            href="tel:112"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{symptoms.callNow}</span>
          </a>
        </div>
      ) : null}

      {explanationBlocks.length > 0 ? (
        <section className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">{result.assistantHeading}</h3>
          <div className="mt-3 space-y-3">
            {explanationBlocks.map((block, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-background p-4 whitespace-pre-line text-base leading-relaxed text-foreground"
              >
                {renderWithUnclearHighlights(block)}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {transcript ? (
        <details
          open={transcriptOpen || isPrinting}
          onToggle={(event) => setTranscriptOpen(event.currentTarget.open)}
          className="group mt-6 rounded-lg border border-border bg-background/60 p-4 print:[&>div]:block print:[&_pre]:block"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire [&::-webkit-details-marker]:hidden">
            <span>{result.transcriptHeading}</span>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] group-open:rotate-180 motion-reduce:transition-none print:hidden" />
          </summary>
          <div className="mt-2 border-t border-border pt-3">
            <p className="text-sm text-muted-foreground">{result.transcriptNote}</p>
            <pre className="mt-2.5 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground">
              {renderWithUnclearHighlights(transcript)}
            </pre>
          </div>
        </details>
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

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
import { type AssistantCopy, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useReadAloud } from "@/components/health-check/readingTools";
import type { PrescribedMedicineItem } from "@/lib/health-assistant";
import { useLanguage } from "@/lib/i18n/language-context";

interface PrescriptionStructuredResultProps {
  /** The assistant's own explanation, written in the page language by the API. */
  aiMessage?: string;
  /** Text transcribed from the photo exactly as written (unreadable words are marked [unclear]). */
  prescriptionText?: string;
  /** Structured medicines extracted from legible prescription lines only. */
  medicines?: PrescribedMedicineItem[];
  /** True when the assistant flagged the request as a possible emergency. */
  emergency?: boolean;
  className?: string;
}

const UNCLEAR_CAPTURE_REGEX =
  /(\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|\?{2,})\])/gi;

const UNCLEAR_DETECT_REGEX =
  /\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|\?{2,})\]/i;

function isUnclearMarker(token: string): boolean {
  return /^\[(?:unclear|illegible|unreadable|neclar|indescifrabil|illeggibile|non chiaro|e paqartë|paqartë|nečitko|nejasno|na uzi|\?{2,})\]$/i.test(
    token
  );
}

function containsUnclearMarker(value?: string): boolean {
  return Boolean(value && UNCLEAR_DETECT_REGEX.test(value));
}

function isMedicineUnclear(med: PrescribedMedicineItem): boolean {
  return Boolean(
    med.unclear ||
      containsUnclearMarker(med.name) ||
      containsUnclearMarker(med.strength) ||
      containsUnclearMarker(med.purpose) ||
      containsUnclearMarker(med.morning) ||
      containsUnclearMarker(med.midday) ||
      containsUnclearMarker(med.evening) ||
      containsUnclearMarker(med.bedtime) ||
      containsUnclearMarker(med.duration) ||
      med.warnings?.some((warning) => containsUnclearMarker(warning))
  );
}

function stripUnclearForSpeech(text: string): string {
  return text.replace(UNCLEAR_CAPTURE_REGEX, "").replace(/\s{2,}/g, " ").trim();
}

function buildMedicineSpeechParts(
  med: PrescribedMedicineItem,
  resultCopy: AssistantCopy["result"]
): string[] {
  const parts: string[] = [];
  const cleanName = stripUnclearForSpeech(med.name);
  const cleanStrength = med.strength ? stripUnclearForSpeech(med.strength) : "";
  if (cleanName) {
    parts.push(cleanStrength ? `${cleanName}, ${cleanStrength}.` : `${cleanName}.`);
  }
  if (med.purpose) {
    const cleanPurpose = stripUnclearForSpeech(med.purpose);
    if (cleanPurpose) parts.push(cleanPurpose);
  }
  if (med.morning) {
    parts.push(`${resultCopy.scheduleSlots.morning}: ${stripUnclearForSpeech(med.morning)}.`);
  }
  if (med.midday) {
    parts.push(`${resultCopy.scheduleSlots.midday}: ${stripUnclearForSpeech(med.midday)}.`);
  }
  if (med.evening) {
    parts.push(`${resultCopy.scheduleSlots.evening}: ${stripUnclearForSpeech(med.evening)}.`);
  }
  if (med.bedtime) {
    parts.push(`${resultCopy.scheduleSlots.bedtime}: ${stripUnclearForSpeech(med.bedtime)}.`);
  }
  if (med.foodTiming && med.foodTiming !== "any") {
    parts.push(`${resultCopy.foodTiming[med.foodTiming]}.`);
  }
  if (med.duration) {
    parts.push(`${resultCopy.durationLabel(stripUnclearForSpeech(med.duration))}.`);
  }
  if (med.warnings?.length) {
    for (const warning of med.warnings) {
      const cleanWarning = stripUnclearForSpeech(warning);
      if (cleanWarning) parts.push(cleanWarning);
    }
  }
  if (isMedicineUnclear(med)) {
    parts.push(resultCopy.unclearBadge);
  }
  return parts;
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

function SunriseSlotSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M10 3.25v2M4.9 6.15l1.4 1.4M15.1 6.15l-1.4 1.4M2.75 13.75h14.5M5.25 16.5h9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.25 13.75a3.75 3.75 0 0 1 7.5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiddaySunSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SunsetSlotSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2.75 13.25h14.5M4.75 16.25h10.5M6.25 13.25a3.75 3.75 0 0 1 7.5 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10 3.5v3.5m0 0-1.6-1.5M10 7l1.6-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BedtimeMoonSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M14.8 12.65A5.8 5.8 0 0 1 7.35 5.2a5.8 5.8 0 1 0 7.45 7.45Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 4.25v2M13.5 5.25h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PillCapsuleSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <rect
        x="3.4"
        y="7.2"
        width="13.2"
        height="5.6"
        rx="2.8"
        transform="rotate(-38 10 10)"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8.1 8.1l3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MealPlateSvg({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="4.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3.25 5.25v4.2a1.3 1.3 0 0 0 1.3 1.3v4.5M3.25 7.6h1.6M16.5 5.25v9.95M15.1 5.25c0 2 0 3.4 1.4 3.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarDurationSvg({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <rect x="3.25" y="4.75" width="13.5" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.75 3v3M13.25 3v3M3.25 8.5h13.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PharmacistCrossSvg({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8 3.5h4v4.5h4.5v4H12v4.5H8V12H3.5V8H8V3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpeakerListenSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 7.75h2.8L10.75 4.5v11L6.8 12.25H4a1 1 0 0 1-1-1v-2.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 7.5a3.4 3.4 0 0 1 0 5M15.6 5.5a6.2 6.2 0 0 1 0 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Shows only what the assistant actually read and explained, in the page language.
 * No doses, times or durations are filled in on the client: the prescription and the
 * pharmacist stay the source of truth.
 */
export function PrescriptionStructuredResult({
  aiMessage,
  prescriptionText,
  medicines,
  emergency = false,
  className = "",
}: PrescriptionStructuredResultProps) {
  const { lang } = useLanguage();
  const { result, rx, symptoms } = useAssistantCopy();
  const voice = useReadAloud(lang);

  const message = aiMessage?.trim() ?? "";
  const transcript = prescriptionText?.trim() ?? "";
  const speechText = result.speech(message, rx.rules.join(" "));
  const explanationBlocks = splitExplanationIntoBlocks(message);
  const validMedicines = medicines?.filter((med) => Boolean(med.name?.trim())) ?? [];

  const hasUnclearContent =
    containsUnclearMarker(message) ||
    containsUnclearMarker(transcript) ||
    validMedicines.some((med) => isMedicineUnclear(med));

  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [activeSpeechCard, setActiveSpeechCard] = useState<number | null>(null);

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

  function handleToggleCardSpeech(index: number, med: PrescribedMedicineItem) {
    if (voice.speaking && activeSpeechCard === index) {
      voice.stop();
      setActiveSpeechCard(null);
      return;
    }
    const parts = buildMedicineSpeechParts(med, result);
    if (parts.length === 0) return;
    setActiveSpeechCard(index);
    voice.speak(parts);
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
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

      {hasUnclearContent ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-3.5 rounded-xl border border-amber-care-border bg-amber-care-soft/65 p-4 sm:p-5 dark:border-amber-care/45 dark:bg-amber-care/15 print:break-inside-avoid"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-care-border bg-card text-amber-care dark:border-amber-care/50 dark:text-amber-care-border">
            <PharmacistCrossSvg className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground">{result.pharmacistBannerTitle}</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{result.pharmacistBannerBody}</p>
          </div>
        </div>
      ) : null}

      {validMedicines.length > 0 ? (
        <section className="mt-6">
          <div className="mb-3.5">
            <h3 className="text-base font-semibold text-foreground">{result.medicinesHeading}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.medicinesLead}</p>
          </div>

          <div className="space-y-4">
            {validMedicines.map((med, index) => {
              const medUnclear = isMedicineUnclear(med);
              const hasSchedule = Boolean(med.morning || med.midday || med.evening || med.bedtime);
              const hasFoodRule = Boolean(med.foodTiming && med.foodTiming !== "any");
              const hasBadges = hasFoodRule || Boolean(med.duration) || medUnclear;
              const isCardSpeaking = voice.speaking && activeSpeechCard === index;

              const slots = [
                {
                  key: "morning" as const,
                  label: result.scheduleSlots.morning,
                  value: med.morning,
                  Icon: SunriseSlotSvg,
                },
                {
                  key: "midday" as const,
                  label: result.scheduleSlots.midday,
                  value: med.midday,
                  Icon: MiddaySunSvg,
                },
                {
                  key: "evening" as const,
                  label: result.scheduleSlots.evening,
                  value: med.evening,
                  Icon: SunsetSlotSvg,
                },
                {
                  key: "bedtime" as const,
                  label: result.scheduleSlots.bedtime,
                  value: med.bedtime,
                  Icon: BedtimeMoonSvg,
                },
              ];

              return (
                <article
                  key={`${med.name}-${index}`}
                  className="rounded-xl border border-border bg-background p-4 shadow-2xs sm:p-5 print:break-inside-avoid"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sapphire-soft text-sapphire dark:bg-sapphire/20 dark:text-sapphire-border">
                          <PillCapsuleSvg className="h-4 w-4" />
                        </span>
                        <h4 className="text-lg font-semibold leading-snug text-foreground break-words">
                          {renderWithUnclearHighlights(med.name)}
                        </h4>
                        {med.strength ? (
                          <span className="inline-flex items-center rounded-md border border-sapphire/25 bg-sapphire-soft/75 px-2.5 py-0.5 text-xs font-semibold text-obsidian-navy dark:border-sapphire/40 dark:bg-sapphire/20 dark:text-foreground">
                            {renderWithUnclearHighlights(med.strength)}
                          </span>
                        ) : null}
                      </div>
                      {med.purpose ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {renderWithUnclearHighlights(med.purpose)}
                        </p>
                      ) : null}
                    </div>

                    {voice.available ? (
                      <button
                        type="button"
                        onClick={() => handleToggleCardSpeech(index, med)}
                        aria-pressed={isCardSpeaking}
                        aria-label={result.listenMedicineAria(stripUnclearForSpeech(med.name) || med.name)}
                        className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 self-start rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire print:hidden sm:text-sm ${
                          isCardSpeaking
                            ? "border-sapphire bg-sapphire-soft text-obsidian-navy dark:border-sapphire/60 dark:bg-sapphire/20 dark:text-foreground"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        <SpeakerListenSvg className="h-4 w-4 shrink-0 text-sapphire dark:text-sapphire-border" />
                        <span>{isCardSpeaking ? result.stopMedicine : result.listenMedicine}</span>
                      </button>
                    ) : null}
                  </div>

                  {hasSchedule ? (
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      {slots.map(({ key, label, value, Icon }) => {
                        const active = Boolean(value);
                        return (
                          <div
                            key={key}
                            className={`rounded-lg border p-3 transition-colors ${
                              active
                                ? "border-sapphire/30 bg-sapphire-soft/65 dark:border-sapphire/45 dark:bg-sapphire/15"
                                : "border-border bg-surface-subtle/60 dark:bg-muted/25"
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon
                                className={`h-4 w-4 shrink-0 ${
                                  active
                                    ? "text-sapphire dark:text-sapphire-border"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  active
                                    ? "font-semibold text-obsidian-navy dark:text-foreground"
                                    : "font-medium text-muted-foreground"
                                }`}
                              >
                                {label}
                              </span>
                            </div>

                            {value ? (
                              <div className="mt-2 flex items-start gap-1.5 text-sm font-semibold leading-snug text-foreground break-words">
                                <PillCapsuleSvg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sapphire dark:text-sapphire-border" />
                                <span>{renderWithUnclearHighlights(value)}</span>
                              </div>
                            ) : (
                              <p className="mt-2 text-sm font-medium text-muted-foreground">
                                <span aria-hidden="true">—</span>
                                <span className="sr-only">{result.noDoseAria}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {hasBadges ? (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {med.foodTiming && med.foodTiming !== "any" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-sapphire/25 bg-sapphire-soft/50 px-2.5 py-1 text-xs font-semibold text-obsidian-navy dark:border-sapphire/40 dark:bg-sapphire/15 dark:text-foreground">
                          <MealPlateSvg className="h-3.5 w-3.5 shrink-0 text-sapphire dark:text-sapphire-border" />
                          <span>{result.foodTiming[med.foodTiming]}</span>
                        </span>
                      ) : null}

                      {med.duration ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground dark:bg-muted/40">
                          <CalendarDurationSvg className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span>{renderWithUnclearHighlights(result.durationLabel(med.duration))}</span>
                        </span>
                      ) : null}

                      {medUnclear ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-care-border bg-amber-care-soft/75 px-2.5 py-1 text-xs font-semibold text-foreground dark:border-amber-care/45 dark:bg-amber-care/20">
                          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0 text-amber-care dark:text-amber-care-border" />
                          <span>{result.unclearBadge}</span>
                        </span>
                      ) : null}
                    </div>
                  ) : null}

                  {med.warnings && med.warnings.length > 0 ? (
                    <ul className="mt-3.5 space-y-1.5 rounded-lg border border-amber-care-border/75 bg-amber-care-soft/45 p-3 dark:border-amber-care/35 dark:bg-amber-care/10">
                      {med.warnings.map((warning, warningIdx) => (
                        <li
                          key={warningIdx}
                          className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                        >
                          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
                          <span>{renderWithUnclearHighlights(warning)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
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

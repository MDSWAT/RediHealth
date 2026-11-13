"use client";

import { type ReactNode, useEffect, useState } from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  PhoneIcon,
  PrinterIcon,
} from "@/components/ui/icons";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { PrescriptionAudioPlayer } from "@/components/health-assistant/PrescriptionAudioPlayer";
import { PrescriptionDoctorBridge } from "@/components/health-assistant/PrescriptionDoctorBridge";
import { type AssistantCopy, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { useReadAloud } from "@/components/health-check/readingTools";
import type { PrescribedMedicineItem } from "@/lib/health-assistant";
import type { Lang } from "@/lib/i18n/translations";
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

/**
 * Normalizes daily timing slots from structured fields and only maps unambiguous
 * explicit markers (such as "1-0-1" or explicit time-of-day words) without inventing doses.
 */
function deriveSafeTimeSlots(med: PrescribedMedicineItem): {
  morning?: string;
  midday?: string;
  evening?: string;
  bedtime?: string;
} {
  if (med.morning || med.midday || med.evening || med.bedtime) {
    return {
      morning: med.morning,
      midday: med.midday,
      evening: med.evening,
      bedtime: med.bedtime,
    };
  }

  const hintText = [med.purpose, med.name, ...(med.warnings ?? [])]
    .filter(Boolean)
    .join(" ");
  if (!hintText) return {};

  const schemeMatch = hintText.match(/\b([0-4])\s*-\s*([0-4])\s*-\s*([0-4])(?:\s*-\s*([0-4]))?\b/);
  if (schemeMatch) {
    const [, m, mid, ev, bed] = schemeMatch;
    return {
      morning: m !== "0" ? m : undefined,
      midday: mid !== "0" ? mid : undefined,
      evening: ev !== "0" ? ev : undefined,
      bedtime: bed && bed !== "0" ? bed : undefined,
    };
  }

  const morning = /\b(?:dimineaț|dimineat|morning|mëngjes|mattin|ujutr|disrja|утром)\w*/i.test(
    hintText
  )
    ? "✓"
    : undefined;
  const midday = /\b(?:prânz|pranz|amiaz|midday|noon|mesdit|mezzogiorn|podne|днём|днем)\w*/i.test(
    hintText
  )
    ? "✓"
    : undefined;
  const evening = /\b(?:sear[ăa]|evening|mbrëmj|ser[ae]|navečer|večerom|вечером)\w*/i.test(hintText)
    ? "✓"
    : undefined;
  const bedtime =
    /\b(?:culcar|noapt|bedtime|night|gjum|nott|spavanj|перед сном|на ночь)\w*/i.test(hintText)
      ? "✓"
      : undefined;

  return { morning, midday, evening, bedtime };
}

const FRIDGE_COPY: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    medicineCol: string;
    notesCol: string;
    printedOn: string;
    footer: string;
  }
> = {
  ro: {
    title: "Program zilnic de tratament (pentru frigider)",
    subtitle: "Păstrează această foaie la vedere și bifează fiecare doză după administrare.",
    medicineCol: "Medicament",
    notesCol: "Indicații și atenționări",
    printedOn: "Tipărit pe",
    footer: "Verifică întotdeauna doza exactă cu farmacistul sau medicul înainte de administrare.",
  },
  en: {
    title: "Daily medicine schedule (fridge sheet)",
    subtitle: "Keep this sheet visible and check each dose after taking it.",
    medicineCol: "Medicine",
    notesCol: "Meal timing and notes",
    printedOn: "Printed on",
    footer: "Always confirm exact doses with your pharmacist or doctor before taking medicines.",
  },
  sq: {
    title: "Orari ditor i barnave (për frigorifer)",
    subtitle: "Mbaje këtë fletë në vend të dukshëm dhe shëno çdo dozë pas marrjes.",
    medicineCol: "Bari",
    notesCol: "Udhëzime dhe shënime",
    printedOn: "Printuar më",
    footer: "Kontrollo gjithmonë dozën e saktë me farmacistin ose mjekun para përdorimit.",
  },
  it: {
    title: "Programma giornaliero dei farmaci (da frigo)",
    subtitle: "Tieni questo foglio in vista e segna ogni dose dopo averla presa.",
    medicineCol: "Farmaco",
    notesCol: "Orari dei pasti e note",
    printedOn: "Stampato il",
    footer: "Conferma sempre le dosi esatte con il farmacista o il medico prima dell'uso.",
  },
  hr: {
    title: "Dnevni raspored lijekova (za hladnjak)",
    subtitle: "Drži ovaj list na vidljivom mjestu i označi svaku dozu nakon uzimanja.",
    medicineCol: "Lijek",
    notesCol: "Upute i napomene",
    printedOn: "Ispisano",
    footer: "Uvijek provjeri točnu dozu s ljekarnikom ili liječnikom prije uzimanja.",
  },
  rom: {
    title: "Rasporedo pe svako dives vaš lekurja",
    subtitle: "Inker kadava lil po dikhlo than thaj semnosar svako doza pali xamos.",
    medicineCol: "Lekuri",
    notesCol: "Xamoske vaxtja thaj note",
    printedOn: "Printirime po",
    footer: "Dikh sajekh e farmaceutosa vai e doktorea e čače doza anglal te les o lekuri.",
  },
  ru: {
    title: "Ежедневный график приёма лекарств (на холодильник)",
    subtitle: "Держите этот лист на видном месте и отмечайте каждую дозу после приёма.",
    medicineCol: "Лекарство",
    notesCol: "Приём пищи и примечания",
    printedOn: "Распечатано",
    footer: "Всегда уточняйте точную дозировку у фармацевта или врача перед приёмом.",
  },
};

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
          className="bg-amber-care-soft px-1 font-semibold text-foreground dark:bg-amber-care/20"
        >
          {part}
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

  const hasFridgeSchedule = validMedicines.length > 0;
  const fridge = FRIDGE_COPY[lang] ?? FRIDGE_COPY.ro;
  const printedDate = new Date().toLocaleDateString(lang === "rom" ? "ro-RO" : lang);

  const familyShareLines = validMedicines.map((med) => {
    const slots = deriveSafeTimeSlots(med);
    const activeSlotLabels = [
      slots.morning ? `${result.scheduleSlots.morning}: ${slots.morning}` : null,
      slots.midday ? `${result.scheduleSlots.midday}: ${slots.midday}` : null,
      slots.evening ? `${result.scheduleSlots.evening}: ${slots.evening}` : null,
      slots.bedtime ? `${result.scheduleSlots.bedtime}: ${slots.bedtime}` : null,
    ].filter(Boolean);
    const metaParts = [
      activeSlotLabels.join(", "),
      med.foodTiming && med.foodTiming !== "any" ? result.foodTiming[med.foodTiming] : null,
      med.duration ? result.durationLabel(med.duration) : null,
    ].filter(Boolean);
    const head = `${med.name}${med.strength ? ` (${med.strength})` : ""}`;
    return metaParts.length > 0 ? `${head} — ${metaParts.join(", ")}` : head;
  });
  const familyShareText = [
    ...(familyShareLines.length > 0 ? familyShareLines : message ? [message] : []),
    rx.rules[0],
  ]
    .filter(Boolean)
    .join("\n");

  useEffect(() => {
    const syncPrintMode = (active: boolean) => {
      if (active && hasFridgeSchedule) {
        document.documentElement.setAttribute("data-print-mode", "fridge-sheet");
      } else {
        document.documentElement.removeAttribute("data-print-mode");
      }
    };
    const handleBeforePrint = () => {
      setIsPrinting(true);
      syncPrintMode(true);
    };
    const handleAfterPrint = () => {
      setIsPrinting(false);
      syncPrintMode(false);
    };
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      document.documentElement.removeAttribute("data-print-mode");
    };
  }, [hasFridgeSchedule]);

  function handlePrint() {
    setIsPrinting(true);
    if (hasFridgeSchedule) {
      document.documentElement.setAttribute("data-print-mode", "fridge-sheet");
    }
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
      <div
        data-fridge-screen-only={hasFridgeSchedule ? "true" : undefined}
        className="flex flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground">{result.heading}</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{result.lead}</p>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2 print:hidden">
          <PrescriptionAudioPlayer speechText={speechText} />
          <button
            type="button"
            onClick={handlePrint}
            aria-label={result.printAria}
            title={result.print}
            className="press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border-control bg-card text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:border-sapphire/50 hover:bg-sapphire-soft/45 hover:text-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PrinterIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only">{result.print}</span>
          </button>
          <FamilyShareButton iconOnly align="right" title={result.heading} text={familyShareText} lang={lang} />
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
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{symptoms.callNow}</span>
          </a>
        </div>
      ) : null}

      {hasUnclearContent ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-amber-care-border border-l-4 border-l-amber-care bg-amber-care-soft/65 p-4 sm:p-5 dark:border-amber-care/45 dark:bg-amber-care/15 print:break-inside-avoid"
        >
          <div className="min-w-0">
            <h3 className="text-balance text-base font-semibold text-foreground">{result.pharmacistBannerTitle}</h3>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{result.pharmacistBannerBody}</p>
          </div>
        </div>
      ) : null}

      <div data-fridge-screen-only={hasFridgeSchedule ? "true" : undefined}>
        {validMedicines.length > 0 ? (
          <section className="mt-6">
          <div className="mb-3.5">
            <h3 className="text-base font-semibold text-foreground">{result.medicinesHeading}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.medicinesLead}</p>
          </div>

          <div
            className={
              validMedicines.length > 1
                ? "grid gap-4 xl:grid-cols-2 print:block print:space-y-4"
                : "space-y-4"
            }
          >
            {validMedicines.map((med, index) => {
              const medUnclear = isMedicineUnclear(med);
              const derivedSlots = deriveSafeTimeSlots(med);
              const hasSchedule = Boolean(
                derivedSlots.morning ||
                  derivedSlots.midday ||
                  derivedSlots.evening ||
                  derivedSlots.bedtime
              );
              const hasFoodRule = Boolean(med.foodTiming && med.foodTiming !== "any");
              const hasBadges = hasFoodRule || Boolean(med.duration) || medUnclear;
              const isCardSpeaking = voice.speaking && activeSpeechCard === index;

              const slots = [
                {
                  key: "morning" as const,
                  label: result.scheduleSlots.morning,
                  value: derivedSlots.morning,
                  Icon: SunriseSlotSvg,
                },
                {
                  key: "midday" as const,
                  label: result.scheduleSlots.midday,
                  value: derivedSlots.midday,
                  Icon: MiddaySunSvg,
                },
                {
                  key: "evening" as const,
                  label: result.scheduleSlots.evening,
                  value: derivedSlots.evening,
                  Icon: SunsetSlotSvg,
                },
                {
                  key: "bedtime" as const,
                  label: result.scheduleSlots.bedtime,
                  value: derivedSlots.bedtime,
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
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <h4 className="text-lg font-semibold leading-snug text-foreground break-words">
                          {renderWithUnclearHighlights(med.name)}
                        </h4>
                        {med.strength ? (
                          <span className="text-sm font-medium text-muted-foreground tabular-nums">
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
                        className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start rounded-lg border px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition-colors duration-[var(--dur-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring print:hidden ${
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
                                className={`h-5 w-5 shrink-0 ${
                                  active
                                    ? "text-sapphire dark:text-sapphire-border"
                                    : "text-muted-foreground"
                                }`}
                              />
                              <span
                                className={`text-sm ${
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
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                      {med.foodTiming && med.foodTiming !== "any" ? (
                        <span className="font-medium text-muted-foreground">
                          {result.foodTiming[med.foodTiming]}
                        </span>
                      ) : null}

                      {med.duration ? (
                        <>
                          {med.foodTiming && med.foodTiming !== "any" ? (
                            <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />
                          ) : null}
                          <span className="font-medium text-muted-foreground tabular-nums">
                            {renderWithUnclearHighlights(result.durationLabel(med.duration))}
                          </span>
                        </>
                      ) : null}

                      {medUnclear ? (
                        <>
                          {(med.foodTiming && med.foodTiming !== "any") || med.duration ? (
                            <span aria-hidden="true" className="inline-block h-3 w-px bg-border" />
                          ) : null}
                          <span className="font-semibold text-amber-care dark:text-amber-care-border">
                            {result.unclearBadge}
                          </span>
                        </>
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
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
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

      {hasFridgeSchedule ? (
        <section className="hidden text-black print:mt-4 print:block">
          <div className="border-b-2 border-black pb-3">
            <h2 className="text-2xl font-bold leading-tight">{fridge.title}</h2>
            <p className="mt-1 text-base leading-snug">{fridge.subtitle}</p>
            <p className="mt-1 text-sm font-semibold">
              {fridge.printedOn}: {printedDate}
            </p>
          </div>

          <table className="mt-4 w-full border-collapse border-2 border-black text-left text-base">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100">
                <th scope="col" className="border-r border-black px-3 py-2.5 font-bold">
                  {fridge.medicineCol}
                </th>
                <th scope="col" className="border-r border-black px-3 py-2.5 text-center font-bold">
                  {result.scheduleSlots.morning}
                </th>
                <th scope="col" className="border-r border-black px-3 py-2.5 text-center font-bold">
                  {result.scheduleSlots.midday}
                </th>
                <th scope="col" className="border-r border-black px-3 py-2.5 text-center font-bold">
                  {result.scheduleSlots.evening}
                </th>
                <th scope="col" className="border-r border-black px-3 py-2.5 text-center font-bold">
                  {result.scheduleSlots.bedtime}
                </th>
                <th scope="col" className="px-3 py-2.5 font-bold">
                  {fridge.notesCol}
                </th>
              </tr>
            </thead>
            <tbody>
              {validMedicines.map((med, index) => {
                const slots = deriveSafeTimeSlots(med);
                const notes = [
                  med.foodTiming && med.foodTiming !== "any"
                    ? result.foodTiming[med.foodTiming]
                    : null,
                  med.duration ? result.durationLabel(med.duration) : null,
                  ...(med.warnings ?? []),
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <tr key={`${med.name}-fridge-${index}`} className="border-b border-black align-top">
                    <td className="border-r border-black px-3 py-3">
                      <div className="text-lg font-bold leading-snug">
                        {med.name}
                        {med.strength ? ` (${med.strength})` : ""}
                      </div>
                      {med.purpose ? <p className="mt-1 text-sm leading-snug">{med.purpose}</p> : null}
                    </td>
                    <td className="border-r border-black px-3 py-3 text-center text-lg font-bold">
                      {slots.morning || "—"}
                    </td>
                    <td className="border-r border-black px-3 py-3 text-center text-lg font-bold">
                      {slots.midday || "—"}
                    </td>
                    <td className="border-r border-black px-3 py-3 text-center text-lg font-bold">
                      {slots.evening || "—"}
                    </td>
                    <td className="border-r border-black px-3 py-3 text-center text-lg font-bold">
                      {slots.bedtime || "—"}
                    </td>
                    <td className="px-3 py-3 text-sm leading-snug">{notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-4 border-t border-black pt-2 text-sm font-semibold">
            {fridge.footer} {rx.rules[0]}
          </p>
        </section>
      ) : null}
    </div>
  );
}

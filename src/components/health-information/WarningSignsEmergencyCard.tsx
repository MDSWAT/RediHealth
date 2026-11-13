"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PhoneIcon } from "@/components/ui/icons";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { HEALTH_ARTICLE_SECTION_H2_CLASS } from "./HealthArticleShell";
import { InlineAudioNarratorButton } from "./InlineAudioNarratorButton";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import {
  HEALTH_DETAIL_SHARED_STRINGS,
  SPEECH_LANG_BY_LOCALE,
} from "@/lib/i18n/health-myths";

export interface WarningSignsEmergencyCardProps {
  topicTitle: string;
  warningSigns: string[];
  className?: string;
  lang?: Lang;
}

const URGENCY_UI_BY_LANG: Record<
  Lang,
  {
    cardLabels: [string, string, string, string];
  }
> = {
  ru: {
    cardLabels: [
      "Точное место",
      "Главный симптом",
      "Возраст и дыхание",
      "Оставайтесь на линии",
    ],
  },
  ro: {
    cardLabels: [
      "Adresa exactă",
      "Simptomul principal",
      "Vârsta și respirația",
      "Rămâi la telefon",
    ],
  },
  en: {
    cardLabels: [
      "Exact location",
      "Main symptom",
      "Age and breathing",
      "Stay on the line",
    ],
  },
  sq: {
    cardLabels: [
      "Adresa e saktë",
      "Simptoma kryesore",
      "Mosha dhe frymëmarrja",
      "Qëndro në linjë",
    ],
  },
  it: {
    cardLabels: [
      "Indirizzo preciso",
      "Sintomo principale",
      "Età e respiro",
      "Resta in linea",
    ],
  },
  hr: {
    cardLabels: [
      "Točna adresa",
      "Glavni simptom",
      "Dob i disanje",
      "Ostanite na liniji",
    ],
  },
  rom: {
    cardLabels: [
      "Chachi adresa",
      "Angluno simptomo",
      "Berșa thaj phurdipe",
      "Achh pe linija",
    ],
  },
};

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

function pickSpeechLang(lang: Lang): string {
  return (
    (SPEECH_LANG_BY_LOCALE as Partial<Record<Lang, string>>)[lang] ??
    (lang === "hr" ? "hr-HR" : "ro-RO")
  );
}

export function WarningSignsEmergencyCard({
  topicTitle,
  warningSigns,
  className = "",
  lang,
}: WarningSignsEmergencyCardProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.warningSigns;
  const urgencyUi = URGENCY_UI_BY_LANG[currentLang] ?? URGENCY_UI_BY_LANG.ro;
  const speechLang = pickSpeechLang(currentLang);

  // Two layers: the "when to call" explainer, and the shared 112 dial gate (the site never dials by itself).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsModalOpen(false);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isModalOpen]);

  const dispatchSteps = [
    pickLocale(s.dispatchStep1, currentLang),
    pickLocale(s.dispatchStep2, currentLang),
    pickLocale(s.dispatchStep3, currentLang),
    pickLocale(s.dispatchStep4, currentLang),
  ];

  return (
    <>
      <section
        aria-labelledby="warning-signs-heading"
        className={`rounded-xl border border-border border-l-4 border-l-primary bg-card p-6 sm:p-8 break-inside-avoid ${className}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2
              id="warning-signs-heading"
              className={HEALTH_ARTICLE_SECTION_H2_CLASS}
            >
              {pickLocale(s.heading, currentLang)}
            </h2>
            <p className="mt-1.5 text-base font-medium leading-normal text-foreground">
              {pickLocale(s.subtitleWarning, currentLang)}
            </p>
          </div>

          <div className="shrink-0 self-start">
            <InlineAudioNarratorButton
              textToSpeak={`${topicTitle}. ${pickLocale(s.heading, currentLang)}. ${warningSigns.join(". ")}`}
              label={pickLocale(s.heading, currentLang)}
              lang={speechLang}
            />
          </div>
        </div>

        <p className="mt-4 text-base leading-relaxed text-foreground/90">
          {pickLocale(s.prompt, currentLang).replace(
            "{topic}",
            topicTitle.toLowerCase(),
          )}
        </p>

        {/*
          Signs are read as a short numbered list (the figures are typographic, not an alert icon
          repeated on every line), so the eye can keep its place and count them.
        */}
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {warningSigns.map((sign, idx) => (
            <li
              key={idx}
              className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-3 py-3.5 text-[1.0625rem] font-medium leading-[1.65] text-foreground sm:text-[1.125rem]"
            >
              <span
                aria-hidden="true"
                className="text-base font-semibold tabular-nums text-primary dark:text-red-300"
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span>{sign}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col items-start gap-x-6 gap-y-2 sm:flex-row sm:items-center print:hidden">
          <button
            type="button"
            onClick={() => setDialerOpen(true)}
            aria-haspopup="dialog"
            className="press-on-dark inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            <span>{pickLocale(s.dialBtn, currentLang)}</span>
          </button>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
            className="press-row inline-flex min-h-12 items-center whitespace-nowrap rounded-sm px-1 text-base font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {pickLocale(s.modalTrigger, currentLang)}
          </button>
        </div>
      </section>

      {/* Focus-trapped 112 operator readiness dispatch sheet */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          aria-describedby="emergency-modal-desc"
          className="news-sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            ref={dialogRef}
            className="news-sheet max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-xl border-t border-border bg-card p-5 shadow-xl sm:rounded-xl sm:border sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto mb-3 h-1.5 w-12 rounded-sm bg-border sm:hidden"
              aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3
                  id="emergency-modal-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  {pickLocale(s.modalTitle, currentLang)}
                </h3>
                <p
                  id="emergency-modal-desc"
                  className="mt-1 text-base text-muted-foreground"
                >
                  {pickLocale(s.modalSubtitle, currentLang)}{" "}
                  {pickLocale(s.subtitleWarning, currentLang)}
                </p>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="press-row flex min-h-12 min-w-12 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={pickLocale(s.closeAria, currentLang)}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <p className="text-base font-semibold text-foreground">
                {pickLocale(s.dispatchTitle, currentLang)}
              </p>

              <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {dispatchSteps.map((stepText, idx) => (
                  <li
                    key={idx}
                    style={{ "--i": idx + 2 } as CSSProperties}
                    className="list-in flex flex-col rounded-lg border border-border bg-surface-subtle/60 p-3.5"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold tabular-nums text-primary">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {urgencyUi.cardLabels[idx]}
                      </span>
                    </div>
                    <p className="mt-2 text-base leading-relaxed text-foreground/90">
                      {stepText}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="press-row inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-lg border border-border-control bg-card px-5 py-2.5 text-base font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {pickLocale(s.closeBtn, currentLang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setDialerOpen(true);
                }}
                aria-haspopup="dialog"
                className="press-on-dark inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-2.5 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <PhoneIcon className="h-4 w-4" aria-hidden="true" />
                <span>{pickLocale(s.dialBtn, currentLang)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}

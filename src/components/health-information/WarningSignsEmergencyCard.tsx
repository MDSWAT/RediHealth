"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneIcon } from "@/components/ui/icons";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
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

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
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
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";

  // Two layers: the "when to call" explainer, and the shared 112 dial gate (the site never dials by itself).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialerOpen, setDialerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const trigger = triggerRef.current;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isModalOpen]);

  return (
    <>
      <section
        aria-labelledby="warning-signs-heading"
        className={`rounded-xl border border-border bg-card p-6 sm:p-8 break-inside-avoid ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2
              id="warning-signs-heading"
              className="text-xl font-semibold leading-snug tracking-tight text-foreground text-balance sm:text-3xl"
            >
              {s.heading[currentLang]}
            </h2>
            <p className="mt-1 text-sm font-medium leading-normal text-foreground">
              {s.subtitleWarning[currentLang]}
            </p>
          </div>

          <div className="shrink-0 self-start">
            <InlineAudioNarratorButton
              textToSpeak={`${topicTitle}. ${s.heading[currentLang]}. ${warningSigns.join(". ")}`}
              label={s.heading[currentLang]}
              lang={speechLang}
            />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {s.prompt[currentLang].replace("{topic}", topicTitle.toLowerCase())}
        </p>

        <ul className="mt-4 divide-y divide-border border-y border-border">
          {warningSigns.map((sign, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 py-3 text-base font-medium text-foreground"
            >
              <div className="flex items-start gap-3">
                <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
                <span className="leading-relaxed">{sign}</span>
              </div>

              <InlineAudioNarratorButton
                textToSpeak={sign}
                label={HEALTH_DETAIL_SHARED_STRINGS.actionableSteps.listenStepLabel[currentLang].replace("{title}", sign)}
                lang={speechLang}
                variant="ghost"
                className="-my-2 -mr-2 shrink-0"
              />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-start gap-x-6 gap-y-2 sm:flex-row sm:items-center print:hidden">
          <button
            type="button"
            onClick={() => setDialerOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{s.dialBtn[currentLang]}</span>
          </button>

          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-haspopup="dialog"
            className="inline-flex min-h-[44px] items-center rounded-sm text-sm font-semibold text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {s.modalTrigger[currentLang]}
          </button>
        </div>
      </section>

      {/* Internal Fallback Emergency Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          className="hh-scrim fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="hh-dialog w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="emergency-modal-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  {s.modalTitle[currentLang]}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {s.modalSubtitle[currentLang]}
                </p>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                aria-label={s.closeAria[currentLang]}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-foreground">
              <p className="font-semibold">{s.subtitleWarning[currentLang]}</p>

              <div>
                <p className="font-semibold">{s.dispatchTitle[currentLang]}</p>
                <ol className="mt-2 list-outside list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                  <li>{s.dispatchStep1[currentLang]}</li>
                  <li>{s.dispatchStep2[currentLang]}</li>
                  <li>{s.dispatchStep3[currentLang]}</li>
                  <li>{s.dispatchStep4[currentLang]}</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {s.closeBtn[currentLang]}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setDialerOpen(true);
                }}
                aria-haspopup="dialog"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>{s.dialBtn[currentLang]}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <EmergencyDialerGate open={dialerOpen} onOpenChange={setDialerOpen} />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PhoneIcon } from "@/components/ui/icons";
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
  onOpenEmergencyModal?: () => void;
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
  onOpenEmergencyModal,
  lang,
}: WarningSignsEmergencyCardProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.warningSigns;
  const speechLang = SPEECH_LANG_BY_LOCALE[currentLang] ?? "ro-RO";

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  const handleOpen = () => {
    if (onOpenEmergencyModal) {
      onOpenEmergencyModal();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <section
        aria-labelledby="warning-signs-heading"
        className={`rounded-lg border border-primary/30 bg-primary-soft/40 p-6 sm:p-8 break-inside-avoid ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 min-w-0 items-start gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>

            <div className="flex-1 min-w-0">
              <h2
                id="warning-signs-heading"
                className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl leading-snug break-words"
              >
                {s.heading[currentLang]}
              </h2>
              <p className="mt-1 text-sm font-medium text-primary leading-normal">
                {s.subtitleWarning[currentLang]}
              </p>
            </div>
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

        <ul className="mt-4 space-y-2.5">
          {warningSigns.map((sign, idx) => (
            <li
              key={idx}
              className="flex items-start justify-between gap-3 rounded-md border border-primary/20 bg-card p-3 text-sm font-medium text-foreground"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                <span className="leading-relaxed">{sign}</span>
              </div>

              <InlineAudioNarratorButton
                textToSpeak={sign}
                label={`${s.heading[currentLang]} ${idx + 1}`}
                lang={speechLang}
                variant="ghost"
                className="-my-2 -mr-2 shrink-0"
              />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 print:hidden"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{s.modalTrigger[currentLang]}</span>
          </button>

          <span className="text-sm leading-relaxed text-muted-foreground">
            {s.disclaimer[currentLang]}
          </span>
        </div>
      </section>

      {/* Internal Fallback Emergency Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <PhoneIcon className="h-6 w-6" />
                </span>
                <div>
                  <h3
                    id="emergency-modal-title"
                    className="text-xl font-bold text-foreground"
                  >
                    {s.modalTitle[currentLang]}
                  </h3>
                  <p className="text-xs font-semibold text-primary">
                    {s.modalSubtitle[currentLang]}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                aria-label={s.closeAria[currentLang]}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-foreground">
              <div className="rounded-lg border border-primary/30 bg-primary-soft/50 p-4">
                <p className="font-semibold text-primary">
                  {s.subtitleWarning[currentLang]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.disclaimer[currentLang]}
                </p>
              </div>

              <div>
                <p className="font-semibold">{s.dispatchTitle[currentLang]}</p>
                <ol className="mt-2 list-inside list-decimal space-y-1.5 text-xs text-muted-foreground">
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
                className="min-h-[44px] rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                {s.closeBtn[currentLang]}
              </button>
              <a
                href="tel:112"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-primary-hover"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>{s.dialBtn[currentLang]}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

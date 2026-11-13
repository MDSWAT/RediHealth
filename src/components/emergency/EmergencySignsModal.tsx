"use client";

import React, { useEffect, useRef, useState } from "react";
import { CloseIcon, PhoneIcon, VolumeIcon } from "@/components/ui/icons";
import { useReadAloud } from "@/components/health-check/readingTools";
import { useModalAutoScroll } from "@/components/news/use-sheet-dialog";
import { DispatcherScriptAccordion } from "@/components/emergency/DispatcherScriptAccordion";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import styles from "@/components/emergency/EmergencyOverlay.module.css";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

export type EmergencySignsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const signsAudioCopy: Record<Lang, { listen: string; stop: string }> = {
  ro: { listen: "Ascultă semnele", stop: "Oprește" },
  en: { listen: "Listen to signs", stop: "Stop" },
  sq: { listen: "Dëgjo shenjat", stop: "Ndalo" },
  it: { listen: "Ascolta i segnali", stop: "Ferma" },
  hr: { listen: "Poslušaj znakove", stop: "Zaustavi" },
  rom: { listen: "Ashun e semnurya", stop: "Achav" },
  ru: { listen: "Прослушать признаки", stop: "Остановить" },
};

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    const baseT = translations[lang] ?? translations.ro;
    const t = {
      ...baseT,
      ...(ctx?.t || {}),
      emergency: ctx?.t?.emergency ?? baseT.emergency,
    };
    return { lang, t };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

/**
 * EmergencySignsModal: when to call 112, as a calm, scannable list.
 * One column, quiet colors, a single primary action. The list scrolls inside the
 * dialog so the call button stays in view on short screens.
 */
export function EmergencySignsModal({
  open,
  onOpenChange,
}: EmergencySignsModalProps) {
  const { t, lang } = useSafeLanguage();
  const voice = useReadAloud(lang);
  const { stop: stopVoice } = voice;
  const audio = signsAudioCopy[lang];
  const e = t.emergency;
  const signs = e.signs;

  const [dialerGateOpen, setDialerGateOpen] = useState(false);

  useEffect(() => {
    if (!open) stopVoice();
  }, [open, stopVoice]);
  const panelRef = useRef<HTMLDivElement>(null);

  useModalAutoScroll(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const cameFromKeyboard = previouslyFocused?.matches(":focus-visible") ?? false;
    // Focus the panel itself (no ring), so neither the close button nor the trigger shows a focus box after a mouse click.
    panelRef.current?.focus({ preventScroll: true });
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      // Hand focus back for keyboard users; after a mouse click, a returned focus ring is just noise.
      if (cameFromKeyboard) previouslyFocused?.focus({ preventScroll: true });
      else previouslyFocused?.blur();
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-signs-title"
        aria-describedby="emergency-signs-description"
        className="scrim-in fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-4"
      >
        <div
          className="fixed inset-0 -z-10"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          tabIndex={-1}
          className={`${styles.panel} relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-xl bg-card text-foreground shadow-2xl sm:max-h-[85dvh] sm:rounded-xl focus:outline-none`}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="min-w-0">
              <h2
                id="emergency-signs-title"
                className="text-lg font-semibold tracking-tight sm:text-xl"
              >
                {e.signsModalTitle}
              </h2>
              <p id="emergency-signs-description" className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {e.signsModalSubtitle}
              </p>
            </div>

            <div className="-mr-2 -mt-1 flex shrink-0 items-center gap-2">
            {voice.available ? (
              <button
                type="button"
                aria-pressed={voice.speaking}
                onClick={() =>
                  voice.speaking
                    ? voice.stop()
                    : voice.speak([
                        e.signsModalTitle,
                        e.signsModalSubtitle,
                        ...signs.map((s) => `${s.title}. ${s.description}`),
                      ])
                }
                className="press-row inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-border-control bg-card px-3.5 text-sm font-semibold text-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <VolumeIcon className="h-4 w-4" aria-hidden="true" />
                <span>{voice.speaking ? audio.stop : audio.listen}</span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={e.closeSignsModalAria}
              className="press-row flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            </div>
          </div>

          <div
            data-modal-scroller="true"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-7"
          >
            <ul className="divide-y divide-border">
              {signs.map((sign, index) => (
                <li
                  key={sign.id}
                  // The signs arrive in reading order, just behind the sheet.
                  style={{ "--i": index + 2 } as React.CSSProperties}
                  className="list-in flex items-start gap-3 py-4"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-xs font-semibold tabular-nums text-primary"
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold leading-snug">{sign.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {sign.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-1">
              <DispatcherScriptAccordion defaultOpen={false} />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-7">
            <span className="text-center text-[13px] text-muted-foreground sm:text-left">
              {e.freeServiceNotice}
            </span>

            <button
              type="button"
              onClick={() => setDialerGateOpen(true)}
              className="press-solid flex min-h-14 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              <span>{e.call112}</span>
            </button>
          </div>
        </div>
      </div>

      <EmergencyDialerGate
        open={dialerGateOpen}
        onOpenChange={setDialerGateOpen}
      />
    </>
  );
}

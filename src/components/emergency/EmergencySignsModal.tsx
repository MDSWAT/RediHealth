"use client";

import React, { useEffect, useRef, useState } from "react";
import { CloseIcon, PhoneIcon } from "@/components/ui/icons";
import { DispatcherScriptAccordion } from "@/components/emergency/DispatcherScriptAccordion";
import { EmergencyDialerGate } from "@/components/emergency/EmergencyDialerGate";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

export type EmergencySignsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  const { t } = useSafeLanguage();
  const e = t.emergency;
  const signs = e.signs;

  const [dialerGateOpen, setDialerGateOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
        className="fhs-fade fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4"
      >
        <div
          className="fixed inset-0 -z-10"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        <div
          ref={panelRef}
          tabIndex={-1}
          className="fhs-enter relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl bg-card text-foreground shadow-xl sm:max-h-[85dvh] sm:rounded-2xl focus:outline-none"
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

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={e.closeSignsModalAria}
              className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-7">
            <ul className="divide-y divide-border">
              {signs.map((sign) => (
                <li key={sign.id} className="py-4">
                  <h3 className="text-[15px] font-semibold leading-snug">{sign.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {sign.description}
                  </p>
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
              className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

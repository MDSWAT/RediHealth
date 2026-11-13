"use client";

import React, { useEffect, useRef, useState } from "react";
import { PhoneIcon, CloseIcon } from "@/components/ui/icons";
import { DesktopEmergencyCard } from "@/components/emergency/DesktopEmergencyCard";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

export type EmergencyDialerGateProps = {
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
 * The site never dials by itself. On a phone this opens the keypad with 112 filled in, after
 * saying that the reader still presses call; on a computer it shows the number to dial.
 */
export function EmergencyDialerGate({
  open,
  onOpenChange,
}: EmergencyDialerGateProps) {
  const { t } = useSafeLanguage();
  const e = t.emergency;

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || "";
    return (
      /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ||
      window.matchMedia("(max-width: 768px)").matches
    );
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ""));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves into the dialog and back to the opener; Escape closes only this layer
  // (it can sit on top of the warning-signs dialog).
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = overflow;
      opener?.focus({ preventScroll: true });
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialer-gate-title"
      className="fhs-fade fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {isMobile ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          className="fhs-enter relative w-full max-w-lg rounded-t-xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl focus:outline-none sm:rounded-xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 id="dialer-gate-title" className="pt-1 text-lg font-semibold tracking-tight text-foreground">
              {e.dialerGateTitle}
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={e.closeWindowAria}
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <p className="text-sm leading-relaxed text-foreground">{e.dialerNotice}</p>
            <p className="text-sm text-muted-foreground">{e.dialerFreeNote}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="tel:112"
              onClick={() => onOpenChange(false)}
              className="flex min-h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <PhoneIcon className="h-5 w-5" aria-hidden="true" />
              <span>{e.openDialerButton}</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex min-h-12 whitespace-nowrap w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {e.cancelButton}
            </button>
          </div>
        </div>
      ) : (
        <div ref={panelRef} tabIndex={-1} className="fhs-enter relative w-full max-w-lg focus:outline-none">
          <DesktopEmergencyCard titleId="dialer-gate-title" onDismiss={() => onOpenChange(false)} />
        </div>
      )}
    </div>
  );
}

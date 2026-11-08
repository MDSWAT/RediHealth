"use client";

import React from "react";
import { PhoneIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

export type DesktopEmergencyCardProps = {
  onDismiss?: () => void;
  className?: string;
  /** id for the heading, so a dialog that hosts the card can name itself with it. */
  titleId?: string;
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
 * On a computer, tel: links open FaceTime or Skype or nothing at all, so the dialer gate
 * shows the number to dial from a phone instead.
 */
export function DesktopEmergencyCard({
  onDismiss,
  className,
  titleId,
}: DesktopEmergencyCardProps) {
  const { t } = useSafeLanguage();
  const e = t.emergency;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-card p-6 shadow-xl sm:p-7",
        className
      )}
    >
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={e.closeWindowAria}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      <div className="flex items-start gap-4">
        <PhoneIcon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />

        <div className="min-w-0 space-y-3 pr-8">
          <div>
            <h3 id={titleId} className="text-lg font-semibold tracking-tight text-foreground">
              {e.desktopDialTitle}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{e.desktopDialSubtitle}</p>
          </div>

          <p className="text-4xl font-semibold tracking-tight text-primary">112</p>

          <p className="text-sm leading-relaxed text-muted-foreground">{e.desktopFreeNote}</p>

          <p className="border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
            {e.desktopRuralNote}
          </p>
        </div>
      </div>
    </div>
  );
}

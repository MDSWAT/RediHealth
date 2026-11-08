"use client";

import { ShieldIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

export interface MedicalSafetyDisclaimerProps {
  lang?: Lang;
  className?: string;
}

export const MEDICAL_SAFETY_DISCLAIMER_COPY: Record<
  Lang,
  { badge: string; body: string; call112Label: string }
> = {
  ro: {
    badge: "Acest ghid nu înlocuiește medicul",
    body:
      "Aici afli informații despre sănătate. Nu primești un diagnostic sau un tratament. Pentru asta, mergi la medic. Dacă e o urgență, sună la 112.",
    call112Label: "Sună la 112",
  },
  en: {
    badge: "This guide does not replace a doctor",
    body:
      "This page gives you health information. It does not give you a diagnosis or treatment. For that, see a doctor. In an emergency, call 112.",
    call112Label: "Call 112",
  },
  sq: {
    badge: "Ky udhëzues nuk zëvendëson mjekun",
    body:
      "Këtu gjen informacione për shëndetin. Nuk merr diagnozë ose mjekim. Për këtë, shko te mjeku. Në rast urgjence, telefono në 112.",
    call112Label: "Telefono 112",
  },
  it: {
    badge: "Questa guida non sostituisce il medico",
    body:
      "Qui trovi informazioni sulla salute. Non ricevi una diagnosi o una cura. Per questo, vai dal medico. Se è un'emergenza, chiama il 112.",
    call112Label: "Chiama il 112",
  },
};

function useSafeLang(explicitLang?: Lang): Lang {
  try {
    const ctx = useLanguage();
    return explicitLang ?? ctx.lang;
  } catch {
    return explicitLang ?? "ro";
  }
}

export function MedicalSafetyDisclaimer({
  lang: explicitLang,
  className = "",
}: MedicalSafetyDisclaimerProps) {
  const lang = useSafeLang(explicitLang);
  const copy =
    MEDICAL_SAFETY_DISCLAIMER_COPY[lang] ?? MEDICAL_SAFETY_DISCLAIMER_COPY.ro;

  return (
    <section
      aria-label={copy.badge}
      data-testid="medical-safety-disclaimer"
      className={`rounded-lg border border-stone-200/90 dark:border-stone-800 bg-card p-4 sm:p-5 shadow-2xs break-inside-avoid ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sapphire-soft text-sapphire"
            aria-hidden="true"
          >
            <ShieldIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-sapphire">{copy.badge}</p>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {copy.body}
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary print:hidden"
        >
          {copy.call112Label}
        </a>
      </div>
    </section>
  );
}

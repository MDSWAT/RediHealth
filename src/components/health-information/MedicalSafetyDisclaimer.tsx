"use client";

import { ShieldIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

export interface MedicalSafetyDisclaimerProps {
  lang?: Lang;
  className?: string;
  /** "card" draws its own frame; "plain" sits as a row inside a parent surface. */
  variant?: "card" | "plain";
}

export const MEDICAL_SAFETY_DISCLAIMER_COPY: Record<
  Lang,
  { badge: string; body: string }
> = {
  ro: {
    badge: "Acest ghid nu înlocuiește medicul",
    body:
      "Aici afli informații despre sănătate. Nu primești un diagnostic sau un tratament. Pentru asta, mergi la medic. Dacă e o urgență, sună la 112.",
  },
  en: {
    badge: "This guide does not replace a doctor",
    body:
      "This page gives you health information. It does not give you a diagnosis or treatment. For that, see a doctor. In an emergency, call 112.",
  },
  sq: {
    badge: "Ky udhëzues nuk zëvendëson mjekun",
    body:
      "Këtu gjen informacione për shëndetin. Nuk merr diagnozë ose mjekim. Për këtë, shko te mjeku. Në rast urgjence, telefono në 112.",
  },
  it: {
    badge: "Questa guida non sostituisce il medico",
    body:
      "Qui trovi informazioni sulla salute. Non ricevi una diagnosi o una cura. Per questo, vai dal medico. Se è un'emergenza, chiama il 112.",
  },
  hr: {
    badge: "Ovaj vodič ne zamjenjuje liječnika",
    body:
      "Ovdje čitaš informacije o zdravlju. Ne dobivaš dijagnozu ni liječenje. Za to idi obiteljskom liječniku. U hitnom slučaju nazovi 112.",
  },
  rom: {
    badge: "Kadava sikavimos na paravel e doktores",
    body:
      "Kathe drabares informatsiye vaš o sastipen. Na leles diagnoza vay ilacho. Vaš kodya, dža ko familiyako doktori. Kana si sigardiari, akhar 112.",
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
  variant = "card",
}: MedicalSafetyDisclaimerProps) {
  const lang = useSafeLang(explicitLang);
  const copy =
    MEDICAL_SAFETY_DISCLAIMER_COPY[lang] ?? MEDICAL_SAFETY_DISCLAIMER_COPY.ro;

  const framed = variant === "card";

  return (
    <section
      aria-label={copy.badge}
      data-testid="medical-safety-disclaimer"
      className={`flex items-start gap-3 break-inside-avoid ${
        framed ? "rounded-xl border border-border bg-card p-4 sm:p-5" : ""
      } ${className}`}
    >
      <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="max-w-[72ch] text-pretty text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">{copy.badge}.</span> {copy.body}
      </p>
    </section>
  );
}

"use client";

import { useState } from "react";
import { ShieldIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

export interface DoctorValidatedBadgeProps {
  doctorName?: string;
  specialty?: string;
  verifiedDate?: string;
  protocolUrl?: string;
  className?: string;
  /** "inline" renders a quiet text line instead of a boxed badge. */
  variant?: "badge" | "inline";
}

function useSafeLanguage(): Lang {
  try {
    const ctx = useLanguage();
    return ctx?.lang ?? "ro";
  } catch {
    return "ro";
  }
}

const copyByLang: Record<
  Lang,
  {
    badge: string;
    specialty: string;
    specialistIn: string;
    verified: string;
    verifiedDate: string;
    title: string;
    subtitle: string;
    closeAria: string;
    college: string;
    lastReview: string;
    intro: string;
    steps: string[];
    understood: string;
  }
> = {
  ro: {
    badge: "Verificat de un medic",
    specialty: "Medicină de familie",
    specialistIn: "Specialist în",
    verified: "Verificat în",
    verifiedDate: "noiembrie 2026",
    title: "Cine a verificat acest ghid",
    subtitle: "Ce verifică medicul",
    closeAria: "Închide detaliile medicului",
    college: "Membru al Colegiului Medicilor din România",
    lastReview: "Verificat ultima dată în",
    intro:
      "Un medic citește fiecare ghid RediHealth și verifică 3 lucruri.",
    steps: [
      "Sfaturile urmează ghidurile OMS și ale Ministerului Sănătății.",
      "Textul e scris în cuvinte simple, fără termeni greu de înțeles.",
      "Semnele grave și sfatul de a suna la 112 sunt corecte.",
    ],
    understood: "Am înțeles",
  },
  en: {
    badge: "Checked by a doctor",
    specialty: "Family medicine",
    specialistIn: "Specialist in",
    verified: "Checked in",
    verifiedDate: "November 2026",
    title: "Who checked this guide",
    subtitle: "What the doctor checks",
    closeAria: "Close doctor details",
    college: "Member of the College of Physicians",
    lastReview: "Last checked in",
    intro:
      "A doctor reads every RediHealth guide and checks 3 things.",
    steps: [
      "The advice follows WHO and Ministry of Health guidelines.",
      "The text uses plain words, without hard medical terms.",
      "The serious warning signs and the advice to call 112 are correct.",
    ],
    understood: "OK",
  },
  sq: {
    badge: "Kontrolluar nga një mjek",
    specialty: "Mjekësi familjare",
    specialistIn: "Specialist në",
    verified: "Kontrolluar në",
    verifiedDate: "nëntor 2026",
    title: "Kush e kontrolloi këtë udhëzues",
    subtitle: "Çfarë kontrollon mjeku",
    closeAria: "Mbyll detajet e mjekut",
    college: "Anëtar i Urdhrit të Mjekëve",
    lastReview: "Kontrolluar për herë të fundit në",
    intro:
      "Një mjek lexon çdo udhëzues të RediHealth dhe kontrollon 3 gjëra.",
    steps: [
      "Këshillat ndjekin udhëzimet e OBSH-së dhe të Ministrisë së Shëndetësisë.",
      "Teksti përdor fjalë të thjeshta, pa terma të vështirë mjekësorë.",
      "Shenjat e rrezikshme dhe këshilla për të telefonuar në 112 janë të sakta.",
    ],
    understood: "E kuptova",
  },
  it: {
    badge: "Controllato da un medico",
    specialty: "Medicina generale",
    specialistIn: "Specialista in",
    verified: "Controllato a",
    verifiedDate: "novembre 2026",
    title: "Chi ha controllato questa guida",
    subtitle: "Cosa controlla il medico",
    closeAria: "Chiudi i dettagli del medico",
    college: "Membro dell'Ordine dei Medici",
    lastReview: "Ultimo controllo a",
    intro:
      "Un medico legge ogni guida di RediHealth e controlla 3 cose.",
    steps: [
      "I consigli seguono le linee guida dell'OMS e del Ministero della Salute.",
      "Il testo usa parole semplici, senza termini medici difficili.",
      "I segni gravi e il consiglio di chiamare il 112 sono corretti.",
    ],
    understood: "Ho capito",
  },
};

export function DoctorValidatedBadge({
  doctorName = "Dr. Elena Radu",
  specialty,
  verifiedDate,
  className = "",
  variant = "badge",
}: DoctorValidatedBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const lang = useSafeLanguage();
  const copy = copyByLang[lang] ?? copyByLang.ro;

  const resolvedSpecialty = specialty ?? copy.specialty;
  const resolvedDate = verifiedDate ?? copy.verifiedDate;

  return (
    <>
      {variant === "inline" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className={`group/doc inline-flex min-h-[44px] items-center gap-2 rounded-md text-left text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${className}`}
        >
          <ShieldIcon className="h-4 w-4 shrink-0 text-sapphire" />
          <span className="leading-snug">
            <span className="font-semibold text-foreground underline decoration-border underline-offset-4 group-hover/doc:decoration-sapphire">
              {copy.badge}
            </span>
            <span aria-hidden="true"> · </span>
            {doctorName}, {resolvedSpecialty}
            <span aria-hidden="true"> · </span>
            {copy.verified} {resolvedDate}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex min-h-[44px] items-center gap-2.5 rounded-lg border border-sapphire-border bg-sapphire-soft px-3.5 py-2 text-left text-xs font-medium text-sapphire transition-all hover:bg-sapphire-soft/80 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${className}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sapphire/10 text-sapphire">
            <ShieldIcon className="h-3.5 w-3.5" />
          </span>
          <span className="leading-snug">
            <span className="font-semibold">{copy.badge}</span> · {doctorName},{" "}
            {resolvedSpecialty} · {copy.verified} {resolvedDate}
          </span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-dialog-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-xs sm:items-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-sapphire-soft text-sapphire">
                  <StethoscopeIcon className="h-6 w-6" />
                </span>
                <div>
                  <h3
                    id="doctor-dialog-title"
                    className="text-lg font-semibold text-foreground"
                  >
                    {copy.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {copy.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={copy.closeAria}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-foreground">
              <div className="rounded-lg border border-border bg-muted/30 p-3.5">
                <p className="font-semibold text-sapphire">{doctorName}</p>
                <p className="text-xs text-muted-foreground">
                  {copy.specialistIn} {resolvedSpecialty} · {copy.college}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {copy.lastReview} {resolvedDate}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">{copy.intro}</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {copy.steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="font-bold text-sapphire">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] rounded-lg bg-sapphire px-5 py-2 text-sm font-semibold text-white hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              >
                {copy.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

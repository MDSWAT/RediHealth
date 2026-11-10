"use client";

import Link from "next/link";
import { StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface PrescriptionDoctorBridgeProps {
  className?: string;
}

export function PrescriptionDoctorBridge({ className = "" }: PrescriptionDoctorBridgeProps) {
  const { lang } = useLanguage();

  const dict: Record<Lang, { heading: string; body: string; buttonText: string }> = {
    en: {
      heading: "Not sure about your prescription?",
      body: "Not sure these medicines are safe with other pills you take? Talk to a doctor online for free before you start them.",
      buttonText: "Talk to a doctor about your prescription",
    },
    ro: {
      heading: "Nu înțelegi ceva din rețetă?",
      body: "Nu știi dacă aceste medicamente merg cu alte pastile pe care le iei? Vorbește gratuit cu un medic online înainte să le iei.",
      buttonText: "Vorbește cu un medic despre rețetă",
    },
    sq: {
      heading: "Nuk e kupton diçka në recetë?",
      body: "Nuk je i sigurt nëse këto ilaçe shkojnë me ilaçet e tjera që merr? Fol falas me një mjek online para se t'i fillosh.",
      buttonText: "Fol me një mjek për recetën",
    },
    it: {
      heading: "Hai dubbi sulla ricetta?",
      body: "Non sai se questi farmaci vanno bene insieme ad altri che prendi? Parla gratuitamente con un medico online prima di iniziarli.",
      buttonText: "Parla della ricetta con un medico",
    },
    hr: {
      heading: "Nešto ti nije jasno na receptu?",
      body: "Nisi siguran ili sigurna idu li ovi lijekovi uz druge tablete koje uzimaš? Razgovaraj besplatno s liječnikom online prije nego što ih počneš uzimati.",
      buttonText: "Razgovaraj s liječnikom o receptu",
    },
    rom: {
      heading: "Na haljares vareso and-i receta?",
      body: "Na dzanes te djan kadala drabura avre xapensa so les? Vorbin bi lovengo jekhe doktorestar online angla te nachaves len.",
      buttonText: "Vorbin jekhe doktorestar vash i receta",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  const targetUrl = withLangPrefix("/medic-online?source=prescription", lang);

  return (
    <section className={`mt-8 border-t border-border pt-6 ${className}`}>
      <div className="flex flex-col items-start gap-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">{t.heading}</h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">{t.body}</p>
        </div>
        <Link
          href={targetUrl}
          className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-sapphire px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2 print:hidden sm:w-auto"
        >
          <StethoscopeIcon className="h-4 w-4 shrink-0" />
          <span>{t.buttonText}</span>
        </Link>
      </div>
    </section>
  );
}

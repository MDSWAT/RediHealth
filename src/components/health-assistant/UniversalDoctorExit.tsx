"use client";

import { Button } from "@/components/ui/Button";
import { StethoscopeIcon } from "@/components/ui/icons";
import { findHelpLinks } from "@/lib/i18n/find-help-links";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

interface UniversalDoctorExitProps {
  pathway?: string;
  summary?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function UniversalDoctorExit({
  title,
  description,
  className = "",
}: UniversalDoctorExitProps) {
  const { lang } = useLanguage();
  const places = findHelpLinks(lang);

  const dict: Record<Lang, { heading: string; body: string }> = {
    ru: {
      heading: "Нужно поговорить с врачом или фармацевтом?",
      body: "Найдите ближайшую аптеку, кабинет врача или клинику рядом с вами.",
    },
    en: {
      heading: "Need to check with a doctor or pharmacist?",
      body: "Find the closest pharmacy, family doctor practice or clinic near you.",
    },
    ro: {
      heading: "Ai nevoie să verifici cu un medic sau farmacist?",
      body: "Găsește cea mai apropiată farmacie, cabinet de medic de familie sau clinică lângă tine.",
    },
    sq: {
      heading: "Ke nevojë të flasësh me një mjek ose farmacist?",
      body: "Gjej farmacinë, mjekun e familjes ose klinikën më të afërt pranë teje.",
    },
    it: {
      heading: "Hai bisogno di sentire un medico o un farmacista?",
      body: "Trova la farmacia, il medico di famiglia o l'ambulatorio più vicino a te.",
    },
    hr: {
      heading: "Trebaš li provjeriti s liječnikom ili ljekarnikom?",
      body: "Pronađi najbližu ljekarnu, obiteljskog liječnika ili kliniku u svojoj blizini.",
    },
    rom: {
      heading: "Trebul tut te vorbis jekhe doktoresa vaj farmacistosa?",
      body: "Arakh i maj pashe farmacia, familijako doktori vaj klinika pashe tute.",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  return (
    <section className={`mt-8 border-t border-border pt-6 ${className}`}>
      <h3 className="text-title font-semibold leading-snug text-foreground">{title || t.heading}</h3>
      <p className="mt-1.5 max-w-(--measure-reading) text-body text-muted-foreground">{description || t.body}</p>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button href={withLangPrefix("/find-help", lang)} variant="action" size="lg">
          <StethoscopeIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{places.nav}</span>
        </Button>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { StethoscopeIcon } from "@/components/ui/icons";
import { primaryButton, secondaryButton } from "@/components/health-assistant/step-ui";
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
  pathway = "general",
  summary = "",
  title,
  description,
  className = "",
}: UniversalDoctorExitProps) {
  const { lang } = useLanguage();

  const dict: Record<Lang, { heading: string; body: string; bookOnline: string; checkOnCall: string }> = {
ru: {
      heading: "Хотите поговорить с врачом?",
      body: "Если что-то неясно, вы можете бесплатно поговорить с врачом-волонтером по телефону.",
      bookOnline: "Забронировать звонок",
      checkOnCall: "Посмотреть часы дежурства",
    },

    en: {
      heading: "Would you like to talk to a doctor?",
      body: "If something is unclear, you can talk to a volunteer doctor for free, by phone.",
      bookOnline: "Book a call",
      checkOnCall: "See on-call hours",
    },
    ro: {
      heading: "Vrei să vorbești cu un medic?",
      body: "Dacă nu înțelegi ceva, poți vorbi gratuit cu un medic voluntar, la telefon.",
      bookOnline: "Programează-te",
      checkOnCall: "Vezi orele de gardă",
    },
    sq: {
      heading: "Do të flasësh me një mjek?",
      body: "Nëse diçka nuk është e qartë, mund të flasësh falas me një mjek vullnetar, në telefon.",
      bookOnline: "Rezervo",
      checkOnCall: "Shiko orët e kujdestarisë",
    },
    it: {
      heading: "Vuoi parlare con un medico?",
      body: "Se qualcosa non ti è chiaro, puoi parlare gratis con un medico volontario, al telefono.",
      bookOnline: "Prenota",
      checkOnCall: "Vedi gli orari di guardia",
    },
    hr: {
      heading: "Želiš li razgovarati s liječnikom?",
      body: "Ako ti nešto nije jasno, možeš besplatno telefonom razgovarati s liječnikom volonterom.",
      bookOnline: "Dogovori poziv",
      checkOnCall: "Vrijeme dežurstva",
    },
    rom: {
      heading: "Manges te vorbis jekhe doktorestar?",
      body: "Te na haljares vareso, shaj vorbis bi lovengo jekhe doktoresa pe telefono.",
      bookOnline: "Ker programacia",
      checkOnCall: "Dikh le chasura pe straza",
    },
  };
  const t = dict[lang] || dict[DEFAULT_LANG];

  const queryParams = new URLSearchParams({
    source: "triage",
    pathway,
    ...(summary ? { summary } : {}),
  });

  const consultUrl = withLangPrefix(`/medic-online?${queryParams.toString()}`, lang);
  const onCallUrl = withLangPrefix(`/medic-online?queue=now&${queryParams.toString()}`, lang);

  return (
    <section className={`mt-8 border-t border-border pt-6 ${className}`}>
      <h3 className="text-lg font-semibold leading-snug text-foreground">{title || t.heading}</h3>
      <p className="mt-1.5 max-w-prose text-base leading-relaxed text-muted-foreground">{description || t.body}</p>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link
          href={consultUrl}
          className={`${primaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}
        >
          <StethoscopeIcon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{t.bookOnline}</span>
        </Link>
        <Link
          href={onCallUrl}
          className={`${secondaryButton} whitespace-nowrap text-sm sm:text-[0.9375rem]`}
        >
          <span className="min-w-0 truncate">{t.checkOnCall}</span>
        </Link>
      </div>
    </section>
  );
}

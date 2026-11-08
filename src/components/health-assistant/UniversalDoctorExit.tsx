"use client";

import Link from "next/link";
import { StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG, withLangPrefix } from "@/lib/i18n/routing";

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

  const dict = {
    en: {
      heading: "Would you like to talk to a doctor?",
      body: "If something is unclear, you can talk to a volunteer doctor for free, by video or phone.",
      bookOnline: "Book a call",
      checkOnCall: "See on-call hours",
    },
    ro: {
      heading: "Vrei să vorbești cu un medic?",
      body: "Dacă nu înțelegi ceva, poți vorbi gratuit cu un medic voluntar, prin video sau la telefon.",
      bookOnline: "Programează-te",
      checkOnCall: "Vezi orele de gardă",
    },
    sq: {
      heading: "Do të flasësh me një mjek?",
      body: "Nëse diçka nuk është e qartë, mund të flasësh falas me një mjek vullnetar, me video ose në telefon.",
      bookOnline: "Rezervo",
      checkOnCall: "Shiko orët e kujdestarisë",
    },
    it: {
      heading: "Vuoi parlare con un medico?",
      body: "Se qualcosa non ti è chiaro, puoi parlare gratis con un medico volontario, in video o al telefono.",
      bookOnline: "Prenota",
      checkOnCall: "Vedi gli orari di guardia",
    },
  };
  const t = dict[lang as keyof typeof dict] || dict[DEFAULT_LANG];

  const queryParams = new URLSearchParams({
    source: "triage",
    pathway,
    ...(summary ? { summary } : {}),
  });

  const consultUrl = withLangPrefix(`/medic-online?${queryParams.toString()}`, lang);
  const onCallUrl = withLangPrefix(`/medic-online?queue=now&${queryParams.toString()}`, lang);

  return (
    <section className={`mt-8 border-t border-border pt-6 ${className}`}>
      <h3 className="text-lg font-semibold text-foreground">{title || t.heading}</h3>
      <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">{description || t.body}</p>
      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Link
          href={consultUrl}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-sapphire px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-sapphire/90"
        >
          <StethoscopeIcon className="h-4 w-4 shrink-0" />
          {t.bookOnline}
        </Link>
        <Link
          href={onCallUrl}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted"
        >
          {t.checkOnCall}
        </Link>
      </div>
    </section>
  );
}

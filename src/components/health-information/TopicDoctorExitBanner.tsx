"use client";

import Link from "next/link";
import { ArrowRightIcon, StethoscopeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { translations, type Lang } from "@/lib/i18n/translations";

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    return ctx;
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const bannerCopy: Record<
  Lang,
  {
    statusDot: string;
    title: string;
    description: string;
    buttonText: string;
  }
> = {
  ro: {
    statusDot: "Medic de gardă disponibil acum",
    title: "Ai întrebări despre sănătatea ta?",
    description: "Vorbește pe video cu un medic voluntar sau scrie-i o întrebare. Este gratuit și confidențial.",
    buttonText: "Vorbește cu un medic online",
  },
  en: {
    statusDot: "On-call doctor available now",
    title: "Questions about your health?",
    description: "Talk to a volunteer doctor on video, or write them a question. It is free and confidential.",
    buttonText: "Talk to a doctor online",
  },
  sq: {
    statusDot: "Mjeku kujdestar është i disponueshëm tani",
    title: "Ke pyetje për shëndetin tënd?",
    description: "Fol me video me një mjek vullnetar ose shkruaji një pyetje. Është falas dhe konfidenciale.",
    buttonText: "Fol me një mjek online",
  },
  it: {
    statusDot: "Medico di guardia disponibile ora",
    title: "Hai domande sulla tua salute?",
    description: "Parla in videochiamata con un medico volontario o scrivigli una domanda. È gratis e riservato.",
    buttonText: "Parla con un medico online",
  },
};

export interface TopicDoctorExitBannerProps {
  topicSlug?: string;
  topicTitle?: string;
  className?: string;
}

export function TopicDoctorExitBanner({
  topicSlug,
  topicTitle,
  className = "",
}: TopicDoctorExitBannerProps) {
  const { lang } = useSafeLanguage();
  const copy = bannerCopy[lang] ?? bannerCopy.ro;

  const queryParams = new URLSearchParams();
  if (topicSlug) queryParams.set("context", `topic_${topicSlug}`);
  if (topicTitle) queryParams.set("title", topicTitle);
  const targetHref = withLangPrefix(
    `/medic-online${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
    lang
  );

  return (
    <section
      aria-labelledby="doctor-exit-title"
      className={`relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8 ${className}`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-3">
          <h3
            id="doctor-exit-title"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.title}
          </h3>

          <p className="text-base leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link
            href={targetHref}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.98]"
          >
            <StethoscopeIcon className="h-4 w-4" />
            <span>{copy.buttonText}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

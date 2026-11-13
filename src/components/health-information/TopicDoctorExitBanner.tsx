"use client";

import Link from "next/link";
import { StethoscopeIcon } from "@/components/ui/icons";
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

export interface DoctorBannerCopy {
  title: string;
  description: string;
  buttonText: string;
}

/** The online doctor is a voice call (no video, no written questions). */
export const DOCTOR_BANNER_COPY: Record<Lang, DoctorBannerCopy> = {
  ru: {
    title: "Вопросы о вашем здоровье?",
    description: "Поговорите с врачом-добровольцем с помощью голосового вызова. Это бесплатно и конфиденциально.",
    buttonText: "Поговорите с врачом",
  },

  ro: {
    title: "Ai întrebări despre sănătatea ta?",
    description: "Vorbește cu un medic voluntar într-un apel de voce. Este gratuit și confidențial.",
    buttonText: "Vorbește cu un medic",
  },
  en: {
    title: "Questions about your health?",
    description: "Talk to a volunteer doctor in a voice call. It is free and confidential.",
    buttonText: "Talk to a doctor",
  },
  sq: {
    title: "Ke pyetje për shëndetin tënd?",
    description: "Fol me një mjek vullnetar me një thirrje zanore. Është falas dhe konfidenciale.",
    buttonText: "Fol me një mjek",
  },
  it: {
    title: "Hai domande sulla tua salute?",
    description: "Parla con un medico volontario in una chiamata vocale. È gratis e riservato.",
    buttonText: "Parla con un medico",
  },
  hr: {
    title: "Imaš pitanja o svom zdravlju?",
    description: "Razgovaraj s liječnikom volonterom u glasovnom pozivu. Besplatno je i povjerljivo.",
    buttonText: "Razgovaraj s liječnikom",
  },
  rom: {
    title: "Si tut phuchimata vaš tiro sastipen?",
    description: "De duma jekhe doktoresa volonteri pe glaso. Si bi lovengo thaj garavdo.",
    buttonText: "De duma doktoresa",
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
  const copy = DOCTOR_BANNER_COPY[lang] ?? DOCTOR_BANNER_COPY.ro;

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
      className={`rounded-lg border border-border bg-card p-6 shadow-xs sm:p-8 ${className}`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-3">
          <h2
            id="doctor-exit-title"
            className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {copy.title}
          </h2>

          <p className="text-base leading-relaxed text-muted-foreground">
            {copy.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Link
            href={targetHref}
            className="inline-flex min-h-[48px] max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <StethoscopeIcon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{copy.buttonText}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  AppleIcon,
  ArrowRightIcon,
  BrainIcon,
  DropletIcon,
  HeartIcon,
  NoSmokingIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { HealthTopicContent } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconsBySlug: Record<string, IconComponent> = {
  "heart-health": HeartIcon,
  diabetes: DropletIcon,
  "healthy-eating": AppleIcon,
  "physical-activity": ActivityIcon,
  "mental-wellbeing": BrainIcon,
  smoking: NoSmokingIcon,
  "preventive-screening": SearchIcon,
  "womens-health": ShieldIcon,
};

export interface RelatedTopicsCarouselProps {
  topics: HealthTopicContent[];
  className?: string;
  lang?: Lang;
}

function useSafeLanguageContext(): { lang: Lang } {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" };
  }
}

export function RelatedTopicsCarousel({
  topics,
  className = "",
  lang,
}: RelatedTopicsCarouselProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.relatedTopics;

  if (topics.length === 0) return null;

  return (
    <section
      aria-labelledby="related-topics-heading"
      className={`my-12 border-t border-border pt-10 ${className}`}
    >
      <h2
        id="related-topics-heading"
        className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
      >
        {s.heading[currentLang]}
      </h2>

      {/* One surface with hairline rows (one column on phones, three on wide screens). */}
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        {topics.map((t) => {
          const Icon = iconsBySlug[t.slug] || HeartIcon;
          return (
            <li key={t.slug} className="group relative flex flex-col p-5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted/40 focus-within:bg-muted/40">
              <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground sm:text-lg">
                <Icon className="h-5 w-5 shrink-0 text-sapphire" aria-hidden="true" />
                {/* The link covers the whole row, so the row is one tap target. */}
                <Link
                  href={withLangPrefix(`/health-information/${t.slug}`, currentLang)}
                  className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-sapphire group-hover:text-sapphire"
                >
                  {t.title}
                </Link>
                <ArrowRightIcon className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-hover:text-sapphire" aria-hidden="true" />
              </h3>
              <p className="mt-1.5 pl-[30px] text-sm leading-relaxed text-muted-foreground">{t.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

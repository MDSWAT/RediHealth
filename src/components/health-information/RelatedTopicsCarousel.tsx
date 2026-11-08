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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            id="related-topics-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {s.heading[currentLang]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {s.subtitle[currentLang]}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => {
          const Icon = iconsBySlug[t.slug] || HeartIcon;
          return (
            <li
              key={t.slug}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-xs transition-colors hover:border-sapphire/50"
            >
              <div>
                <h3 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
                  <Icon className="h-5 w-5 shrink-0 text-sapphire" aria-hidden="true" />
                  <span>{t.title}</span>
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {t.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40">
                <Link
                  href={withLangPrefix(`/health-information/${t.slug}`, currentLang)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-semibold text-sapphire hover:text-sapphire-light"
                >
                  <span>{s.readOrListen[currentLang]}</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

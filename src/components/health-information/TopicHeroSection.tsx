"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { HealthTopicContent } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
import { ArticleListenButton } from "./ArticleListenButton";
import {
  HEALTH_ARTICLE_CONTAINER_CLASS,
  HealthArticleBackLink,
  HealthArticleHeader,
} from "./HealthArticleShell";
import { TopicMetaBadge } from "./TopicMetaBadge";
import { GuideOfflinePrintActions } from "./GuideOfflinePrintActions";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface TopicHeroSectionProps {
  topic: HealthTopicContent;
  icon?: IconComponent;
  /** Estimated reading and listening time for this topic, in minutes. */
  readMinutes?: number;
  audioMinutes?: number;
  onListenClick: () => void;
  onStopClick?: () => void;
  isPlayingAudio?: boolean;
  /** Names this button as the one for the whole guide, apart from the per-section Listen buttons. */
  listenLabel?: string;
  saveText?: string;
  afterActions?: ReactNode;
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

function pickLocale(
  entry: Record<"ro", string> & Partial<Record<Lang, string>>,
  lang: Lang,
): string {
  return entry[lang] ?? entry.ro;
}

const TOPIC_HERO_PHOTOS: Record<string, { src: string; objectPosition: string }> = {
  "heart-health": { src: "/images/health-topics/heart-health-care.jpg", objectPosition: "object-[50%_38%]" },
  diabetes: { src: "/images/health-topics/diabetes.jpg", objectPosition: "object-[50%_62%]" },
  "healthy-eating": { src: "/images/health-topics/healthy-eating.jpg", objectPosition: "object-center" },
  "physical-activity": { src: "/images/health-topics/physical-activity.jpg", objectPosition: "object-[50%_22%]" },
  "mental-wellbeing": { src: "/images/health-topics/mental-wellbeing.jpg", objectPosition: "object-[50%_52%]" },
  smoking: { src: "/images/health-topics/smoking.jpg", objectPosition: "object-center" },
  "preventive-screening": { src: "/images/health-topics/preventive-screening.jpg", objectPosition: "object-[50%_18%]" },
  "womens-health": { src: "/images/health-topics/womens-health.jpg", objectPosition: "object-[50%_45%]" },
};

export function TopicHeroSection({
  topic,
  readMinutes = 3,
  audioMinutes = 2,
  onListenClick,
  onStopClick,
  isPlayingAudio = false,
  listenLabel,
  saveText,
  afterActions,
  className = "",
  lang,
}: TopicHeroSectionProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicHero;
  const heroPhoto = TOPIC_HERO_PHOTOS[topic.slug];

  return (
    <section
      aria-label={pickLocale(s.ariaIntro, currentLang)}
      className={cn("bg-background pt-5 sm:pt-8 print:pt-4", className)}
    >
      <Container>
        <div
          className={HEALTH_ARTICLE_CONTAINER_CLASS}
          data-health-article-column
        >
          <HealthArticleBackLink
            href={withLangPrefix("/health-information", currentLang)}
            label={pickLocale(s.backToGuides, currentLang)}
            navAriaLabel={pickLocale(s.ariaNav, currentLang)}
          />

          <HealthArticleHeader
            title={topic.title}
            lead={topic.description}
            meta={
              <TopicMetaBadge
                readMinutes={readMinutes}
                audioMinutes={audioMinutes}
                bordered={false}
                lang={currentLang}
              />
            }
            media={
              heroPhoto ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-sand/50 shadow-(--shadow-card-rest) md:aspect-[4/3]">
                  <Image
                    src={heroPhoto.src}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 100vw, 208px"
                    className={cn("object-cover", heroPhoto.objectPosition)}
                  />
                </div>
              ) : undefined
            }
            actions={
              <div className="btn-row flex w-full flex-wrap items-start gap-2.5">
                <ArticleListenButton
                  uiLang={currentLang}
                  textToSpeak={topic.description}
                  listenLabel={listenLabel}
                  isPlayingExternal={isPlayingAudio}
                  onStartOverride={onListenClick}
                  onStopOverride={() => {
                    if (onStopClick) onStopClick();
                  }}
                />
                <GuideOfflinePrintActions
                  lang={currentLang}
                  title={topic.title}
                  saveText={saveText}
                />
              </div>
            }
            afterActions={afterActions}
          />
        </div>
      </Container>
    </section>
  );
}

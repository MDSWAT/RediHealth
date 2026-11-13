"use client";

import type { ComponentType, SVGProps } from "react";
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
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import { TopicMetaBadge } from "./TopicMetaBadge";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface TopicHeroSectionProps {
  topic: HealthTopicContent;
  icon?: IconComponent;
  readingLevel: "simple" | "complete";
  /** Estimated reading and listening time for this topic, in minutes. */
  readMinutes?: number;
  audioMinutes?: number;
  onReadingLevelChange: (level: "simple" | "complete") => void;
  onListenClick: () => void;
  onStopClick?: () => void;
  isPlayingAudio?: boolean;
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

export function TopicHeroSection({
  topic,
  readingLevel,
  readMinutes = 3,
  audioMinutes = 2,
  onReadingLevelChange,
  onListenClick,
  onStopClick,
  isPlayingAudio = false,
  className = "",
  lang,
}: TopicHeroSectionProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicHero;

  const effectiveReadMinutes =
    readingLevel === "complete" ? readMinutes + 2 : readMinutes;
  const effectiveAudioMinutes =
    readingLevel === "complete" ? audioMinutes + 1 : audioMinutes;

  return (
    <section
      aria-label={pickLocale(s.ariaIntro, currentLang)}
      className={cn("bg-background pt-8 sm:pt-12 print:pt-4", className)}
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
                readMinutes={effectiveReadMinutes}
                audioMinutes={effectiveAudioMinutes}
                bordered={false}
                lang={currentLang}
              />
            }
            actions={
              <>
                <ArticleListenButton
                  uiLang={currentLang}
                  textToSpeak={topic.description}
                  isPlayingExternal={isPlayingAudio}
                  onStartOverride={onListenClick}
                  onStopOverride={() => {
                    if (onStopClick) onStopClick();
                  }}
                />
                <ReadingLevelSwitcher
                  level={readingLevel}
                  onChange={onReadingLevelChange}
                />
              </>
            }
          />
        </div>
      </Container>
    </section>
  );
}

"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
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

export function TopicHeroSection({
  topic,
  readMinutes = 3,
  audioMinutes = 2,
  onListenClick,
  onStopClick,
  isPlayingAudio = false,
  saveText,
  afterActions,
  className = "",
  lang,
}: TopicHeroSectionProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicHero;

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
                readMinutes={readMinutes}
                audioMinutes={audioMinutes}
                bordered={false}
                lang={currentLang}
              />
            }
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <ArticleListenButton
                  uiLang={currentLang}
                  textToSpeak={topic.description}
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

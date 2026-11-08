"use client";

import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { HealthTopicContent } from "@/lib/i18n/health-information-topics";
import type { Lang } from "@/lib/i18n/translations";
import { HEALTH_DETAIL_SHARED_STRINGS } from "@/lib/i18n/health-myths";
import { speechEngine } from "@/lib/audio/speech-engine";
import { playEarcon } from "@/lib/audio/earcon";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { DoctorValidatedBadge } from "./DoctorValidatedBadge";
import { ReadingLevelSwitcher } from "./ReadingLevelSwitcher";
import { TopicMetaBadge } from "./TopicMetaBadge";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface TopicHeroSectionProps {
  topic: HealthTopicContent;
  icon: IconComponent;
  readingLevel: "simple" | "complete";
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

export function TopicHeroSection({
  topic,
  icon: Icon,
  readingLevel,
  onReadingLevelChange,
  onListenClick,
  onStopClick,
  isPlayingAudio = false,
  className = "",
  lang,
}: TopicHeroSectionProps) {
  const { lang: ctxLang } = useSafeLanguageContext();
  const currentLang: Lang = lang ?? ctxLang ?? "ro";
  const voiceEnabled = isVoiceEnabled(currentLang);
  const s = HEALTH_DETAIL_SHARED_STRINGS.topicHero;

  const handleAudioAction = () => {
    if (isPlayingAudio) {
      playEarcon("stop");
      speechEngine.stop();
      speechEngine.requestClose();
      if (onStopClick) {
        onStopClick();
      }
    } else {
      playEarcon("start");
      onListenClick();
    }
  };

  return (
    <section
      aria-label={s.ariaIntro[currentLang]}
      className={`border-b border-border bg-card py-10 sm:py-14 print:py-4 ${className}`}
    >
      <Container>
        {/* Breadcrumb navigation */}
        <nav aria-label={s.ariaNav[currentLang]} className="mb-6 print:hidden">
          <Link
            href={withLangPrefix("/health-information", currentLang)}
            className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-sapphire hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" />
            <span>{s.backToGuides[currentLang]}</span>
          </Link>
        </nav>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              <Icon className="h-8 w-8 shrink-0 text-sapphire sm:h-9 sm:w-9" aria-hidden="true" />
              <span>{topic.title}</span>
            </h1>

            <div className="print:hidden">
              <TopicMetaBadge readMinutes={3} audioMinutes={2} bordered={false} lang={currentLang} />
            </div>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {readingLevel === "simple"
                ? topic.description
                : topic.intro}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <DoctorValidatedBadge variant="inline" />

              {voiceEnabled && (
                <button
                  type="button"
                  onClick={handleAudioAction}
                  aria-pressed={isPlayingAudio}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-sapphire px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire active:scale-[0.98] print:hidden"
                >
                  {isPlayingAudio ? (
                    <svg
                      className="h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                  <span>{isPlayingAudio ? s.stopAudio[currentLang] : s.listenGuide[currentLang]}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center lg:pt-4 print:hidden">
            <ReadingLevelSwitcher
              level={readingLevel}
              onChange={onReadingLevelChange}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

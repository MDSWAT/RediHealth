"use client";

import { ListenButton } from "@/components/ui/ListenButton";
import type { Lang } from "@/lib/i18n/translations";

export interface ArticleListenButtonProps {
  textToSpeak: string;
  uiLang: Lang;
  contentLang?: Lang | string;
  listenLabel?: string;
  stopLabel?: string;
  onStartOverride?: () => void;
  onStopOverride?: () => void;
  isPlayingExternal?: boolean;
  /** Defaults to true so topic guides, topic summaries, articles, and news stories respect the Auto-read preference. */
  autoRead?: boolean;
  className?: string;
}

/**
 * Thin wrapper around unified `ListenButton` for guide, topic, and article headers.
 * Safe outside `LanguageContext.Provider` and omits itself when browser speech is disabled.
 */
export function ArticleListenButton({
  textToSpeak,
  uiLang,
  contentLang,
  listenLabel,
  stopLabel,
  onStartOverride,
  onStopOverride,
  isPlayingExternal,
  autoRead = true,
  className,
}: ArticleListenButtonProps) {
  const handleOverrideToggle =
    onStartOverride || onStopOverride
      ? () => {
          if (isPlayingExternal) {
            onStopOverride?.();
          } else {
            onStartOverride?.();
          }
        }
      : undefined;

  return (
    <ListenButton
      text={textToSpeak}
      isPlaying={isPlayingExternal}
      onToggle={handleOverrideToggle}
      uiLang={uiLang}
      contentLang={contentLang}
      label={listenLabel}
      stopLabel={stopLabel}
      playStartEarcon
      closePlayerOnStop
      autoRead={autoRead}
      // The guide player behind the override speaks through the same engine, so the same rule holds.
      hideWhenNoVoice
      className={className}
    />
  );
}

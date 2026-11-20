"use client";

import { useContext } from "react";
import { useReadAloud } from "@/components/health-check/readingTools";
import { ListenButton } from "@/components/ui/ListenButton";
import { LanguageContext } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

/** Client listen button for public pages that renders nothing until browser voice is available. */
export function PageListenAction({
  lang: langProp,
  segments,
  autoRead = true,
  autoReadKey,
  className,
}: {
  lang?: Lang;
  segments: string[];
  /** Pass false for a second listen button on a page, so only the page's own one answers Auto-read. */
  autoRead?: boolean;
  autoReadKey?: string;
  className?: string;
}) {
  const ctx = useContext(LanguageContext);
  const activeLang: Lang = langProp ?? ctx?.lang ?? DEFAULT_LANG;
  const voice = useReadAloud(activeLang);

  if (!voice.available) return null;

  return (
    <ListenButton
      uiLang={activeLang}
      autoRead={autoRead}
      autoReadKey={autoReadKey}
      isPlaying={voice.speaking}
      onToggle={() => (voice.speaking ? voice.stop() : voice.speak(segments))}
      className={className}
    />
  );
}

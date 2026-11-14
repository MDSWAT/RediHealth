"use client";

import { ListenButton } from "@/components/ui/ListenButton";
import { useLanguage } from "@/lib/i18n/language-context";
import { DEFAULT_LANG } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

function useOptionalLanguage(): Lang | undefined {
  try {
    return useLanguage().lang;
  } catch {
    return undefined;
  }
}

export interface InlineAudioNarratorButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  /** BCP-47 speech language, e.g. "ro-RO". Also picks the fallback label language. */
  lang?: string;
  /** Retained for caller compatibility; `ListenButton` always renders `outline`. */
  variant?: "outline" | "ghost";
}

function langFromLocaleTag(tag: string): Lang {
  const prefix = tag.split("-")[0].toLowerCase();
  if (
    prefix === "ro" ||
    prefix === "en" ||
    prefix === "sq" ||
    prefix === "it" ||
    prefix === "hr" ||
    prefix === "rom" ||
    prefix === "ru"
  ) {
    return prefix;
  }
  return DEFAULT_LANG;
}

/**
 * Thin section-narrator wrapper delegating to the unified `ListenButton`.
 */
export function InlineAudioNarratorButton({
  textToSpeak,
  label,
  className,
  lang = "ro-RO",
}: InlineAudioNarratorButtonProps) {
  const contextLang = useOptionalLanguage();
  const uiLang = contextLang ?? langFromLocaleTag(lang);

  return (
    <ListenButton
      text={textToSpeak}
      uiLang={uiLang}
      contentLang={lang}
      ariaLabel={label}
      title={label}
      className={className}
    />
  );
}

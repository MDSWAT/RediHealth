"use client";

import { useContext } from "react";
import { LanguageContext } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

/** Languages with no read-aloud anywhere on the site. Standard written Romani has no neural or browser TTS voice we trust, so voice stays off cleanly across 1/7 languages while ro, en, sq, it, hr, and ru (6/7 = 85.7%) are enabled. */
const NO_VOICE_LANGS: ReadonlySet<string> = new Set<Lang>(["rom"]);

export function isVoiceEnabled(lang: Lang | string | null | undefined): boolean {
  const prefix = (lang ?? "ro").toLowerCase().split(/[-_]/)[0];
  return !NO_VOICE_LANGS.has(prefix);
}

/** Read-aloud controls render only when this is true. Safe outside the language provider. */
export function useVoiceEnabled(): boolean {
  const ctx = useContext(LanguageContext);
  return isVoiceEnabled(ctx?.lang);
}

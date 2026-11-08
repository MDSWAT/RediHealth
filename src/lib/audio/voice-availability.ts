"use client";

import { useContext } from "react";
import { LanguageContext } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

/** Languages with no read-aloud anywhere on the site. Albanian: no voice we trust, so no voice at all. */
const NO_VOICE_LANGS: ReadonlySet<string> = new Set<Lang>(["sq"]);

export function isVoiceEnabled(lang: Lang | string | null | undefined): boolean {
  const prefix = (lang ?? "ro").toLowerCase().split(/[-_]/)[0];
  return !NO_VOICE_LANGS.has(prefix);
}

/** Read-aloud controls render only when this is true. Safe outside the language provider. */
export function useVoiceEnabled(): boolean {
  const ctx = useContext(LanguageContext);
  return isVoiceEnabled(ctx?.lang);
}

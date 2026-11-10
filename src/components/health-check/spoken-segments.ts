import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import { COPY } from "@/components/health-check/health-check-copy";

/**
 * Languages that get pre-recorded Piper audio. Romanian is not here: Piper's only Romanian voice
 * (ro_RO-mihai-medium) drops the first sound of most phrases, so Romanian uses the best voice on
 * the device instead. Albanian has no read-aloud at all.
 */
export const VOICE_LANGS = ["en", "it"] as const satisfies readonly Lang[];
export type VoiceLang = (typeof VOICE_LANGS)[number];

export function isVoiceLang(lang: Lang): lang is VoiceLang {
  return (VOICE_LANGS as readonly Lang[]).includes(lang);
}

/** Normalises a sentence the same way at recording time and at playback time. */
export function normaliseSegment(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** FNV-1a 32-bit, hex: a stable file name for each recorded sentence. */
export function segmentId(text: string): string {
  let hash = 0x811c9dc5;
  const s = normaliseSegment(text);
  for (let i = 0; i < s.length; i += 1) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

const RO_SMALL_NUMBERS: Record<string, string> = {
  "1": "unu", "2": "două", "3": "trei", "4": "patru", "5": "cinci", "6": "șase", "7": "șapte", "8": "opt", "9": "nouă",
};

/**
 * What the voice should say for a displayed sentence. Speech engines read "2–7" as "doi-șapte"
 * (wrong gender in Romanian) or skip the dash, and say 112 as "one hundred and twelve".
 */
export function spokenForm(lang: Lang, text: string): string {
  let t = normaliseSegment(text);
  if (lang === "ro") {
    t = t
      .replace(/\bDe (\d)–(\d) /g, "Între $1 și $2 ")
      .replace(/(\d)–(\d)/g, "$1 până la $2")
      .replace(/\b112\b/g, "unu unu doi")
      .replace(/Între 1 și/g, "Între una și")
      .replace(/(^|[^\d])([1-9])(?=\s+\p{L})/gu, (_m, pre: string, d: string) => pre + RO_SMALL_NUMBERS[d]);
  } else if (lang === "en") {
    t = t.replace(/(\d)–(\d)/g, "$1 to $2").replace(/\b112\b/g, "one one two");
  } else if (lang === "it") {
    t = t.replace(/\b(\d)–(\d)/g, "da $1 a $2").replace(/\b112\b/g, "uno uno due");
  } else if (lang === "hr") {
    t = t.replace(/(\d)–(\d)/g, "od $1 do $2").replace(/\b112\b/g, "jedan jedan dva");
  } else if (lang === "rom") {
    t = t.replace(/(\d)–(\d)/g, "$1 dji ko $2").replace(/\b112\b/g, "jekh jekh duj");
  }
  return t;
}

export function segmentUrl(lang: VoiceLang, text: string): string {
  return `/audio/health-check/${lang}/${segmentId(text)}.mp3`;
}

/**
 * Every sentence the health check can read aloud, one entry per clip.
 * Must stay in step with `spokenParts()` in HealthCheckExplorer; a test checks that the
 * recorded manifest covers this list.
 */
export function collectSpokenSegments(lang: Lang): string[] {
  const dict = getHealthCheckTranslations(lang);
  const c = COPY[lang];
  const ui = dict.ui;
  const out = [
    ui.step1Question, ui.step2Question, ui.step3Question, ui.step4Question,
    ui.step1Prompt, ui.step2Prompt, ui.step3Prompt, ui.step4Prompt,
    ...Object.values(dict.bodyParts).map((p) => p.title),
    ...Object.values(dict.symptoms).flatMap((list) => (list ?? []).map((s) => s.title)),
    c.otherTitle,
    ui.severityHeading,
    ...Object.values(dict.severity).map((s) => s.title),
    ui.durationHeading,
    ...Object.values(dict.duration).map((d) => d.label),
    ui.emergency.title,
    ui.emergency.description,
    ...Object.values(dict.urgency).flatMap((u) => [u.title, u.intro]),
    c.childNote,
  ];
  return [...new Set(out.filter(Boolean).map(normaliseSegment))];
}

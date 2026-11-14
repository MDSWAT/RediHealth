import type { Lang } from "@/lib/i18n/translations";

export const SUPPORTED_TTS_LANGS = [
  "ro",
  "en",
  "sq",
  "it",
  "hr",
  "ru",
] as const satisfies readonly Lang[];

export type SupportedTtsLang = (typeof SUPPORTED_TTS_LANGS)[number];

export const TTS_OUTPUT_FORMAT = "audio-16khz-32kbitrate-mono-mp3";

export interface NeuralVoiceConfig {
  lang: SupportedTtsLang;
  locale: string;
  voice: string;
}

export const AZURE_NEURAL_VOICES: Record<SupportedTtsLang, NeuralVoiceConfig> = {
  ro: { lang: "ro", locale: "ro-RO", voice: "ro-RO-AlinaNeural" },
  en: { lang: "en", locale: "en-GB", voice: "en-GB-SoniaNeural" },
  sq: { lang: "sq", locale: "sq-AL", voice: "sq-AL-AnilaNeural" },
  it: { lang: "it", locale: "it-IT", voice: "it-IT-ElsaNeural" },
  hr: { lang: "hr", locale: "hr-HR", voice: "hr-HR-GabrijelaNeural" },
  ru: { lang: "ru", locale: "ru-RU", voice: "ru-RU-SvetlanaNeural" },
};

const SUPPORTED_TTS_LANG_SET: ReadonlySet<string> = new Set<string>(SUPPORTED_TTS_LANGS);

/** Extracts the lowercase primary subtag and validates it against supported TTS languages. */
export function resolveTtsLang(input: string | null | undefined): SupportedTtsLang | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  const primary = trimmed.split(/[-_]/)[0];
  if (!primary || !SUPPORTED_TTS_LANG_SET.has(primary)) {
    return null;
  }
  return primary as SupportedTtsLang;
}

/** Returns the Azure neural voice configuration for a language, honoring env voice overrides. */
export function getNeuralVoiceConfig(
  input: string | null | undefined,
): NeuralVoiceConfig | null {
  const lang = resolveTtsLang(input);
  if (!lang) return null;
  const base = AZURE_NEURAL_VOICES[lang];
  const override =
    typeof process !== "undefined"
      ? process.env[`AZURE_SPEECH_VOICE_${lang.toUpperCase()}`]?.trim()
      : undefined;
  if (override) {
    return {
      lang: base.lang,
      locale: base.locale,
      voice: override,
    };
  }
  return base;
}

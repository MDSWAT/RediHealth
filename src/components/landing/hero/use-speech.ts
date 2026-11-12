"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { formatSpeechText } from "@/lib/audio/speech-engine";

/**
 * Read-aloud that speaks each language with a voice for that language.
 *
 * Setting `utterance.lang` alone does not choose a voice: most browsers keep
 * their default (usually English) voice and mispronounce Romanian. So we pick
 * an installed voice whose language matches, prefer the higher quality ones,
 * and gracefully fall back to the default system voice when no matching language
 * voice is installed, while keeping `available: true` so the sound toggle button
 * is never erroneously hidden from the UI.
 */

/** Preferred regional variants per page language, best first. */
const VOICE_LOCALES: Record<Lang, string[]> = {
  ru: ["ru-ru", "ru"],

  ro: ["ro-ro", "ro-md", "ro"],
  en: ["en-gb", "en-ie", "en-us", "en"],
  it: ["it-it", "it-ch", "it"],
  sq: ["sq-al", "sq-xk", "sq"],
  hr: ["hr-HR", "hr"],
  rom: [],
};

/** Engine naming conventions for natural, high quality voices (Chrome, Edge, Safari, Siri). */
const QUALITY_HINTS = /(premium|enhanced|neural|natural|online|google|siri|wavenet|studio)/i;
/** Apple's, Microsoft's, and Google's natural voices for Romanian, English, Croatian, and Italian. */
const KNOWN_GOOD =
  /\b(daniel|samantha|sonia|ryan|libby|ava|andrew|emma|brian|jenny|aria|guy|karen|moira|tessa|rishi|serena|kate|oliver|elsa|isabella|diego|giuseppe|fabiola|alice|federica|luca|paola|ioana|alina|emil|andrei|carmen|elena|gabrijela|srecko|lana)\b/i;
/** macOS novelty voices (sound effects, singing). Never acceptable for health information. */
const NOVELTY =
  /^(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph)\b/i;
/** Older, robotic multilingual voices: only used when nothing better exists. */
const ROBOTIC = /^(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley)\b/i;

export const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Voices load asynchronously (Chrome fires `voiceschanged`); a string key keeps
// useSyncExternalStore's snapshot stable between identical lists.
function readVoicesKey(): string {
  if (!hasSpeech()) return "";
  return window.speechSynthesis
    .getVoices()
    .map((voice) => `${voice.voiceURI}|${voice.lang}`)
    .join(",");
}

function subscribeVoices(onChange: () => void) {
  if (!hasSpeech()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}

const normalise = (tag: string) => tag.replace("_", "-").toLowerCase();

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: Lang,
  allowFallback = false
): SpeechSynthesisVoice | null {
  const rawPreferred = VOICE_LOCALES[lang] ?? [lang];
  if (rawPreferred.length === 0) return null;
  const preferred = rawPreferred.map(normalise);
  const language = preferred[preferred.length - 1];

  let best: { voice: SpeechSynthesisVoice; score: number } | null = null;
  for (const voice of voices) {
    const tag = normalise(voice.lang);
    if (tag !== language && !tag.startsWith(`${language}-`)) continue;
    if (NOVELTY.test(voice.name)) continue;

    const regionRank = preferred.indexOf(tag);
    let score = regionRank === -1 ? 0 : (preferred.length - regionRank) * 10;
    if (KNOWN_GOOD.test(voice.name)) score += 8;
    if (QUALITY_HINTS.test(voice.name) || QUALITY_HINTS.test(voice.voiceURI || "")) score += 12;
    if (ROBOTIC.test(voice.name)) score -= 25;
    if (voice.localService) score += 1;

    if (!best || score >= best.score) best = { voice, score };
  }

  if (best) return best.voice;

  if (allowFallback && voices.length > 0) {
    // Pick default system voice or first non-novelty voice
    return (
      voices.find((v) => v.default && !NOVELTY.test(v.name)) ||
      voices.find((v) => !NOVELTY.test(v.name) && !ROBOTIC.test(v.name)) ||
      voices.find((v) => !NOVELTY.test(v.name)) ||
      voices[0] ||
      null
    );
  }

  return null;
}

/** Ends every fragment with punctuation so the engine pauses naturally between them. */
export function toSentences(parts: string[]): string[] {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/[.?!:…]$/.test(part) ? part : `${part}.`));
}

export function useSpeech(lang: Lang) {
  const voicesKey = useSyncExternalStore(subscribeVoices, readVoicesKey, () => "");
  
  const { voice, isFallback } = useMemo(() => {
    if (!voicesKey || !hasSpeech()) return { voice: null, isFallback: false };
    const allVoices = window.speechSynthesis.getVoices();
    const matched = pickVoice(allVoices, lang, false);
    if (matched) return { voice: matched, isFallback: false };
    const fallback = pickVoice(allVoices, lang, true);
    return { voice: fallback, isFallback: true };
  }, [voicesKey, lang]);

  // Which language is being read, so a language switch reads as "not speaking"
  // without needing a state update in an effect.
  const [speakingLang, setSpeakingLang] = useState<Lang | null>(null);
  const speaking = speakingLang === lang;
  const runId = useRef(0);

  // Persistent active utterance retention shield against Chromium V8 GC truncation
  const activeUtterances = useRef<Set<SpeechSynthesisUtterance>>(new Set());

  const stop = useCallback(() => {
    runId.current += 1;
    if (hasSpeech()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore speech synthesis abort errors
      }
    }
    activeUtterances.current.clear();
    setSpeakingLang(null);
  }, []);

  const speak = useCallback(
    (sentences: string[]) => {
      if (!hasSpeech() || !isVoiceEnabled(lang) || sentences.length === 0) return;
      const run = ++runId.current;
      activeUtterances.current.clear();

      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore cancel errors
      }

      setSpeakingLang(lang);

      // Sequential sentence chaining: speak one sentence at a time (<15s)
      // to completely prevent Chromium's speech freeze watchdog timeout
      const speakSentence = (index: number) => {
        if (runId.current !== run || index >= sentences.length) {
          if (runId.current === run) {
            setSpeakingLang(null);
          }
          return;
        }

        const text = formatSpeechText(sentences[index], lang);
        const utterance = new SpeechSynthesisUtterance(text);
        activeUtterances.current.add(utterance);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = lang;
        }
        utterance.rate = 0.95;

        utterance.onend = () => {
          activeUtterances.current.delete(utterance);
          if (runId.current === run) {
            speakSentence(index + 1);
          }
        };

        utterance.onerror = (e) => {
          activeUtterances.current.delete(utterance);
          // Ignore intentional cancellation/interruption
          if (e.error === "canceled" || e.error === "interrupted") {
            return;
          }
          if (runId.current === run) {
            speakSentence(index + 1);
          }
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          activeUtterances.current.delete(utterance);
          if (runId.current === run) {
            setSpeakingLang(null);
          }
        }
      };

      speakSentence(0);
    },
    [voice, lang],
  );

  // A language change or unmount must never leave the old language talking.
  useEffect(() => {
    const utterances = activeUtterances.current;
    return () => {
      runId.current += 1;
      utterances.clear();
      if (hasSpeech()) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Safe cancel
        }
      }
    };
  }, [lang]);

  return {
    available: hasSpeech() && isVoiceEnabled(lang),
    speaking,
    isFallback,
    speak,
    stop,
  };
}

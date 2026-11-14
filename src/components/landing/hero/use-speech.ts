"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { findBestVoice, formatSpeechText, speechEngine } from "@/lib/audio/speech-engine";

/**
 * Read-aloud hook for landing hero triage and smart search.
 * Delegates playback to the unified speechEngine (Azure Neural TTS first, then
 * strictly matching-language Web Speech voices, never cross-language fallback).
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

function subscribeSpeechEngine(onChange: () => void) {
  let mounted = false;
  const unsubscribe = speechEngine.subscribeState(() => {
    if (mounted) onChange();
  });
  mounted = true;
  return unsubscribe;
}

export function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: Lang,
  allowFallback = false
): SpeechSynthesisVoice | null {
  void allowFallback;
  if (!isVoiceEnabled(lang)) return null;
  const targetLocale = VOICE_LOCALES[lang]?.[0] ?? lang;
  const { voice, isFallback } = findBestVoice(voices, targetLocale);
  return isFallback ? null : voice;
}

/** Ends every fragment with punctuation so the engine pauses naturally between them. */
export function toSentences(parts: string[]): string[] {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/[.?!:…]$/.test(part) ? part : `${part}.`));
}

export function useSpeech(lang: Lang) {
  const voiceEnabled = isVoiceEnabled(lang);
  const voicesKey = useSyncExternalStore(subscribeVoices, readVoicesKey, () => "");
  const neuralServerAvailable = useSyncExternalStore(
    subscribeSpeechEngine,
    () => Boolean(speechEngine.isNeuralServerAvailable()),
    () => false,
  );

  useEffect(() => {
    if (voiceEnabled) {
      void speechEngine.probeNeuralServer();
    }
  }, [voiceEnabled, lang]);

  const voice = useMemo(() => {
    if (!voicesKey || !hasSpeech()) return null;
    return pickVoice(window.speechSynthesis.getVoices(), lang, false);
  }, [voicesKey, lang]);

  // Which language is being read, so a language switch reads as "not speaking"
  // without needing a state update in an effect.
  const [speakingLang, setSpeakingLang] = useState<Lang | null>(null);
  const speaking = speakingLang === lang;
  const runId = useRef(0);
  const activeSpeakingRef = useRef(false);

  const stop = useCallback(() => {
    runId.current += 1;
    activeSpeakingRef.current = false;
    speechEngine.stop();
    setSpeakingLang(null);
  }, []);

  const speak = useCallback(
    (sentences: string[]) => {
      if (typeof window === "undefined" || !isVoiceEnabled(lang) || sentences.length === 0) return;

      const speechLang = VOICE_LOCALES[lang]?.[0] ?? lang;
      const text = toSentences(sentences)
        .map((sentence) => formatSpeechText(sentence, speechLang))
        .filter(Boolean)
        .join(" ");
      if (!text) return;

      const run = ++runId.current;
      activeSpeakingRef.current = true;
      setSpeakingLang(lang);

      speechEngine.speak(text, {
        lang: speechLang,
        rate: 1.0,
        onEnd: () => {
          if (runId.current === run) {
            activeSpeakingRef.current = false;
            setSpeakingLang(null);
          }
        },
        onError: () => {
          if (runId.current === run) {
            activeSpeakingRef.current = false;
            setSpeakingLang(null);
          }
        },
      });
    },
    [lang],
  );

  // A language change or unmount must never leave the old language talking.
  useEffect(() => {
    return () => {
      if (activeSpeakingRef.current) {
        activeSpeakingRef.current = false;
        runId.current += 1;
        speechEngine.stop();
      }
    };
  }, [lang]);

  const available = voiceEnabled && (neuralServerAvailable || voice !== null);
  const isFallback = !neuralServerAvailable && voice === null;

  return {
    available,
    speaking,
    isFallback,
    speak,
    stop,
  };
}

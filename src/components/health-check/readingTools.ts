"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n/translations";
import voiceManifest from "@/components/health-check/voice-manifest.json";
import { isVoiceLang, normaliseSegment, segmentId, segmentUrl, spokenForm, type VoiceLang } from "@/components/health-check/spoken-segments";
import { findBestVoice } from "@/lib/audio/speech-engine";
import { useTextScale } from "@/lib/comfort-preferences";

/* ---------- Larger text: backed by shared comfort preferences so header and pages stay in sync ---------- */

export function useLargeText(): [boolean, () => void] {
  const [scale, setScale] = useTextScale();
  const enabled = scale !== "normal";
  const toggle = useCallback(() => {
    setScale(scale === "normal" ? "large" : "normal");
  }, [scale, setScale]);

  return [enabled, toggle];
}

/* ---------- Read aloud ----------
 * English and Italian: clips recorded ahead of time with Piper (scripts/health-check-voice).
 * Romanian and Croatian: the best matching voice installed on the device.
 * Albanian and Romani: no read-aloud at all, so robotic wrong-language TTS never plays.
 */

const RECORDED: Partial<Record<Lang, ReadonlySet<string>>> = Object.fromEntries(
  Object.entries(voiceManifest.clips).map(([lang, ids]) => [lang, new Set(ids)]),
);
const DEVICE_VOICE_LANG: Partial<Record<Lang, string>> = {
  ru: "ru-RU",

  ro: "ro-RO",
  en: "en-GB",
  it: "it-IT",
  hr: "hr-HR",
};

/** True when at least one sentence has a recorded clip for this language. */
function hasAnyClip(lang: VoiceLang, parts: string[]): boolean {
  const set = RECORDED[lang];
  return !!set && parts.some((p) => set.has(segmentId(p)));
}

function subscribeVoices(listener: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", listener);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", listener);
}

function findDeviceVoice(lang: Lang): SpeechSynthesisVoice | null {
  const tag = DEVICE_VOICE_LANG[lang];
  if (!tag || typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const { voice, isFallback } = findBestVoice(window.speechSynthesis.getVoices(), tag);
  return isFallback ? null : voice;
}

export function useReadAloud(lang: Lang) {
  const recorded = isVoiceLang(lang) && (RECORDED[lang]?.size ?? 0) > 0;
  const hasDeviceVoice = useSyncExternalStore(
    subscribeVoices,
    () => findDeviceVoice(lang) !== null,
    () => false,
  );
  const available = recorded || hasDeviceVoice;
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtterancesRef = useRef<Set<SpeechSynthesisUtterance>>(new Set());
  const runRef = useRef(0);

  const stop = useCallback(() => {
    runRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    activeUtterancesRef.current.clear();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speakWithDevice = useCallback(
    (queue: string[], run: number) => {
      const voice = findDeviceVoice(lang);
      if (!voice) return false;
      let index = 0;
      const next = () => {
        if (run !== runRef.current) return;
        if (index >= queue.length) {
          setSpeaking(false);
          return;
        }
        const utterance = new SpeechSynthesisUtterance(spokenForm(lang, queue[index]));
        activeUtterancesRef.current.add(utterance);
        index += 1;
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 0.95;
        utterance.onend = () => {
          activeUtterancesRef.current.delete(utterance);
          next();
        };
        utterance.onerror = () => {
          activeUtterancesRef.current.delete(utterance);
          if (run === runRef.current) setSpeaking(false);
        };
        window.speechSynthesis.speak(utterance);
      };
      setSpeaking(true);
      next();
      return true;
    },
    [lang],
  );

  const speak = useCallback(
    (parts: string[]) => {
      const queue = parts.map(normaliseSegment).filter(Boolean);
      if (!queue.length) return;
      stop();
      const run = runRef.current;
      if (!isVoiceLang(lang) || !hasAnyClip(lang, queue)) {
        speakWithDevice(queue, run);
        return;
      }
      const clipSet = RECORDED[lang];
      const fallbackVoice = findDeviceVoice(lang);
      // A fresh element per reading: no stale handlers from a reading that was stopped.
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
      let index = 0;
      const playNext = () => {
        if (run !== runRef.current) return;
        if (index >= queue.length) {
          setSpeaking(false);
          return;
        }
        const segment = queue[index];
        index += 1;
        if (clipSet?.has(segmentId(segment))) {
          audio.src = segmentUrl(lang, segment);
          audio.play().catch(() => {
            if (run === runRef.current) playNext();
          });
          return;
        }
        if (fallbackVoice && typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(spokenForm(lang, segment));
          activeUtterancesRef.current.add(utterance);
          utterance.voice = fallbackVoice;
          utterance.lang = fallbackVoice.lang;
          utterance.rate = 0.95;
          utterance.onend = () => {
            activeUtterancesRef.current.delete(utterance);
            playNext();
          };
          utterance.onerror = () => {
            activeUtterancesRef.current.delete(utterance);
            playNext();
          };
          window.speechSynthesis.speak(utterance);
          return;
        }
        playNext();
      };
      audio.onended = playNext;
      audio.onerror = () => {
        if (run === runRef.current) playNext();
      };
      setSpeaking(true);
      playNext();
    },
    [lang, stop, speakWithDevice],
  );

  // Never keep talking after the person leaves the page or changes language.
  useEffect(() => stop, [stop, lang]);

  return { available, speaking, speak, stop };
}

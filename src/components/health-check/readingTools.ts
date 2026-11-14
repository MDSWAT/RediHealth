"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Lang } from "@/lib/i18n/translations";
import voiceManifest from "@/components/health-check/voice-manifest.json";
import {
  isVoiceLang,
  normaliseSegment,
  segmentId,
  segmentUrl,
  spokenForm,
} from "@/components/health-check/spoken-segments";
import { findBestVoice, speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
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
 * Server Neural TTS (/api/tts) across 6/7 languages (ro, en, sq, it, hr, ru) with
 * matching-language Web Speech fallback, optional complete Piper MP3 manifest queues
 * inside the Health Check explorer when neural TTS is unavailable, and Romani off.
 */

export interface UseReadAloudOptions {
  allowManifestClips?: boolean;
}

const RECORDED: Partial<Record<Lang, ReadonlySet<string>>> = Object.fromEntries(
  Object.entries(voiceManifest.clips).map(([lang, ids]) => [lang, new Set(ids)]),
);

const DEVICE_VOICE_LANG: Partial<Record<Lang, string>> = {
  ru: "ru-RU",
  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
};

function speechLangFor(lang: Lang): string {
  return DEVICE_VOICE_LANG[lang] ?? lang;
}

function toSentenceString(lang: Lang, queue: string[]): string {
  return queue
    .map((part) => spokenForm(lang, part))
    .filter(Boolean)
    .map((part) => (/[.?!:…]$/.test(part) ? part : `${part}.`))
    .join(" ");
}

function subscribeVoices(listener: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", listener);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", listener);
}

function subscribeSpeechEngine(listener: () => void) {
  let mounted = false;
  const unsubscribe = speechEngine.subscribeState(() => {
    if (mounted) listener();
  });
  mounted = true;
  return unsubscribe;
}

function findDeviceVoice(lang: Lang): SpeechSynthesisVoice | null {
  const tag = DEVICE_VOICE_LANG[lang];
  if (!tag || typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const { voice, isFallback } = findBestVoice(window.speechSynthesis.getVoices(), tag);
  return isFallback ? null : voice;
}

// Tracks an active static Piper clip queue so starting another speech source stops it cleanly.
let activeManifestStop: (() => void) | null = null;
let manifestEngineUnsubscribe: (() => void) | null = null;

function ensureManifestEngineListener() {
  if (manifestEngineUnsubscribe) return;
  let wasSpeaking = speechEngine.isSpeaking();
  manifestEngineUnsubscribe = speechEngine.subscribeState((state) => {
    if (state.isSpeaking && !wasSpeaking && activeManifestStop) {
      const stopFn = activeManifestStop;
      activeManifestStop = null;
      stopFn();
    }
    wasSpeaking = state.isSpeaking;
  });
}

export function useReadAloud(lang: Lang, options?: UseReadAloudOptions) {
  const allowManifestClips = Boolean(options?.allowManifestClips);
  const voiceEnabled = isVoiceEnabled(lang);
  const recorded = isVoiceLang(lang) && (RECORDED[lang]?.size ?? 0) > 0;

  useEffect(() => {
    if (voiceEnabled) {
      void speechEngine.probeNeuralServer();
    }
  }, [voiceEnabled, lang]);

  const neuralAvailable = useSyncExternalStore(
    subscribeSpeechEngine,
    () => Boolean(speechEngine.isNeuralServerAvailable()),
    () => false,
  );
  const hasDeviceVoice = useSyncExternalStore(
    subscribeVoices,
    () => findDeviceVoice(lang) !== null,
    () => false,
  );

  const available =
    voiceEnabled && (neuralAvailable || hasDeviceVoice || (allowManifestClips && recorded));

  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const manifestStopFnRef = useRef<(() => void) | null>(null);
  const activeRunRef = useRef(false);
  const runRef = useRef(0);

  const stopAudioElements = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    }
    const preloaded = preloadedAudioRef.current;
    if (preloaded) {
      preloaded.onended = null;
      preloaded.onerror = null;
      preloaded.pause();
      preloaded.removeAttribute("src");
      preloaded.load();
      preloadedAudioRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    runRef.current += 1;
    activeRunRef.current = false;
    if (manifestStopFnRef.current && activeManifestStop === manifestStopFnRef.current) {
      activeManifestStop = null;
    }
    manifestStopFnRef.current = null;
    if (activeManifestStop) {
      const otherStop = activeManifestStop;
      activeManifestStop = null;
      otherStop();
    }
    stopAudioElements();
    speechEngine.stop();
    setSpeaking(false);
  }, [stopAudioElements]);

  const speak = useCallback(
    (parts: string[]) => {
      if (!isVoiceEnabled(lang)) return;
      const queue = parts.map(normaliseSegment).filter(Boolean);
      if (!queue.length) return;

      stop();
      const run = runRef.current;

      // Only play pre-recorded Piper clips when neural TTS is unavailable AND every segment exists
      // in the manifest so we never mix Piper audio and OS speechSynthesis mid-queue.
      if (
        !speechEngine.isNeuralServerAvailable() &&
        allowManifestClips &&
        isVoiceLang(lang) &&
        queue.every((p) => RECORDED[lang]?.has(segmentId(p)))
      ) {
        ensureManifestEngineListener();
        const stopThisManifest = () => {
          if (run === runRef.current) {
            runRef.current += 1;
            activeRunRef.current = false;
            manifestStopFnRef.current = null;
            stopAudioElements();
            setSpeaking(false);
          }
        };
        manifestStopFnRef.current = stopThisManifest;
        activeManifestStop = stopThisManifest;
        activeRunRef.current = true;
        setSpeaking(true);

        const createClipAudio = (url: string) => {
          const clip = new Audio(url);
          clip.preload = "auto";
          clip.playbackRate = 1.0;
          return clip;
        };

        let index = 0;
        const playNext = () => {
          if (run !== runRef.current) return;
          if (index >= queue.length) {
            activeRunRef.current = false;
            if (activeManifestStop === stopThisManifest) {
              activeManifestStop = null;
            }
            manifestStopFnRef.current = null;
            stopAudioElements();
            setSpeaking(false);
            return;
          }

          const segment = queue[index];
          const clipAudio =
            preloadedAudioRef.current ?? createClipAudio(segmentUrl(lang, segment));
          preloadedAudioRef.current = null;
          audioRef.current = clipAudio;
          clipAudio.playbackRate = 1.0;

          const nextIdx = index + 1;
          if (nextIdx < queue.length) {
            const nextClip = createClipAudio(segmentUrl(lang, queue[nextIdx]));
            preloadedAudioRef.current = nextClip;
            nextClip.load?.();
          }

          index = nextIdx;
          clipAudio.onended = () => {
            if (run === runRef.current) playNext();
          };
          clipAudio.onerror = () => {
            if (run === runRef.current) playNext();
          };
          clipAudio.play().catch(() => {
            if (run === runRef.current) playNext();
          });
        };

        playNext();
        return;
      }

      const speechText = toSentenceString(lang, queue);
      if (!speechText) return;

      activeRunRef.current = true;
      setSpeaking(true);
      speechEngine.speak(speechText, {
        lang: speechLangFor(lang),
        rate: 1.0,
        onEnd: () => {
          if (run === runRef.current) {
            activeRunRef.current = false;
            setSpeaking(false);
          }
        },
        onError: () => {
          if (run === runRef.current) {
            activeRunRef.current = false;
            setSpeaking(false);
          }
        },
      });
    },
    [lang, allowManifestClips, stop, stopAudioElements],
  );

  // Never keep talking after the person leaves the page or changes language.
  useEffect(() => {
    return () => {
      if (activeRunRef.current) {
        stop();
      }
    };
  }, [stop, lang]);

  return { available, speaking, speak, stop };
}

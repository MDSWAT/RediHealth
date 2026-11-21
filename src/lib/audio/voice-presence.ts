"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { findBestVoice, speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { SPEECH_LANG_BY_LOCALE } from "@/lib/i18n/speech-locales";

/**
 * Whether read-aloud can work at all for a language on this phone.
 *
 * - "available": the server voice answered yes, or the phone has a voice in this language.
 * - "pending": not known yet (the server has not answered or could not be reached, or the
 *   phone is still loading its voices). A Listen button stays visible in this state.
 * - "none": the server said it has no voice and the phone has none either. Only then may a
 *   Listen button be hidden, and it comes back if a voice appears later.
 */
export type VoicePresence = "pending" | "available" | "none";

type DeviceVoices = "match" | "no-match" | "empty" | "unsupported";

/** A phone that has not listed any voice after this long is treated as having none, for now. */
const DEVICE_VOICE_GRACE_MS = 4_000;

function speechTagFor(lang: string): string {
  const prefix = lang.toLowerCase().split(/[-_]/)[0];
  return (SPEECH_LANG_BY_LOCALE as Record<string, string | undefined>)[prefix] ?? lang;
}

function subscribeDeviceVoices(listener: () => void): () => void {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !window.speechSynthesis) {
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.addEventListener?.("voiceschanged", listener);
  try {
    // Asking for the list is what makes some phones start loading it.
    synth.getVoices?.();
  } catch {
    // Ignore voice pre-warm errors
  }
  return () => {
    synth.removeEventListener?.("voiceschanged", listener);
  };
}

function readDeviceVoices(tag: string): DeviceVoices {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !window.speechSynthesis) {
    return "unsupported";
  }
  try {
    const voices = window.speechSynthesis.getVoices?.() ?? [];
    if (voices.length === 0) return "empty";
    const { voice, isFallback } = findBestVoice(voices, tag);
    return voice && !isFallback ? "match" : "no-match";
  } catch {
    return "empty";
  }
}

function subscribeEngine(listener: () => void): () => void {
  let mounted = false;
  const unsubscribe = speechEngine.subscribeState(() => {
    if (mounted) listener();
  });
  mounted = true;
  return unsubscribe;
}

function readServerVoice(): boolean | null {
  return speechEngine.isNeuralServerAvailable();
}

export function useVoicePresence(lang: string | null | undefined): VoicePresence {
  const enabled = isVoiceEnabled(lang);
  const tag = speechTagFor(lang ?? "ro");

  const serverVoice = useSyncExternalStore(subscribeEngine, readServerVoice, () => null);
  const deviceVoices = useSyncExternalStore<DeviceVoices>(
    subscribeDeviceVoices,
    () => readDeviceVoices(tag),
    () => "empty",
  );
  const [graceOver, setGraceOver] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void speechEngine.probeNeuralServer();
    const timer = window.setTimeout(() => setGraceOver(true), DEVICE_VOICE_GRACE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  if (!enabled) return "none";
  if (serverVoice === true || deviceVoices === "match") return "available";
  // No answer from the server yet, or it could not be reached: it may still have a voice.
  if (serverVoice === null) return "pending";
  if (deviceVoices === "no-match" || deviceVoices === "unsupported") return "none";
  return graceOver ? "none" : "pending";
}

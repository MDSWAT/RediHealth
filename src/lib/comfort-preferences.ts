"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type TextScale = "normal" | "large" | "xl";
export type ReadingLevel = "simple" | "complete";

export const COMFORT_CHANGE_EVENT = "redihealth:comfort-change";

const TEXT_SCALE_KEY = "redihealth-text-scale";
const LEGACY_LARGE_TEXT_KEY = "redihealth-large-text";
const CALM_MOTION_KEY = "redihealth-calm-motion";
const READING_LEVEL_KEY = "redihealth_reading_level";
const LEGACY_PLAIN_LANGUAGE_KEY = "redihealth_plain_language";

const listeners = new Set<() => void>();
let storageBound = false;

function notifyComfortListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COMFORT_CHANGE_EVENT));
  }
}

function bindStorageListener() {
  if (storageBound || typeof window === "undefined") return;
  storageBound = true;
  window.addEventListener("storage", (event) => {
    if (
      event.key === null ||
      event.key === TEXT_SCALE_KEY ||
      event.key === LEGACY_LARGE_TEXT_KEY ||
      event.key === CALM_MOTION_KEY ||
      event.key === READING_LEVEL_KEY
    ) {
      applyComfortToDom();
      listeners.forEach((listener) => listener());
    }
  });
}

export function subscribeComfort(listener: () => void): () => void {
  bindStorageListener();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTextScaleSnapshot(): TextScale {
  if (typeof window === "undefined") return "normal";
  try {
    const raw = window.localStorage.getItem(TEXT_SCALE_KEY);
    if (raw === "normal" || raw === "large" || raw === "xl") return raw;
    if (window.localStorage.getItem(LEGACY_LARGE_TEXT_KEY) === "1") return "large";
  } catch {
    // Private browsing or blocked storage: fall back to default scale.
  }
  return "normal";
}

export function getCalmMotionSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CALM_MOTION_KEY) === "1";
  } catch {
    return false;
  }
}

export function getReadingLevelSnapshot(): ReadingLevel {
  if (typeof window === "undefined") return "simple";
  try {
    const raw = window.localStorage.getItem(READING_LEVEL_KEY);
    if (raw === "simple" || raw === "complete") return raw;
    if (window.localStorage.getItem(LEGACY_PLAIN_LANGUAGE_KEY) === "false") return "complete";
  } catch {
    // Private browsing or blocked storage: keep plain-language default.
  }
  return "simple";
}

export function applyComfortToDom() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const textScale = getTextScaleSnapshot();
  const calmMotion = getCalmMotionSnapshot();
  const readingLevel = getReadingLevelSnapshot();

  if (textScale === "xl") {
    root.style.fontSize = "126%";
    root.setAttribute("data-text-scale", "xl");
  } else if (textScale === "large") {
    root.style.fontSize = "114%";
    root.setAttribute("data-text-scale", "large");
  } else {
    root.style.removeProperty("font-size");
    root.removeAttribute("data-text-scale");
  }

  if (calmMotion) {
    root.setAttribute("data-calm-motion", "true");
  } else {
    root.removeAttribute("data-calm-motion");
  }
  root.setAttribute("data-reading-level", readingLevel);
}

/** True when either OS reduced-motion or in-app Calm Motion is active. */
export function prefersCalmOrReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    getCalmMotionSnapshot() ||
    (typeof document !== "undefined" && document.documentElement.hasAttribute("data-calm-motion")) ||
    (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

export function setTextScale(next: TextScale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TEXT_SCALE_KEY, next);
    window.localStorage.setItem(LEGACY_LARGE_TEXT_KEY, next === "normal" ? "0" : "1");
  } catch {
    // Storage blocked: DOM still updates for the active session.
  }
  applyComfortToDom();
  notifyComfortListeners();
}

export function setCalmMotion(next: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CALM_MOTION_KEY, next ? "1" : "0");
  } catch {
    // Storage blocked.
  }
  applyComfortToDom();
  notifyComfortListeners();
}

export function setReadingLevel(next: ReadingLevel) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(READING_LEVEL_KEY, next);
    window.localStorage.setItem(LEGACY_PLAIN_LANGUAGE_KEY, next === "simple" ? "true" : "false");
  } catch {
    // Storage blocked.
  }
  applyComfortToDom();
  notifyComfortListeners();
}

export function resetComfortPreferences() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TEXT_SCALE_KEY);
    window.localStorage.removeItem(LEGACY_LARGE_TEXT_KEY);
    window.localStorage.removeItem(CALM_MOTION_KEY);
    window.localStorage.removeItem(READING_LEVEL_KEY);
    window.localStorage.removeItem(LEGACY_PLAIN_LANGUAGE_KEY);
  } catch {
    // Storage blocked.
  }
  applyComfortToDom();
  notifyComfortListeners();
}

export function useTextScale(): [TextScale, (next: TextScale) => void] {
  const scale = useSyncExternalStore(
    subscribeComfort,
    getTextScaleSnapshot,
    (): TextScale => "normal"
  );
  const update = useCallback((next: TextScale) => setTextScale(next), []);
  return [scale, update];
}

export function useCalmMotion(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getCalmMotionSnapshot, () => false);
  const update = useCallback((next: boolean) => setCalmMotion(next), []);
  return [enabled, update];
}

export function useReadingLevel(): [ReadingLevel, (next: ReadingLevel) => void] {
  const level = useSyncExternalStore(
    subscribeComfort,
    getReadingLevelSnapshot,
    (): ReadingLevel => "simple"
  );
  const update = useCallback((next: ReadingLevel) => setReadingLevel(next), []);
  return [level, update];
}

/** Keeps <html> comfort attributes synced across routes and tabs. */
export function useComfortDomSync() {
  useEffect(() => {
    applyComfortToDom();
  }, []);
}

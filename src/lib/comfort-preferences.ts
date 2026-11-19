"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type TextScale = "normal" | "large" | "xl";
export type ReadingLevel = "simple" | "complete";

export const COMFORT_CHANGE_EVENT = "redihealth:comfort-change";

const TEXT_SCALE_KEY = "redihealth-text-scale";
const LEGACY_LARGE_TEXT_KEY = "redihealth-large-text";
const CALM_MOTION_KEY = "redihealth-calm-motion";
const AUTO_READ_KEY = "redihealth-auto-read";
const HIGH_CONTRAST_KEY = "redihealth-high-contrast";
const UNDERLINE_LINKS_KEY = "redihealth-underline-links";
const WIDE_SPACING_KEY = "redihealth-wide-spacing";
const READING_GUIDE_KEY = "redihealth-reading-guide";
const GRAYSCALE_KEY = "redihealth-grayscale";
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
      event.key === AUTO_READ_KEY ||
      event.key === HIGH_CONTRAST_KEY ||
      event.key === UNDERLINE_LINKS_KEY ||
      event.key === WIDE_SPACING_KEY ||
      event.key === READING_GUIDE_KEY ||
      event.key === GRAYSCALE_KEY ||
      event.key === READING_LEVEL_KEY ||
      event.key === LEGACY_PLAIN_LANGUAGE_KEY
    ) {
      applyComfortToDom();
      listeners.forEach((listener) => listener());
    }
  });
}

function readBooleanPreference(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeBooleanPreference(key: string, next: boolean, getSnapshot: () => boolean) {
  if (typeof window === "undefined") return;
  if (getSnapshot() === next) return;
  try {
    window.localStorage.setItem(key, next ? "1" : "0");
  } catch {
    // Storage blocked: DOM still updates for the active session.
  }
  applyComfortToDom();
  notifyComfortListeners();
}

function syncBooleanAttribute(root: HTMLElement, attribute: string, enabled: boolean) {
  if (enabled) {
    root.setAttribute(attribute, "true");
  } else {
    root.removeAttribute(attribute);
  }
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
  return readBooleanPreference(CALM_MOTION_KEY);
}

export function getAutoReadSnapshot(): boolean {
  return readBooleanPreference(AUTO_READ_KEY);
}

export function getHighContrastSnapshot(): boolean {
  return readBooleanPreference(HIGH_CONTRAST_KEY);
}

export function getUnderlineLinksSnapshot(): boolean {
  return readBooleanPreference(UNDERLINE_LINKS_KEY);
}

export function getWideSpacingSnapshot(): boolean {
  return readBooleanPreference(WIDE_SPACING_KEY);
}

/** A band that follows the pointer or finger and dims the lines above and below it. */
export function getReadingGuideSnapshot(): boolean {
  return readBooleanPreference(READING_GUIDE_KEY);
}

/** Shows the site in shades of grey, for people who find colour tiring or hard to tell apart. */
export function getGrayscaleSnapshot(): boolean {
  return readBooleanPreference(GRAYSCALE_KEY);
}

/**
 * The "Simple / Detailed" reading switch was removed: every visitor reads the regular (detailed)
 * text, whatever an earlier visit stored in the browser.
 */
export function getReadingLevelSnapshot(): ReadingLevel {
  return "complete";
}

export function applyComfortToDom() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const textScale = getTextScaleSnapshot();
  const calmMotion = getCalmMotionSnapshot();
  const autoRead = getAutoReadSnapshot();
  const highContrast = getHighContrastSnapshot();
  const underlineLinks = getUnderlineLinksSnapshot();
  const wideSpacing = getWideSpacingSnapshot();
  const readingGuide = getReadingGuideSnapshot();
  const grayscale = getGrayscaleSnapshot();
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

  syncBooleanAttribute(root, "data-calm-motion", calmMotion);
  syncBooleanAttribute(root, "data-auto-read", autoRead);
  syncBooleanAttribute(root, "data-high-contrast", highContrast);
  syncBooleanAttribute(root, "data-underline-links", underlineLinks);
  syncBooleanAttribute(root, "data-wide-spacing", wideSpacing);
  syncBooleanAttribute(root, "data-reading-guide", readingGuide);
  syncBooleanAttribute(root, "data-grayscale", grayscale);

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
  if (getTextScaleSnapshot() === next) return;
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
  writeBooleanPreference(CALM_MOTION_KEY, next, getCalmMotionSnapshot);
}

export function setAutoRead(next: boolean) {
  writeBooleanPreference(AUTO_READ_KEY, next, getAutoReadSnapshot);
}

export function setHighContrastPreference(next: boolean) {
  writeBooleanPreference(HIGH_CONTRAST_KEY, next, getHighContrastSnapshot);
}

export function setUnderlineLinksPreference(next: boolean) {
  writeBooleanPreference(UNDERLINE_LINKS_KEY, next, getUnderlineLinksSnapshot);
}

export function setWideSpacingPreference(next: boolean) {
  writeBooleanPreference(WIDE_SPACING_KEY, next, getWideSpacingSnapshot);
}

export function setReadingGuidePreference(next: boolean) {
  writeBooleanPreference(READING_GUIDE_KEY, next, getReadingGuideSnapshot);
}

export function setGrayscalePreference(next: boolean) {
  writeBooleanPreference(GRAYSCALE_KEY, next, getGrayscaleSnapshot);
}

/** Kept so older callers still compile; the reading level can no longer be changed. */
export function setReadingLevel(next: ReadingLevel) {
  void next;
}

export function resetComfortPreferences() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TEXT_SCALE_KEY);
    window.localStorage.removeItem(LEGACY_LARGE_TEXT_KEY);
    window.localStorage.removeItem(CALM_MOTION_KEY);
    window.localStorage.removeItem(AUTO_READ_KEY);
    window.localStorage.removeItem(HIGH_CONTRAST_KEY);
    window.localStorage.removeItem(UNDERLINE_LINKS_KEY);
    window.localStorage.removeItem(WIDE_SPACING_KEY);
    window.localStorage.removeItem(READING_GUIDE_KEY);
    window.localStorage.removeItem(GRAYSCALE_KEY);
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

export function useAutoRead(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getAutoReadSnapshot, () => false);
  const update = useCallback((next: boolean) => setAutoRead(next), []);
  return [enabled, update];
}

export function useHighContrast(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getHighContrastSnapshot, () => false);
  const update = useCallback((next: boolean) => setHighContrastPreference(next), []);
  return [enabled, update];
}

export function useUnderlineLinks(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getUnderlineLinksSnapshot, () => false);
  const update = useCallback((next: boolean) => setUnderlineLinksPreference(next), []);
  return [enabled, update];
}

export function useWideSpacing(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getWideSpacingSnapshot, () => false);
  const update = useCallback((next: boolean) => setWideSpacingPreference(next), []);
  return [enabled, update];
}

export function useReadingGuide(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getReadingGuideSnapshot, () => false);
  const update = useCallback((next: boolean) => setReadingGuidePreference(next), []);
  return [enabled, update];
}

export function useGrayscale(): [boolean, (next: boolean) => void] {
  const enabled = useSyncExternalStore(subscribeComfort, getGrayscaleSnapshot, () => false);
  const update = useCallback((next: boolean) => setGrayscalePreference(next), []);
  return [enabled, update];
}

export function useReadingLevel(): [ReadingLevel, (next: ReadingLevel) => void] {
  const level = useSyncExternalStore(
    subscribeComfort,
    getReadingLevelSnapshot,
    (): ReadingLevel => "complete"
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

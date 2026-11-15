"use client";

import { useEffect, type RefObject } from "react";
import { speechEngine } from "@/lib/audio/speech-engine";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { useAutoRead } from "@/lib/comfort-preferences";
import { stripLangFromPathname } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

/**
 * Routes where automatic narration must never start on its own (live calls,
 * clinical panels, offline/demo shells, or multi-step clinical wizards).
 */
const DISALLOWED_AUTO_READ_PREFIXES = [
  "/panel",
  "/demo",
  "/offline",
  "/medic-online/meet",
  "/patient-portal",
  "/contul-meu",
  "/sign-in",
  "/health-check/note",
];

let lastAutoReadSignature: string | null = null;

export function clearPageAutoReadSession(): void {
  lastAutoReadSignature = null;
}

export function isPageAutoReadAllowedRoute(pathname: string): boolean {
  const bare = stripLangFromPathname(pathname || "/");
  for (const prefix of DISALLOWED_AUTO_READ_PREFIXES) {
    if (bare === prefix || bare.startsWith(`${prefix}/`)) {
      return false;
    }
  }
  return true;
}

function isElementVisiblyRendered(el: HTMLElement | null): boolean {
  if (!el || typeof window === "undefined") return true;
  if (el.getClientRects().length === 0) return false;
  const computed = window.getComputedStyle(el);
  return computed.display !== "none" && computed.visibility !== "hidden";
}

function hasBlockingDialogOpen(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.querySelector("dialog[open], #mobile-menu[data-open='true']"));
}

function hasBrowserUserActivation(): boolean {
  if (typeof navigator === "undefined") return true;
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive?: boolean } }).userActivation;
  if (!ua || typeof ua.hasBeenActive !== "boolean") return true;
  return ua.hasBeenActive;
}

export interface UsePageAutoReadOptions {
  enabled: boolean;
  uiLang: Lang;
  contentLang?: Lang | string;
  anchorRef?: RefObject<HTMLElement | null>;
  isPlaying: boolean;
  onStart: () => void;
  /** Optional key when page text changes dynamically (e.g. prescription result). */
  contentKey?: string;
}

/**
 * Triggers primary page narration automatically when the reader has enabled
 * Auto-read in ComfortMenu, strictly respecting language voice availability
 * (`isVoiceEnabled`, so `rom` never speaks) and page eligibility rules.
 */
export function usePageAutoRead({
  enabled,
  uiLang,
  contentLang,
  anchorRef,
  isPlaying,
  onStart,
  contentKey = "",
}: UsePageAutoReadOptions): void {
  const [autoRead] = useAutoRead();
  const effectiveContentLang = contentLang ?? uiLang;
  const voiceAllowed = isVoiceEnabled(uiLang) && isVoiceEnabled(effectiveContentLang);

  useEffect(() => {
    if (!enabled || !autoRead || !voiceAllowed) return;
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;
    if (!isPageAutoReadAllowedRoute(pathname)) return;

    const signature = `${pathname}::${uiLang}::${String(effectiveContentLang)}::${contentKey}`;
    if (lastAutoReadSignature === signature) return;

    let cancelled = false;
    let timerId = 0;

    const attemptStart = () => {
      if (cancelled) return;
      if (lastAutoReadSignature === signature) return;
      if (isPlaying || speechEngine.isSpeaking()) {
        lastAutoReadSignature = signature;
        return;
      }
      if (anchorRef && !isElementVisiblyRendered(anchorRef.current)) return;
      if (hasBlockingDialogOpen()) return;

      lastAutoReadSignature = signature;
      onStart();
    };

    const cleanupUnlockListeners = () => {
      window.removeEventListener("pointerdown", onFirstGesture, true);
      window.removeEventListener("keydown", onFirstGesture, true);
    };

    function onFirstGesture(event: Event) {
      cleanupUnlockListeners();
      if (cancelled) return;
      const target = event.target instanceof Element ? event.target : null;
      // Do not hijack clicks on links, dialogs, or explicit audio controls.
      if (target?.closest("a[href], button[aria-pressed], dialog")) return;
      timerId = window.setTimeout(attemptStart, 120);
    }

    if (hasBrowserUserActivation()) {
      timerId = window.setTimeout(attemptStart, 420);
    } else {
      window.addEventListener("pointerdown", onFirstGesture, { capture: true, passive: true });
      window.addEventListener("keydown", onFirstGesture, { capture: true });
    }

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      cleanupUnlockListeners();
    };
  }, [enabled, autoRead, voiceAllowed, uiLang, effectiveContentLang, contentKey, anchorRef, isPlaying, onStart]);
}

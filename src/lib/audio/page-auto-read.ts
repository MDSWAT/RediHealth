"use client";

import { useEffect, useRef, type RefObject } from "react";
import { usePathname } from "next/navigation";
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

function isAnchorEligible(el: HTMLElement | null): boolean {
  if (!el) return false;
  if (el.closest?.("[inert], [aria-hidden='true']")) return false;
  if (typeof window === "undefined") return true;
  if (
    typeof document !== "undefined" &&
    (document.body?.getClientRects?.().length ?? 0) > 0 &&
    el.getClientRects().length === 0
  ) {
    return false;
  }
  if (typeof window.getComputedStyle === "function") {
    const computed = window.getComputedStyle(el);
    if (computed.display === "none" || computed.visibility === "hidden") return false;
  }
  return true;
}

function hasBlockingDialogOpen(): boolean {
  if (typeof document === "undefined" || typeof document.querySelector !== "function") return false;
  return Boolean(document.querySelector("dialog[open], #mobile-menu:not([inert])"));
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
  const nextPathname = usePathname();
  const pathname =
    nextPathname || (typeof window !== "undefined" ? window.location.pathname : "/");
  const effectiveContentLang = contentLang ?? uiLang;
  const voiceAllowed = isVoiceEnabled(uiLang) && isVoiceEnabled(effectiveContentLang);

  const isPlayingRef = useRef(isPlaying);
  const onStartRef = useRef(onStart);
  const anchorRefRef = useRef(anchorRef);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    onStartRef.current = onStart;
    anchorRefRef.current = anchorRef;
  }, [isPlaying, onStart, anchorRef]);

  useEffect(() => {
    if (!enabled || !autoRead || !voiceAllowed) return;
    if (typeof window === "undefined") return;
    if (!isPageAutoReadAllowedRoute(pathname)) return;

    const signature = `${pathname}::${uiLang}::${String(effectiveContentLang)}::${contentKey}`;

    let cancelled = false;
    let timerId = 0;
    let blockerObserver: MutationObserver | null = null;

    const clearTimer = () => {
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = 0;
      }
    };

    const stopBlockerObserver = () => {
      if (blockerObserver) {
        blockerObserver.disconnect();
        blockerObserver = null;
      }
    };

    const scheduleAttempt = (delayMs: number) => {
      if (cancelled) return;
      clearTimer();
      timerId = window.setTimeout(attemptStart, delayMs);
    };

    const watchForUnblock = () => {
      if (
        cancelled ||
        blockerObserver ||
        typeof MutationObserver === "undefined" ||
        typeof document === "undefined" ||
        !document.body
      ) {
        return;
      }
      blockerObserver = new MutationObserver(() => {
        if (cancelled) return;
        if (lastAutoReadSignature === signature) {
          stopBlockerObserver();
          return;
        }
        const el = anchorRefRef.current?.current ?? null;
        const blockedByAncestor = Boolean(el?.closest?.("[inert], [aria-hidden='true']"));
        if (!hasBlockingDialogOpen() && !blockedByAncestor) {
          stopBlockerObserver();
          scheduleAttempt(220);
        }
      });
      blockerObserver.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["open", "inert", "aria-hidden"],
      });
    };

    function attemptStart() {
      if (cancelled) return;
      if (lastAutoReadSignature === signature) return;
      if (isPlayingRef.current || speechEngine.isSpeaking()) {
        lastAutoReadSignature = signature;
        return;
      }

      const currentAnchorRef = anchorRefRef.current;
      if (currentAnchorRef) {
        const el = currentAnchorRef.current;
        if (!isAnchorEligible(el)) {
          if (el?.closest?.("[inert], [aria-hidden='true']")) {
            watchForUnblock();
          }
          return;
        }
      }

      if (hasBlockingDialogOpen()) {
        watchForUnblock();
        return;
      }

      lastAutoReadSignature = signature;
      onStartRef.current();
    }

    const cleanupUnlockListeners = () => {
      window.removeEventListener("click", onFirstGesture, true);
      window.removeEventListener("touchend", onFirstGesture, true);
      window.removeEventListener("keydown", onFirstGesture, true);
    };

    function onFirstGesture(event: Event) {
      speechEngine.unlockFromGesture();
      if (cancelled) {
        cleanupUnlockListeners();
        return;
      }
      const target =
        typeof Element !== "undefined" && event.target instanceof Element ? event.target : null;
      // Do not hijack clicks on links, explicit audio controls, or open modal dialogs.
      if (target?.closest("a[href], button[aria-pressed], dialog[open]")) return;
      cleanupUnlockListeners();
      scheduleAttempt(120);
    }

    if (hasBrowserUserActivation()) {
      scheduleAttempt(420);
    } else {
      window.addEventListener("click", onFirstGesture, { capture: true, passive: true });
      window.addEventListener("touchend", onFirstGesture, { capture: true, passive: true });
      window.addEventListener("keydown", onFirstGesture, { capture: true, passive: true });
    }

    return () => {
      cancelled = true;
      clearTimer();
      stopBlockerObserver();
      cleanupUnlockListeners();
    };
  }, [autoRead, enabled, voiceAllowed, uiLang, effectiveContentLang, contentKey, pathname]);
}

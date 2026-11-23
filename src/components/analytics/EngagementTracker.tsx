"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  cleanClickHref,
  cleanPagePath,
  sanitizeTargetKey,
  sanitizeTargetKind,
  sanitizeTargetLabel,
  type ClickTargetKind,
} from "@/lib/analytics";
import { trackEvent } from "@/lib/analytics-events";
import { stripLangFromPathname } from "@/lib/i18n/routing";

const MIN_DWELL_FLUSH_MS = 1_500;
const MAX_DWELL_FLUSH_MS = 30 * 60 * 1_000;
const MAX_CLICKS_PER_PAGE = 25;
const CLICK_DEDUP_MS = 800;

function computeScrollDepth(): number {
  if (typeof window === "undefined") return 0;
  const doc = document.documentElement;
  const scrollHeight = Math.max(doc.scrollHeight, document.body?.scrollHeight ?? 0);
  if (scrollHeight <= 0) return 0;
  const viewport = window.innerHeight || 0;
  if (scrollHeight <= viewport + 40) return 100;
  const reached = window.scrollY + viewport;
  return Math.max(0, Math.min(100, Math.round((reached / scrollHeight) * 100)));
}

function isLongReadingRoute(barePath: string): boolean {
  return (
    (barePath.startsWith("/health-information/") && barePath !== "/health-information") ||
    (barePath.startsWith("/stiri/") && barePath !== "/stiri")
  );
}

type ExtractedClick = {
  targetKey: string;
  targetLabel: string;
  targetKind: ClickTargetKind;
};

/**
 * Extracts an anonymized UI control descriptor from a clicked DOM element.
 * Never reads user-typed input values or private route links.
 */
export function extractSafeClickTarget(
  target: EventTarget | null,
  ownHost?: string | null,
): ExtractedClick | null {
  if (!(target instanceof Element)) return null;
  if (target.closest("[data-no-track], input, textarea, select, [contenteditable='true']")) {
    return null;
  }

  const interactive = target.closest(
    "[data-track-click], a[href], button, [role='button'], [role='tab']",
  );
  if (!interactive || interactive.closest("[data-no-track]")) return null;

  const explicitKey = sanitizeTargetKey(interactive.getAttribute("data-track-click"));
  const explicitLabel = sanitizeTargetLabel(interactive.getAttribute("data-track-label"));
  const explicitKind = sanitizeTargetKind(interactive.getAttribute("data-track-kind"));

  const tag = interactive.tagName.toLowerCase();
  const role = (interactive.getAttribute("role") ?? "").toLowerCase();

  if (tag === "a") {
    const cleanedHref = cleanClickHref(interactive.getAttribute("href"), ownHost);
    if (!cleanedHref && !explicitKey) return null;
    const rawLabel =
      explicitLabel ??
      sanitizeTargetLabel(interactive.getAttribute("aria-label")) ??
      sanitizeTargetLabel(interactive.getAttribute("title")) ??
      sanitizeTargetLabel(interactive.textContent) ??
      cleanedHref;
    if (!rawLabel) return null;
    const key = explicitKey ?? sanitizeTargetKey(`link:${cleanedHref ?? rawLabel}`);
    if (!key) return null;
    return {
      targetKey: key,
      targetLabel: rawLabel.slice(0, 80),
      targetKind: explicitKind ?? "link",
    };
  }

  const ariaLabel = sanitizeTargetLabel(interactive.getAttribute("aria-label"));
  const titleLabel = sanitizeTargetLabel(interactive.getAttribute("title"));
  const textLabel = sanitizeTargetLabel(interactive.textContent);

  const label = explicitLabel ?? ariaLabel ?? titleLabel ?? textLabel;
  // Skip unlabeled icon-only buttons or bare 1-character score chips unless explicitly labeled.
  if (!label || (label.length < 2 && !explicitKey && !ariaLabel)) return null;

  const kind: ClickTargetKind =
    explicitKind ?? (role === "tab" ? "tab" : "button");
  const key = explicitKey ?? sanitizeTargetKey(`${kind}:${label}`);
  if (!key) return null;

  return {
    targetKey: key,
    targetLabel: label.slice(0, 80),
    targetKind: kind,
  };
}

/**
 * Tracks active visible time on page, scroll depth, and anonymized UI clicks/taps on public pages,
 * plus renders a subtle reading-progress hairline on long health guides and news articles.
 */
export function EngagementTracker() {
  const pathname = usePathname();
  const barePath = stripLangFromPathname(pathname);
  const showReadingProgress = isLongReadingRoute(barePath);
  const [scrollProgress, setScrollProgress] = useState(0);

  const activePathRef = useRef<string>(pathname);
  const visibleSinceRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const sentScrollDepthRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const lastClickRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const cleaned = cleanPagePath(pathname);
    if (!cleaned) {
      return;
    }

    activePathRef.current = pathname;
    accumulatedMsRef.current = 0;
    maxScrollRef.current = computeScrollDepth();
    sentScrollDepthRef.current = 0;
    clickCountRef.current = 0;
    lastClickRef.current = null;
    visibleSinceRef.current = document.visibilityState === "visible" ? Date.now() : null;

    let rafId = 0;
    if (showReadingProgress) {
      rafId = window.requestAnimationFrame(() => {
        setScrollProgress(maxScrollRef.current);
      });
    }

    const collectActiveMs = (now: number): number => {
      if (visibleSinceRef.current !== null) {
        accumulatedMsRef.current += Math.max(0, now - visibleSinceRef.current);
        visibleSinceRef.current = document.visibilityState === "visible" ? now : null;
      }
      return accumulatedMsRef.current;
    };

    const flushEngagement = () => {
      const now = Date.now();
      const elapsed = Math.min(MAX_DWELL_FLUSH_MS, collectActiveMs(now));
      const depth = maxScrollRef.current;
      const hasNewScroll = depth > sentScrollDepthRef.current && depth >= 25;
      if (elapsed < MIN_DWELL_FLUSH_MS && !hasNewScroll) return;

      accumulatedMsRef.current = 0;
      sentScrollDepthRef.current = Math.max(sentScrollDepthRef.current, depth);
      trackEvent(
        "page_engagement",
        {
          durationMs: elapsed >= MIN_DWELL_FLUSH_MS ? Math.round(elapsed) : undefined,
          scrollDepth: depth,
        },
        { path: activePathRef.current },
      );
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        flushEngagement();
        visibleSinceRef.current = null;
      } else {
        visibleSinceRef.current = now;
      }
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const depth = computeScrollDepth();
        if (depth > maxScrollRef.current) {
          maxScrollRef.current = depth;
        }
        if (showReadingProgress) {
          setScrollProgress(depth);
        }
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (clickCountRef.current >= MAX_CLICKS_PER_PAGE) return;
      const extracted = extractSafeClickTarget(event.target, window.location.host);
      if (!extracted) return;

      const now = Date.now();
      if (
        lastClickRef.current &&
        lastClickRef.current.key === extracted.targetKey &&
        now - lastClickRef.current.at < CLICK_DEDUP_MS
      ) {
        return;
      }
      lastClickRef.current = { key: extracted.targetKey, at: now };
      clickCountRef.current += 1;

      trackEvent(
        "ui_click",
        {
          targetKey: extracted.targetKey,
          targetLabel: extracted.targetLabel,
          targetKind: extracted.targetKind,
        },
        { path: activePathRef.current },
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flushEngagement);
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flushEngagement);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick);
      flushEngagement();
    };
  }, [pathname, showReadingProgress]);

  if (!showReadingProgress) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent print:hidden"
    >
      <div
        className="h-full origin-left bg-sapphire/85 transition-[transform] duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress / 100))})` }}
      />
    </div>
  );
}

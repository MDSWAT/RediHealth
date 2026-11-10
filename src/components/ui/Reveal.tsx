"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ENTRANCE_OFFSET_PX, useCalmReducedMotion } from "@/lib/motion/tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Optional calm delay in seconds (clamped to <= 0.24s; skipped during rapid scrolling). */
  delay?: number;
};

type RevealCallback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const observedCallbacks = new WeakMap<Element, RevealCallback>();

let velocityListenerCount = 0;
let velocityRafId = 0;
let lastScrollY = 0;
let lastScrollTs = 0;
let currentScrollVelocityPxPerMs = 0;

function sampleVelocityFrame() {
  velocityRafId = 0;
  if (typeof window === "undefined") return;
  const now = performance.now();
  const y = window.scrollY;
  const dt = now - lastScrollTs;
  if (dt > 0 && lastScrollTs > 0) {
    const instant = Math.abs(y - lastScrollY) / dt;
    currentScrollVelocityPxPerMs = currentScrollVelocityPxPerMs * 0.4 + instant * 0.6;
  }
  lastScrollY = y;
  lastScrollTs = now;
}

function onPassiveScroll() {
  if (velocityRafId === 0 && typeof window !== "undefined") {
    velocityRafId = window.requestAnimationFrame(sampleVelocityFrame);
  }
}

function retainScrollVelocitySampler(): () => void {
  if (typeof window === "undefined") return () => {};
  if (velocityListenerCount === 0) {
    lastScrollY = window.scrollY;
    lastScrollTs = performance.now();
    currentScrollVelocityPxPerMs = 0;
    window.addEventListener("scroll", onPassiveScroll, { passive: true });
  }
  velocityListenerCount += 1;
  return () => {
    velocityListenerCount = Math.max(0, velocityListenerCount - 1);
    if (velocityListenerCount === 0) {
      window.removeEventListener("scroll", onPassiveScroll);
      if (velocityRafId !== 0) {
        window.cancelAnimationFrame(velocityRafId);
        velocityRafId = 0;
      }
      currentScrollVelocityPxPerMs = 0;
    }
  };
}

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= 0) {
            const cb = observedCallbacks.get(entry.target);
            if (cb) {
              observedCallbacks.delete(entry.target);
              sharedObserver?.unobserve(entry.target);
              cb();
            }
          }
        }
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.04 },
    );
  }
  return sharedObserver;
}

type Phase = "initial" | "armed" | "revealed";

/**
 * Progressive, SSR-safe below-fold reveal:
 * - Renders at `opacity: 1` during SSR and initial above-fold paint so content is never
 *   hidden if scripts lag or fail.
 * - Only sections genuinely below the fold arm an `8px` GPU settle and reveal once via a
 *   singleton `IntersectionObserver`, adapting duration to passive `rAF` scroll velocity.
 * - Completely static when `useCalmReducedMotion()` is active.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reducedMotion = useCalmReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("initial");
  const [settleDurationVar, setSettleDurationVar] = useState<string>("var(--dur-slow)");

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    const observer = getSharedObserver();
    if (!el || !observer) return;

    const rect = el.getBoundingClientRect();
    // Above or inside the initial viewport: keep visible immediately without re-animating.
    if (rect.top < window.innerHeight * 0.95) {
      return;
    }

    const releaseVelocity = retainScrollVelocitySampler();
    let frameId = window.requestAnimationFrame(() => {
      setPhase("armed");
      observedCallbacks.set(el, () => {
        const v = currentScrollVelocityPxPerMs;
        const dur =
          v > 2.2 ? "var(--dur-fast)" : v > 1.0 ? "var(--dur-base)" : "var(--dur-slow)";
        setSettleDurationVar(dur);
        setPhase("revealed");
      });
      observer.observe(el);
    });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
      observedCallbacks.delete(el);
      observer.unobserve(el);
      releaseVelocity();
    };
  }, [reducedMotion]);

  if (reducedMotion || phase === "initial") {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const clampedDelayMs =
    phase === "revealed" && settleDurationVar === "var(--dur-slow)" && delay > 0
      ? Math.round(Math.min(delay, 0.24) * 1000)
      : 0;

  const style: CSSProperties =
    phase === "armed"
      ? {
          opacity: 0,
          transform: `translate3d(0, ${ENTRANCE_OFFSET_PX}px, 0)`,
          willChange: "opacity, transform",
        }
      : {
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
          transitionProperty: "opacity, transform",
          transitionDuration: settleDurationVar,
          transitionTimingFunction: "var(--ease-out-calm)",
          transitionDelay: clampedDelayMs > 0 ? `${clampedDelayMs}ms` : undefined,
        };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

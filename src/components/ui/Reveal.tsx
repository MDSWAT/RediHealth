"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Optional delay in seconds for items of a grid or list (clamped to 0.24s). */
  delay?: number;
};

const MAX_DELAY_S = 0.24;

type RevealCallback = () => void;

let sharedObserver: IntersectionObserver | null = null;
const observedCallbacks = new WeakMap<Element, RevealCallback>();

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // On screen, or already scrolled past (an anchor jump): either way it must be visible now.
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

type Phase = "visible" | "armed" | "revealed";

/**
 * One calm entrance for content below the fold: opacity plus a 12px rise over `--dur-slow`,
 * once. The styles live in globals.css under `[data-reveal]`.
 * - The server HTML carries no `data-reveal`, so without JavaScript nothing is ever hidden.
 * - After hydration only a block that is still below the viewport is hidden ("armed"); what is
 *   already on screen stays as painted. Without IntersectionObserver nothing is armed.
 * - Static under reduced motion and in print.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reducedMotion = useCalmReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    if (reducedMotion) return;
    const el = ref.current;
    const observer = getSharedObserver();
    if (!el || !observer) return;

    let frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      if (el.getBoundingClientRect().top >= window.innerHeight) {
        setPhase("armed");
      }
      // Observed even when not armed here: a block left armed by an earlier run is then released.
      observedCallbacks.set(el, () => setPhase((current) => (current === "armed" ? "revealed" : current)));
      observer.observe(el);
    });

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      observedCallbacks.delete(el);
      observer.unobserve(el);
    };
  }, [reducedMotion]);

  if (reducedMotion || phase === "visible") {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const delayMs = Math.round(Math.min(Math.max(delay, 0), MAX_DELAY_S) * 1000);
  const style = delayMs > 0 ? ({ "--reveal-delay": `${delayMs}ms` } as CSSProperties) : undefined;

  return (
    <div ref={ref} className={className} data-reveal={phase} style={style}>
      {children}
    </div>
  );
}

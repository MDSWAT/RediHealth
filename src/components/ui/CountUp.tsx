"use client";

import { useEffect, useRef, useState } from "react";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

type CountUpProps = {
  /** The final whole number. The server and reduced motion render it as is. */
  value: number;
  /** BCP 47 locale for digit grouping. */
  locale?: string;
  /** Seconds the count takes once the number scrolls into view. */
  duration?: number;
  className?: string;
};

/**
 * A figure that counts up to its value the first time it is seen, decelerating into the final
 * number. Tabular numerals keep the width steady. Screen readers get the final value only.
 */
export function CountUp({ value, locale, duration = 0.9, className }: CountUpProps) {
  const reducedMotion = useCalmReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const format = (n: number) => n.toLocaleString(locale);

  useEffect(() => {
    const el = ref.current;
    if (reducedMotion || !el || typeof IntersectionObserver === "undefined") {
      setShown(value);
      return;
    }
    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / (duration * 1000), 1);
          // easeOutQuart, the same deceleration as --ease-out-calm.
          setShown(Math.round(value * (1 - Math.pow(1 - t, 4))));
          if (t < 1) frame = window.requestAnimationFrame(tick);
        };
        setShown(0);
        frame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    if (el.getBoundingClientRect().top >= window.innerHeight) observer.observe(el);
    return () => {
      observer.disconnect();
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [value, duration, reducedMotion]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

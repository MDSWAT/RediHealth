"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { HEARTBEAT_POINTS, createHeartbeatAnimation } from "./heartbeat-animation";

const polyline = HEARTBEAT_POINTS.map(([x, y]) => `${x},${y}`).join(" ");

/**
 * The assistant's identity mark: a heartbeat trace.
 *
 * Server render and reduced-motion users get a static SVG of the same trace,
 * so there is no layout shift and no motion for people who opted out. On the
 * client, the Lottie light player is imported lazily and only runs while the
 * mark is on screen.
 */
export function HeartbeatMark({ className }: { className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    let animation: { play: () => void; pause: () => void; destroy: () => void } | undefined;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled) return;
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: false,
        animationData: createHeartbeatAnimation(),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      setAnimated(true);
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) animation?.play();
        else animation?.pause();
      });
      observer.observe(container);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      animation?.destroy();
    };
  }, []);

  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      <span ref={containerRef} className="absolute inset-0" />
      {!animated && (
        <svg viewBox="0 0 120 40" className="block h-full w-full" fill="none">
          <polyline
            points={polyline}
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

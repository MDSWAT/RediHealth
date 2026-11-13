"use client";

import { useEffect } from "react";
import { useCalmReducedMotion } from "@/lib/motion/tokens";

/**
 * Publishes the pointer position to whichever `.surface-spotlight` it is over, as `--spot-x` and
 * `--spot-y` (px from the surface's top-left). The light itself is CSS (globals.css). One
 * delegated listener for the whole site, written once per frame; nothing runs on touch devices
 * or under reduced motion. Renders nothing.
 */
export function PointerSpotlight() {
  const reducedMotion = useCalmReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let target: HTMLElement | null = null;
    let x = 0;
    let y = 0;

    const flush = () => {
      frame = 0;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--spot-x", `${Math.round(x - rect.left)}px`);
      target.style.setProperty("--spot-y", `${Math.round(y - rect.top)}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const origin = event.target instanceof Element ? event.target : null;
      target = origin?.closest<HTMLElement>(".surface-spotlight") ?? null;
      if (!target) return;
      x = event.clientX;
      y = event.clientY;
      if (frame === 0) frame = window.requestAnimationFrame(flush);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return null;
}

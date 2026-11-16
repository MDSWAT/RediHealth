"use client";

import { useEffect, useRef } from "react";
import { useReadingGuide } from "@/lib/comfort-preferences";

/**
 * Reading guide (Accessibility menu): a clear band about two lines tall follows the mouse or finger,
 * and the page above and below it is dimmed, so the eye keeps its place in long text.
 * It never takes clicks or taps, and it sits under dialogs and sheets (z-50) so they stay readable.
 */
export function ReadingGuide() {
  const [enabled] = useReadingGuide();
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const band = bandRef.current;
    if (!band) return;

    let y = window.innerHeight * 0.4;
    let frame = 0;
    const place = () => {
      frame = 0;
      band.style.transform = `translate3d(0, ${Math.round(y - band.offsetHeight / 2)}px, 0)`;
    };
    const moveTo = (clientY: number) => {
      y = clientY;
      if (!frame) frame = window.requestAnimationFrame(place);
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "touch") moveTo(event.clientY);
    };
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) moveTo(touch.clientY);
    };

    place();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] overflow-hidden print:hidden">
      <div
        ref={bandRef}
        data-reading-guide-band=""
        className="absolute inset-x-0 top-0 h-[3.25em] border-y-2 border-sapphire text-body shadow-[0_0_0_100vmax_rgb(2_6_23/0.42)] will-change-transform dark:border-sapphire-border"
      />
    </div>
  );
}

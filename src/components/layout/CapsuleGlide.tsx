"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/cn";

/**
 * One highlight plate for a whole capsule. Instead of each segment lighting up on its own, a
 * single plate glides to whichever segment (`data-capsule-item`) the pointer or keyboard is on,
 * so the bar reads as one control. Mouse and keyboard only: touch gets the press feedback the
 * segments already have. The plate's motion lives in `.capsule-plate` (globals.css), which holds
 * still under reduced motion and in-app Calm motion.
 */
export function useCapsuleGlide<T extends HTMLElement>() {
  const trackRef = useRef<T>(null);
  const plateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const plate = plateRef.current;
    if (!track || !plate) return;

    let shown = false;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const moveTo = (item: HTMLElement) => {
      const trackBox = track.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      const x = box.left - trackBox.left - track.clientLeft + track.scrollLeft;
      const y = box.top - trackBox.top - track.clientTop + track.scrollTop;
      if (!shown) {
        // Appear in place: only a plate that is already visible travels.
        plate.style.transitionProperty = "opacity";
      }
      plate.style.width = `${box.width}px`;
      plate.style.height = `${box.height}px`;
      plate.style.transform = `translate(${x}px, ${y}px)`;
      if (!shown) {
        void plate.offsetWidth;
        plate.style.transitionProperty = "";
        shown = true;
      }
      plate.style.opacity = "1";
    };

    const hide = () => {
      shown = false;
      plate.style.opacity = "0";
    };

    const itemFor = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const item = target.closest<HTMLElement>("[data-capsule-item]");
      return item && track.contains(item) ? item : null;
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches) return;
      const item = itemFor(event.target);
      if (item) moveTo(item);
      else hide();
    };
    const onFocusIn = (event: FocusEvent) => {
      const item = itemFor(event.target);
      if (item?.matches(":focus-visible")) moveTo(item);
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!itemFor(event.relatedTarget)) hide();
    };

    track.addEventListener("pointerover", onPointerOver);
    track.addEventListener("pointerleave", hide);
    track.addEventListener("focusin", onFocusIn);
    track.addEventListener("focusout", onFocusOut);
    return () => {
      track.removeEventListener("pointerover", onPointerOver);
      track.removeEventListener("pointerleave", hide);
      track.removeEventListener("focusin", onFocusIn);
      track.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return { trackRef, plateRef };
}

export function CapsuleGlidePlate({
  plateRef,
  onHero = false,
}: {
  plateRef: RefObject<HTMLSpanElement | null>;
  onHero?: boolean;
}) {
  return (
    <span
      ref={plateRef}
      aria-hidden="true"
      className={cn(
        "capsule-plate z-0",
        onHero
          ? "bg-white/14 ring-1 ring-inset ring-white/12"
          : "bg-white/90 shadow-[0_1px_2px_rgba(12,18,32,0.06)] ring-1 ring-inset ring-ink-950/[0.06] dark:bg-white/12 dark:ring-white/12 dark:shadow-none",
      )}
    />
  );
}

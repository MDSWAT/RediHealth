"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { COMFORT_CHANGE_EVENT } from "@/lib/comfort-preferences";
import styles from "./StackedSections.module.css";

/** One sheet of the stack. Server Components pass through it as children. Up to eight per stack. */
export function StackLayer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(styles.layer, className)} data-stack-layer="">
      {children}
    </div>
  );
}

/**
 * Landing sections as stacked sheets. Each `StackLayer` scrolls normally until its end reaches
 * the bottom of the screen, then holds there while the next one slides up over it with rounded
 * corners. The sheet underneath eases back a little (smaller, dimmer) as it is covered.
 * Between the two there is a hold: a stretch of scroll where the arrived sheet just stays put.
 *
 * Nothing here runs while the page scrolls, so the effect cannot fall behind the scroll:
 * - holding and sliding are `position: sticky`, which the browser does off the main thread;
 * - the easing back is a CSS scroll-driven animation (StackedSections.module.css). Browsers
 *   without it keep the stacking and skip the easing back.
 * This component only measures: where each layer holds (`--stack-top`, on resize), and which
 * layers are wholly covered (`data-buried`), so their looping animations can rest.
 * Off under reduced motion and in print: the sections are then a plain page.
 */
export function StackedSections({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const layers = Array.from(host.querySelectorAll<HTMLElement>(":scope > [data-stack-layer]"));

    const shouldDisableStacking = () =>
      window.innerWidth < 1024 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.hasAttribute("data-calm-motion") ||
      document.documentElement.hasAttribute("data-text-scale");

    const clearStackProps = () => {
      for (const layer of layers) {
        layer.style.removeProperty("--stack-top");
        layer.removeAttribute("data-buried");
      }
    };

    let activeCleanup: (() => void) | null = null;

    const enableStacking = () => {
      // A layer taller than the visible area holds by its bottom edge, so all of it is read first.
      let rafId = 0;
      const runMeasure = () => {
        rafId = 0;
        if (shouldDisableStacking()) {
          clearStackProps();
          return;
        }
        // Batch all DOM measurements before writing inline CSS variables to avoid layout thrashing.
        const screen = window.innerHeight;
        const slim = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-slim-h"));
        const header = Number.isFinite(slim)
          ? slim
          : (document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().height ?? 0);
        const layerHeights = layers.map((layer) => layer.offsetHeight);

        layers.forEach((layer, index) => {
          const fromBottom = screen - layerHeights[index];
          layer.style.setProperty("--stack-top", `${index === 0 ? fromBottom : Math.min(header, fromBottom)}px`);
        });
      };

      const scheduleMeasure = () => {
        if (rafId !== 0) return;
        rafId = window.requestAnimationFrame(runMeasure);
      };

      const resize = new ResizeObserver(scheduleMeasure);
      for (const layer of layers) resize.observe(layer);
      window.addEventListener("resize", scheduleMeasure);
      runMeasure();

      const atTop = new Set<number>();
      const cover = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = layers.indexOf(entry.target as HTMLElement);
            if (entry.isIntersecting) atTop.add(index);
            else atTop.delete(index);
          }
          const top = Math.max(-1, ...atTop);
          layers.forEach((layer, index) => layer.toggleAttribute("data-buried", index < top));
        },
        { rootMargin: "0px 0px -100% 0px" },
      );
      for (const layer of layers) cover.observe(layer);

      return () => {
        if (rafId !== 0) window.cancelAnimationFrame(rafId);
        resize.disconnect();
        cover.disconnect();
        window.removeEventListener("resize", scheduleMeasure);
        clearStackProps();
      };
    };

    const syncMode = () => {
      if (shouldDisableStacking()) {
        activeCleanup?.();
        activeCleanup = null;
        clearStackProps();
      } else if (!activeCleanup) {
        activeCleanup = enableStacking();
      }
    };

    syncMode();
    window.addEventListener("resize", syncMode);
    window.addEventListener(COMFORT_CHANGE_EVENT, syncMode);

    return () => {
      window.removeEventListener("resize", syncMode);
      window.removeEventListener(COMFORT_CHANGE_EVENT, syncMode);
      activeCleanup?.();
      clearStackProps();
    };
  }, []);

  return (
    <div ref={ref} className={styles.stack}>
      {children}
    </div>
  );
}

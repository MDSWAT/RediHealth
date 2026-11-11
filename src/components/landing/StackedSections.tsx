"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
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
    if (!host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const layers = Array.from(host.querySelectorAll<HTMLElement>(":scope > [data-stack-layer]"));

    // A layer taller than the visible area holds by its bottom edge, so all of it is read first. The
    // first layer always holds by its bottom edge: it starts below the site header, and holding
    // it at the top would slide it up under the header by that much.
    // A layer that fits holds just below the sticky site header, so none of it sits underneath.
    const measure = () => {
      const screen = window.innerHeight;
      // Sheets hold while the page is scrolled, when the bar is at its slim height.
      const slim = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--site-header-slim-h"));
      const header = Number.isFinite(slim)
        ? slim
        : (document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect().height ?? 0);
      layers.forEach((layer, index) => {
        const fromBottom = screen - layer.offsetHeight;
        layer.style.setProperty("--stack-top", `${index === 0 ? fromBottom : Math.min(header, fromBottom)}px`);
      });
    };
    const resize = new ResizeObserver(measure);
    for (const layer of layers) resize.observe(layer);
    window.addEventListener("resize", measure);
    measure();

    // A layer that reaches the top edge of the screen has covered every layer before it.
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
      resize.disconnect();
      cover.disconnect();
      window.removeEventListener("resize", measure);
      for (const layer of layers) {
        layer.style.removeProperty("--stack-top");
        layer.removeAttribute("data-buried");
      }
    };
  }, []);

  return (
    <div ref={ref} className={styles.stack}>
      {children}
    </div>
  );
}

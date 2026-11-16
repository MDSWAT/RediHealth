"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { HealthArticleTocProps } from "./HealthArticleShell";

export function HealthArticleTocRail({
  title,
  ariaLabel,
  items,
  className,
}: HealthArticleTocProps) {
  const [activeHref, setActiveHref] = useState<string>(() => items[0]?.href ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const sectionEntries = items
      .map((item) => {
        const id = item.href.startsWith("#") ? item.href.slice(1) : "";
        const element = id ? document.getElementById(id) : null;
        return element ? { href: item.href, element } : null;
      })
      .filter((entry): entry is { href: string; element: HTMLElement } => entry !== null);

    if (sectionEntries.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const visibleHrefs = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          const href = `#${id}`;
          if (entry.isIntersecting) {
            visibleHrefs.add(href);
          } else {
            visibleHrefs.delete(href);
          }
        }

        const firstVisible = sectionEntries.find((item) => visibleHrefs.has(item.href));
        if (firstVisible) {
          setActiveHref(firstVisible.href);
        }
      },
      {
        rootMargin: "-96px 0px -62% 0px",
        threshold: 0,
      },
    );

    for (const { element } of sectionEntries) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      aria-label={ariaLabel}
      data-health-toc-rail=""
      className={cn(
        "hidden lg:block lg:sticky lg:top-[calc(var(--chrome-h,4rem)+2rem)] print:hidden",
        className,
      )}
    >
      <nav
        aria-label={ariaLabel}
        className="rounded-(--radius-surface) border border-border/85 bg-card/90 p-5 shadow-(--shadow-card-rest) dark:border-white/10 dark:bg-ink-900/80"
      >
        <h2 className="border-b border-border/80 pb-3 text-[15px] font-semibold tracking-tight text-foreground dark:border-white/10 dark:text-paper">
          {title}
        </h2>
        <ol className="mt-3 space-y-1 border-l border-border/80 pl-3.5 dark:border-white/12">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActiveHref(item.href)}
                  className={cn(
                    "relative flex min-h-11 items-center rounded-(--radius-control) px-2.5 py-2 text-[14.5px] leading-snug transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-paper",
                    isActive
                      ? "bg-sapphire/[0.06] font-medium text-sapphire before:absolute before:-left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-sapphire dark:bg-sapphire-border/[0.12] dark:text-sapphire-border dark:before:bg-sapphire-border"
                      : "font-normal text-muted-foreground hover:bg-muted/65 hover:text-foreground dark:text-mist dark:hover:bg-white/[0.06] dark:hover:text-paper",
                  )}
                >
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

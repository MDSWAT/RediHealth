"use client";

import { useCallback, useContext, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { prefersCalmOrReducedMotion } from "@/lib/comfort-preferences";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

export interface MobileGuideJumpSection {
  id: string;
  label: string;
}

export interface MobileGuideJumpBarProps {
  sections: MobileGuideJumpSection[];
  ariaLabel: string;
  className?: string;
}

/**
 * Floating section navigation for long health reads (articles and topic guides), on every width.
 *
 * A single control floats at the bottom centre, where a thumb already rests: it names the section
 * being read and its place in the page ("3 / 6"). Opening it lifts a list of every section just
 * above it; choosing one jumps there and closes the list. It appears once the reader reaches the
 * first section, steps aside after the last one, and rises above the audio player when that is open.
 */
export function MobileGuideJumpBar({
  sections,
  ariaLabel,
  className,
}: MobileGuideJumpBarProps) {
  // The app always provides the language; server-rendered page tests may not, so fall back.
  const closeLabel = (useContext(LanguageContext)?.t ?? translations.en).newsRibbon.closeModal;
  const panelId = useId();

  const [activeId, setActiveId] = useState<string>(() => sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const isClickLockedRef = useRef(false);
  const clickLockTimerRef = useRef<number | null>(null);

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  );
  const activeSection = sections[activeIndex];

  const setLinkRef = useCallback((id: string, element: HTMLAnchorElement | null) => {
    if (element) linkRefs.current.set(id, element);
    else linkRefs.current.delete(id);
  }, []);

  // Which section is being read.
  useEffect(() => {
    if (sections.length === 0) return;

    const unlockClickGuard = () => {
      isClickLockedRef.current = false;
      if (clickLockTimerRef.current !== null) {
        window.clearTimeout(clickLockTimerRef.current);
        clickLockTimerRef.current = null;
      }
    };
    const syncFromHash = () => {
      const hashId = window.location.hash.replace(/^#/, "");
      if (hashId && sections.some((section) => section.id === hashId)) setActiveId(hashId);
    };

    window.addEventListener("wheel", unlockClickGuard, { passive: true });
    window.addEventListener("touchmove", unlockClickGuard, { passive: true });
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      unlockClickGuard();
      window.removeEventListener("wheel", unlockClickGuard);
      window.removeEventListener("touchmove", unlockClickGuard);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [sections]);

  // On each scroll frame: which section is being read, and whether the reader is inside the
  // sections at all (the control shows only then).
  useEffect(() => {
    if (sections.length === 0) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const targets = sections
        .map((section) => document.getElementById(section.id))
        .filter((element): element is HTMLElement => element !== null);
      const first = targets[0];
      if (!first) return;
      const viewport = window.innerHeight;

      // A heading becomes current once it rises into the upper half of the screen and stays
      // current until the next one does, so a long section keeps its name while it is read.
      if (!isClickLockedRef.current) {
        let current = first.id;
        for (const target of targets) {
          if (target.getBoundingClientRect().top <= viewport * 0.45) current = target.id;
        }
        setActiveId(current);
      }

      const column = first.closest("[data-health-article-column]") ?? first.parentElement;
      const started = first.getBoundingClientRect().top < viewport * 0.85;
      const finished = column ? column.getBoundingClientRect().bottom < viewport * 0.5 : false;
      setInView(started && !finished);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Open: focus the current section in the list. Esc closes and returns focus to the control.
  useEffect(() => {
    if (!open) return;
    const current = linkRefs.current.get(activeSection?.id ?? "");
    current?.focus({ preventScroll: true });
    current?.scrollIntoView({ block: "nearest" });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // Only on opening; moving focus again when the reading position changes would steal it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, close]);

  const handleSectionSelect = useCallback((event: MouseEvent, id: string) => {
    // Closing the list in the same click cancels the browser's own smooth hash scroll, so the
    // jump is made here once the list has closed; the heading's scroll-margin keeps it clear of
    // the header, and focus moves to it so keyboard and screen-reader users land there too.
    const target = document.getElementById(id);
    if (target) {
      event.preventDefault();
      window.history.pushState(null, "", `#${id}`);
      window.setTimeout(() => {
        // Focus first: moving focus during a smooth scroll cancels the scroll in Chromium.
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.scrollIntoView({
          behavior: prefersCalmOrReducedMotion() ? "auto" : "smooth",
          block: "start",
        });
      }, 0);
    }
    setActiveId(id);
    setOpen(false);
    isClickLockedRef.current = true;
    if (clickLockTimerRef.current !== null) window.clearTimeout(clickLockTimerRef.current);
    clickLockTimerRef.current = window.setTimeout(
      () => {
        isClickLockedRef.current = false;
        clickLockTimerRef.current = null;
      },
      prefersCalmOrReducedMotion() ? 150 : 750,
    );
  }, []);

  if (sections.length === 0) return null;

  const shown = inView || open;

  return (
    <>
      <div
        aria-hidden="true"
        data-open={open}
        onClick={() => close(false)}
        className="guide-contents-backdrop fixed inset-0 z-30 bg-ink-950/25 sm:bg-transparent print:hidden"
      />
      <div
        data-mobile-guide-jump-bar=""
        data-shown={shown}
        inert={!shown}
        className={cn(
          "guide-contents-float fixed inset-x-4 z-30 mx-auto flex max-w-md flex-col gap-2 sm:inset-x-0 sm:w-[26rem] sm:max-w-[calc(100vw-2rem)] print:hidden",
          className,
        )}
      >
        <nav
          id={panelId}
          aria-label={ariaLabel}
          hidden={!open}
          className="guide-contents-panel overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border py-1 pl-5 pr-1.5 dark:border-white/10">
            <p className="text-body font-semibold">{ariaLabel}</p>
            <button
              type="button"
              onClick={() => close(true)}
              aria-label={closeLabel}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CloseIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <ol className="max-h-[min(60dvh,26rem)] overflow-y-auto overscroll-contain py-2">
            {sections.map((section) => {
              const isActive = section.id === activeSection?.id;
              return (
                <li key={section.id}>
                  <a
                    ref={(element) => setLinkRef(section.id, element)}
                    href={`#${section.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => handleSectionSelect(event, section.id)}
                    className={cn(
                      "relative flex min-h-11 items-center px-5 py-2.5 text-body leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      isActive
                        ? "font-semibold text-foreground before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-sm before:bg-sapphire dark:before:bg-sapphire-border"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${ariaLabel}: ${activeSection?.label ?? ""}`}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-13 w-full items-center gap-3 whitespace-nowrap rounded-xl border border-sapphire/25 bg-card py-2 pl-4 pr-3 text-left text-foreground shadow-(--shadow-card-hover) hover:border-sapphire/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-white/15 dark:bg-ink-900"
        >
          <span className="shrink-0 text-body tabular-nums text-muted-foreground">
            {activeIndex + 1} / {sections.length}
          </span>
          <span className="min-w-0 flex-1 truncate text-body font-semibold">
            {activeSection?.label}
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className={cn(
              "h-5 w-5 shrink-0 text-sapphire transition-transform duration-[var(--dur-fast)] motion-reduce:transition-none dark:text-sapphire-border",
              open ? "rotate-0" : "rotate-180",
            )}
          />
        </button>
      </div>
    </>
  );
}

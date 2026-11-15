"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { prefersCalmOrReducedMotion } from "@/lib/comfort-preferences";

export interface MobileGuideJumpSection {
  id: string;
  label: string;
}

export interface MobileGuideJumpBarProps {
  sections: MobileGuideJumpSection[];
  ariaLabel: string;
  className?: string;
}

const JUMP_LINK_BASE_CLASS =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg border px-3.5 text-sm leading-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none";
const JUMP_LINK_ACTIVE_CLASS = "border-sapphire bg-sapphire font-semibold text-white";
const JUMP_LINK_INACTIVE_CLASS =
  "border-border bg-card font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground";

/**
 * Sticky mobile chapter navigation (< lg) driven by IntersectionObserver.
 * Keeps single-line horizontal jump controls synced with the visible guide section.
 */
export function MobileGuideJumpBar({
  sections,
  ariaLabel,
  className,
}: MobileGuideJumpBarProps) {
  const [activeId, setActiveId] = useState<string>(() => sections[0]?.id ?? "");
  const trackRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const isClickLockedRef = useRef<boolean>(false);
  const clickLockTimerRef = useRef<number | null>(null);

  const effectiveActiveId = sections.some((section) => section.id === activeId)
    ? activeId
    : (sections[0]?.id ?? "");

  const setLinkRef = useCallback(
    (id: string, element: HTMLAnchorElement | null) => {
      if (element) {
        linkRefs.current.set(id, element);
      } else {
        linkRefs.current.delete(id);
      }
    },
    [],
  );

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
      if (hashId && sections.some((section) => section.id === hashId)) {
        setActiveId(hashId);
      }
    };

    window.addEventListener("wheel", unlockClickGuard, { passive: true });
    window.addEventListener("touchmove", unlockClickGuard, { passive: true });
    window.addEventListener("hashchange", syncFromHash);

    if (typeof IntersectionObserver === "undefined") {
      return () => {
        window.removeEventListener("wheel", unlockClickGuard);
        window.removeEventListener("touchmove", unlockClickGuard);
        window.removeEventListener("hashchange", syncFromHash);
      };
    }

    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return () => {
        window.removeEventListener("wheel", unlockClickGuard);
        window.removeEventListener("touchmove", unlockClickGuard);
        window.removeEventListener("hashchange", syncFromHash);
      };
    }

    const visibleIds = visibleIdsRef.current;
    visibleIds.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }

        if (isClickLockedRef.current) return;

        const firstVisible = sections.find((section) =>
          visibleIds.has(section.id),
        );
        if (firstVisible) {
          setActiveId(firstVisible.id);
        } else if (window.scrollY < 160 && sections[0]) {
          setActiveId(sections[0].id);
        }
      },
      {
        rootMargin: "-140px 0px -55% 0px",
        threshold: 0,
      },
    );

    for (const target of targets) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
      visibleIds.clear();
      unlockClickGuard();
      window.removeEventListener("wheel", unlockClickGuard);
      window.removeEventListener("touchmove", unlockClickGuard);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [sections]);

  useEffect(() => {
    if (!effectiveActiveId) return;
    const track = trackRef.current;
    const activeLink = linkRefs.current.get(effectiveActiveId);
    if (!track || !activeLink || typeof track.scrollTo !== "function") return;
    if (track.scrollWidth <= track.clientWidth) return;

    const targetLeft =
      activeLink.offsetLeft - (track.clientWidth - activeLink.offsetWidth) / 2;
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const clampedLeft = Math.max(0, Math.min(targetLeft, maxScrollLeft));

    track.scrollTo({
      left: clampedLeft,
      behavior: prefersCalmOrReducedMotion() ? "auto" : "smooth",
    });
  }, [effectiveActiveId]);

  const handleSectionSelect = useCallback((id: string) => {
    setActiveId(id);
    isClickLockedRef.current = true;
    if (clickLockTimerRef.current !== null) {
      window.clearTimeout(clickLockTimerRef.current);
    }
    const lockDurationMs = prefersCalmOrReducedMotion() ? 150 : 750;
    clickLockTimerRef.current = window.setTimeout(() => {
      isClickLockedRef.current = false;
      clickLockTimerRef.current = null;
    }, lockDurationMs);
  }, []);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      data-mobile-guide-jump-bar=""
      className={cn(
        "sticky top-(--chrome-h,0px) z-20 border-b border-border bg-background/95 backdrop-blur-sm lg:hidden print:hidden",
        className,
      )}
    >
      <Container>
        <div
          ref={trackRef}
          className="no-scrollbar flex items-center gap-2 overflow-x-auto py-2"
        >
          {sections.map((section) => {
            const isActive = section.id === effectiveActiveId;
            return (
              <a
                key={section.id}
                ref={(element) => setLinkRef(section.id, element)}
                href={`#${section.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => handleSectionSelect(section.id)}
                className={cn(
                  JUMP_LINK_BASE_CLASS,
                  isActive ? JUMP_LINK_ACTIVE_CLASS : JUMP_LINK_INACTIVE_CLASS,
                )}
              >
                {section.label}
              </a>
            );
          })}
        </div>
      </Container>
    </nav>
  );
}

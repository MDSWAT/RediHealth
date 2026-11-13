"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function findVerticalScrollableAncestor(target: EventTarget | null, boundary: HTMLElement): HTMLElement | null {
  let node = target instanceof HTMLElement ? target : null;
  while (node && boundary.contains(node)) {
    if (node.scrollHeight > node.clientHeight + 1) {
      const { overflowY } = window.getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll") return node;
    }
    if (node === boundary) break;
    node = node.parentElement;
  }
  return null;
}

function findHorizontalScrollableAncestor(target: EventTarget | null, boundary: HTMLElement): HTMLElement | null {
  let node = target instanceof HTMLElement ? target : null;
  while (node && boundary.contains(node)) {
    if (node.scrollWidth > node.clientWidth + 1) {
      const { overflowX } = window.getComputedStyle(node);
      if (overflowX === "auto" || overflowX === "scroll") return node;
    }
    if (node === boundary) break;
    node = node.parentElement;
  }
  return null;
}

function findOverflowYScroller(target: EventTarget | null, boundary: HTMLElement): HTMLElement | null {
  let node = target instanceof HTMLElement ? target : null;
  while (node && boundary.contains(node)) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    if (node === boundary) break;
    node = node.parentElement;
  }
  return null;
}

/**
 * Keeps an expanded accordion/disclosure item inside a modal's scrollable region visible,
 * tracking CSS grid expand transitions via ResizeObserver without pushing the trigger off the top.
 */
export function scrollExpandedIntoModalView(trigger: HTMLElement, boundary: HTMLElement): () => void {
  const scroller =
    findOverflowYScroller(trigger, boundary) ??
    boundary.querySelector<HTMLElement>("[data-modal-scroller]");
  if (!scroller) return () => {};

  const panelId = trigger.getAttribute("aria-controls");
  const controlledPanel = panelId ? document.getElementById(panelId) : null;
  const observedEl = controlledPanel ?? trigger.closest("details") ?? trigger.parentElement ?? trigger;

  let cancelled = false;
  let hasSmoothScrolled = false;
  let rafId = 0;
  let midTimer = 0;
  let endTimer = 0;
  let observer: ResizeObserver | null = null;

  const prefersReduced =
    document.documentElement.hasAttribute("data-calm-motion") ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const adjustScroll = (allowSmooth: boolean) => {
    if (cancelled) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = (controlledPanel ?? observedEl).getBoundingClientRect();
    const bottomEdge = Math.max(triggerRect.bottom, contentRect.bottom);
    const bottomMargin = 20;
    const topMargin = 12;

    if (bottomEdge <= scrollerRect.bottom - bottomMargin) return;

    const needed = Math.ceil(bottomEdge - (scrollerRect.bottom - bottomMargin));
    const maxAllowed = Math.max(0, Math.floor(triggerRect.top - (scrollerRect.top + topMargin)));
    const delta = Math.min(needed, maxAllowed);
    if (delta <= 0) return;

    const isAnimatedGrid = controlledPanel?.classList.contains("grid") ?? false;
    if (allowSmooth && !isAnimatedGrid && !hasSmoothScrolled && !prefersReduced && typeof scroller.scrollBy === "function") {
      hasSmoothScrolled = true;
      scroller.scrollBy({ top: delta, behavior: "smooth" });
      return;
    }

    scroller.scrollTop += delta;
  };

  const onUserScroll = () => {
    cancelled = true;
    cleanup();
  };

  const cleanup = () => {
    window.cancelAnimationFrame(rafId);
    window.clearTimeout(midTimer);
    window.clearTimeout(endTimer);
    observer?.disconnect();
    observer = null;
    scroller.removeEventListener("wheel", onUserScroll);
    scroller.removeEventListener("touchmove", onUserScroll);
  };

  scroller.addEventListener("wheel", onUserScroll, { passive: true });
  scroller.addEventListener("touchmove", onUserScroll, { passive: true });

  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(() => adjustScroll(false));
    observer.observe(observedEl);
  }

  rafId = window.requestAnimationFrame(() => adjustScroll(true));
  midTimer = window.setTimeout(() => adjustScroll(false), 180);
  endTimer = window.setTimeout(() => {
    adjustScroll(false);
    cleanup();
  }, 380);

  return cleanup;
}

/**
 * Delegates disclosure clicks and header wheel forwarding inside modal panels so expanding bottom
 * accordions automatically reveals their content and wheel gestures over sticky headers scroll smoothly.
 */
export function useModalAutoScroll(open: boolean, panelRef: RefObject<HTMLElement | null>) {
  const activeScrollCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!open) {
      activeScrollCleanupRef.current?.();
      activeScrollCleanupRef.current = null;
      return;
    }

    const panel = panelRef.current;
    if (!panel) return;

    let pendingRaf = 0;

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target) return;

      const expandedTrigger = target.closest<HTMLElement>("[aria-expanded]");
      const summaryTrigger = target.closest<HTMLElement>("summary");
      const trigger = expandedTrigger ?? summaryTrigger;
      if (!trigger || !panel.contains(trigger)) return;

      window.cancelAnimationFrame(pendingRaf);
      pendingRaf = window.requestAnimationFrame(() => {
        const isNowOpen = expandedTrigger
          ? expandedTrigger.getAttribute("aria-expanded") === "true"
          : Boolean(summaryTrigger?.closest("details")?.open);
        if (!isNowOpen) return;

        activeScrollCleanupRef.current?.();
        activeScrollCleanupRef.current = scrollExpandedIntoModalView(trigger, panel);
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0 || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      if (findVerticalScrollableAncestor(event.target, panel)) return;
      const scroller = panel.querySelector<HTMLElement>("[data-modal-scroller]");
      if (!scroller || scroller.scrollHeight <= scroller.clientHeight + 1) return;
      scroller.scrollTop += event.deltaY;
    };

    panel.addEventListener("click", handleClick);
    panel.addEventListener("wheel", handleWheel, { passive: true });
    return () => {
      window.cancelAnimationFrame(pendingRaf);
      activeScrollCleanupRef.current?.();
      activeScrollCleanupRef.current = null;
      panel.removeEventListener("click", handleClick);
      panel.removeEventListener("wheel", handleWheel);
    };
  }, [open, panelRef]);
}

/**
 * Modal behaviour shared by the news sheets: focus moves in when the sheet opens (without popping
 * the mobile soft keyboard on touch screens), Tab stays inside it, Escape closes it, the page
 * behind does not scroll (including iOS Safari rubber-banding), the dialog tracks `visualViewport`
 * above the mobile keyboard, and focus returns to where it was on close.
 */
function shouldRestoreDialogFocus(ref?: RefObject<boolean>): boolean {
  return ref ? ref.current : true;
}

export function useSheetDialog(
  open: boolean,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
  shouldRestoreFocusRef?: RefObject<boolean>,
) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useModalAutoScroll(open, panelRef);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const coarsePointer =
      typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
    const focusTarget = coarsePointer ? panelRef.current : (initialFocusRef?.current ?? panelRef.current);
    focusTarget?.focus({ preventScroll: true });

    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlOverflow = htmlEl.style.overflow;
    const prevHtmlOverscroll = htmlEl.style.overscrollBehavior;
    const prevBodyOverflow = bodyEl.style.overflow;
    const prevBodyOverscroll = bodyEl.style.overscrollBehavior;

    htmlEl.style.overflow = "hidden";
    htmlEl.style.overscrollBehavior = "none";
    bodyEl.style.overflow = "hidden";
    bodyEl.style.overscrollBehavior = "none";

    const dialogHost = panelRef.current?.parentElement ?? null;
    const vv = window.visualViewport;
    const syncViewport = () => {
      if (!dialogHost || !vv) return;
      if (vv.scale > 1.01) {
        dialogHost.style.removeProperty("--sheet-vv-height");
        dialogHost.style.removeProperty("--sheet-vv-top");
        return;
      }
      dialogHost.style.setProperty("--sheet-vv-height", `${Math.round(vv.height)}px`);
      dialogHost.style.setProperty("--sheet-vv-top", `${Math.round(vv.offsetTop)}px`);
    };
    syncViewport();
    vv?.addEventListener("resize", syncViewport);
    vv?.addEventListener("scroll", syncViewport);

    let lastTouchX = 0;
    let lastTouchY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        lastTouchX = event.touches[0].clientX;
        lastTouchY = event.touches[0].clientY;
      }
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const stepX = currentX - lastTouchX;
      const stepY = currentY - lastTouchY;
      lastTouchX = currentX;
      lastTouchY = currentY;

      const panel = panelRef.current;
      if (!panel || !panel.contains(event.target as Node | null)) {
        if (event.cancelable) event.preventDefault();
        return;
      }

      if (Math.abs(stepX) > Math.abs(stepY) && findHorizontalScrollableAncestor(event.target, panel)) {
        return;
      }

      const scroller = findVerticalScrollableAncestor(event.target, panel);
      if (!scroller) {
        if (event.cancelable) event.preventDefault();
        return;
      }

      const atTop = scroller.scrollTop <= 0 && stepY > 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1 && stepY < 0;
      if ((atTop || atBottom) && event.cancelable) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active) && active !== panelRef.current;
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      vv?.removeEventListener("resize", syncViewport);
      vv?.removeEventListener("scroll", syncViewport);
      dialogHost?.style.removeProperty("--sheet-vv-height");
      dialogHost?.style.removeProperty("--sheet-vv-top");
      htmlEl.style.overflow = prevHtmlOverflow;
      htmlEl.style.overscrollBehavior = prevHtmlOverscroll;
      bodyEl.style.overflow = prevBodyOverflow;
      bodyEl.style.overscrollBehavior = prevBodyOverscroll;
      if (shouldRestoreDialogFocus(shouldRestoreFocusRef) && previouslyFocused && previouslyFocused !== document.body) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [open, panelRef, initialFocusRef, shouldRestoreFocusRef]);
}

import { cn } from "@/lib/cn";

/**
 * The header's utility capsule: one rounded bar that holds search, text size, language, account,
 * install, the "Start here" action and (below xl) the menu button. Every control in it is a
 * segment of the same bar, so none of them carries a box of its own.
 *
 * `onHero` is true while the header floats over the dark landing hero (glass on ink); otherwise
 * the capsule is a solid card on the paper header.
 *
 * Colour: the bar has no fill of its own, so it is as transparent as the header it sits in. Its
 * only mark is a half-pixel hairline: white while it floats over the dark hero on load, a
 * neutral grey once the header turns solid. Nothing in the bar is red; red stays reserved for 112.
 */
const OUTLINE =
  "border-ink-950/12 bg-muted/55 shadow-[0_1px_2px_rgba(12,18,32,0.04)] backdrop-blur-md dark:border-white/15 dark:bg-white/[0.06] dark:shadow-[0_1px_2px_rgba(0,0,0,0.28)]";

export function capsuleSurface(onHero: boolean) {
  return cn(
    "relative flex items-center gap-0.5 rounded-full border p-0.5 transition-[background-color,border-color,box-shadow] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none md:p-1",
    onHero
      ? "border-white/18 bg-ink-950/45 shadow-[0_10px_28px_-14px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md"
      : OUTLINE,
  );
}

/**
 * One segment of the capsule. `active` marks an open menu, a chosen setting or the current page.
 * Hover has no fill here: the shared plate from CapsuleGlide glides to the segment instead.
 */
export function capsuleItem(onHero: boolean, active = false) {
  return cn(
    "relative z-10 inline-flex h-11 min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
    onHero
      ? "press-on-dark hover:text-white focus-visible:ring-paper/75"
      : "press-row hover:text-foreground focus-visible:ring-ring dark:hover:text-paper dark:focus-visible:ring-paper",
    onHero
      ? active
        ? "bg-white/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
        : "text-paper/90"
      : active
        ? "bg-white text-foreground shadow-[0_1px_2px_rgba(12,18,32,0.08)] dark:bg-white/14 dark:text-paper dark:shadow-none"
        : "text-foreground/80 dark:text-paper/85",
  );
}

/** Hairline between groups of segments. */
export function capsuleDivider(onHero: boolean) {
  return cn("mx-0.5 h-4 w-px shrink-0", onHero ? "bg-white/16" : "bg-ink-950/12 dark:bg-white/14");
}

/** The filled action that closes the capsule. */
export function capsuleAction(onHero: boolean) {
  return cn(
    "relative z-10 inline-flex items-center rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-[background-color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
    onHero
      ? "bg-paper text-foreground hover:bg-white hover:shadow-[0_4px_14px_-4px_rgba(0,0,0,0.45)]"
      : "bg-ink-950 text-white hover:bg-ink-900 dark:bg-paper dark:text-ink-950 dark:hover:bg-white",
  );
}

/** Shared surface of every panel that drops from the capsule (text size, language, start here). */
export const CAPSULE_PANEL =
  "rounded-(--radius-surface) border border-border bg-card text-foreground shadow-(--shadow-card-hover) dark:border-white/10 dark:bg-ink-900 dark:text-paper";

/** Small heading that names a capsule panel or a group inside it. */
export const CAPSULE_PANEL_LABEL = "text-[13px] font-medium text-muted-foreground dark:text-mist";

/**
 * The same capsule used inside a page, as the menu that switches between sibling tools. It shares
 * the header bar's shape and grey hairline so it reads as a menu, not as a row of text links.
 */
export const CAPSULE_TABS = cn(
  "relative inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border-[0.5px] p-1 scrollbar-none",
  OUTLINE,
);

/** One destination in an in-page capsule menu; the current one sits on a raised plate. */
export function capsuleTab(active: boolean) {
  return cn(
    "press-row relative inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-sm leading-tight transition-[background-color,color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 dark:focus-visible:ring-paper",
    active
      ? "bg-ink-950/[0.07] font-semibold text-foreground dark:bg-white/16 dark:text-paper"
      : "font-medium text-foreground/70 hover:text-foreground dark:text-paper/75 dark:hover:text-paper",
  );
}

/**
 * Shape and hairline for two-way switches that sit in a page (reading level, dictionary tabs).
 * A switch marks its root with `data-capsule-switch` and uses the shape on exactly four elements:
 * the track, the sliding thumb and its two options. Tests count on that to keep every other
 * element on reading pages free of pill shapes.
 */
export const CAPSULE_SHAPE = "rounded-full";
export const CAPSULE_OUTLINE = cn("border-[0.5px]", OUTLINE);

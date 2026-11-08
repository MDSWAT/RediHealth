/**
 * Shared picker styles for the diabetes, healthy-eating and breathing explainers.
 *
 * Choices are rows on the parent surface, separated by hairlines: no bordered
 * boxes inside a card. The selected row is marked by a filled radio dot or a
 * ticked box, never by a heavier border. Hover and press feedback is colour only.
 */

const FEEDBACK =
  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2";

/** List of rows. Two columns from `sm` keeps long lists short; a top hairline closes the set. */
export const ROW_LIST_CLASS = "grid grid-cols-1 border-t border-border sm:grid-cols-2 sm:gap-x-8";
/** Same list, always one column (narrow side panels). */
export const ROW_LIST_SINGLE_CLASS = "grid grid-cols-1 border-t border-border";

/** One choice row. */
export const ROW_CLASS = `group flex min-h-[48px] w-full items-center gap-3 border-b border-border py-2.5 text-left ${FEEDBACK} has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-sapphire has-[:focus-visible]:ring-offset-2`;

/** Radio dot: a ring when not chosen, a thick ring (reads as a filled dot) when chosen. */
export function radioDotClass(selected: boolean): string {
  return `h-4 w-4 shrink-0 rounded-full border-solid transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
    selected ? "border-[5px] border-foreground" : "border-[1.5px] border-muted-foreground/60 group-hover:border-foreground/70"
  }`;
}

/** Tick box for multi-select rows; the tick icon sits inside it. */
export function tickBoxClass(selected: boolean): string {
  return `flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
    selected ? "border-foreground bg-foreground text-white" : "border-muted-foreground/60 bg-card group-hover:border-foreground/70"
  }`;
}

/**
 * Section tabs: an underline band (the same pattern as the smoking and women's health hubs).
 * On phones the tabs sit in a grid, each cell on its own hairline; from `sm` they run in
 * one row on a single hairline and the chosen tab carries a 2px ink underline.
 * Pass the phone column count (`grid-cols-2`, `grid-cols-3`) with the list class.
 */
export const TAB_LIST_CLASS = "grid gap-x-4 sm:flex sm:gap-x-6 sm:border-b sm:border-border";

export function tabClass(selected: boolean): string {
  return `flex min-h-11 items-end pb-2.5 pt-2 text-left text-sm font-semibold leading-snug sm:-mb-px ${FEEDBACK} focus-visible:ring-inset focus-visible:ring-offset-0 ${
    selected
      ? "text-foreground shadow-[inset_0_-2px_0_var(--color-foreground)]"
      : "text-muted-foreground shadow-[inset_0_-1px_0_var(--color-border)] hover:text-foreground sm:shadow-none"
  }`;
}

/**
 * Arrow keys on a tab: choose the next or previous tab and move the focus to it.
 * The tabs are found next to the pressed one, so no refs are needed.
 */
export function handleTabKey<T extends string>(
  event: { key: string; preventDefault: () => void; currentTarget: HTMLElement },
  tabs: readonly T[],
  active: T,
  select: (tab: T) => void,
) {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  const nextIndex = (tabs.indexOf(active) + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
  select(tabs[nextIndex]);
  const siblings = event.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
  siblings?.[nextIndex]?.focus();
}

/** Shared outer surface for a hub (tabs + panel in one card). */
export const HUB_CARD_CLASS = "rounded-xl border border-border bg-card p-5 sm:p-7";

/**
 * Step picker: one surface of numbered cells split by hairlines (the 1px gaps show the
 * border colour, so any column count stays evenly ruled). One column on phones; pass
 * the `sm:grid-cols-N` count with the list class.
 */
export const STEP_LIST_CLASS = "grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border";

export function stepCellClass(current: boolean): string {
  return `group flex h-full min-h-[56px] w-full items-center gap-3 px-3.5 py-3 text-left ${FEEDBACK} focus-visible:ring-inset focus-visible:ring-offset-0 ${
    current ? "bg-surface-subtle" : "bg-card hover:bg-surface-subtle/50"
  }`;
}

/** Step navigation: Back is a neutral text button, Next is ink filled. */
export const BACK_BUTTON_CLASS = `inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:text-foreground ${FEEDBACK}`;
export const NEXT_BUTTON_CLASS = `inline-flex min-h-[44px] items-center rounded-lg bg-foreground px-4 text-sm font-semibold text-white hover:bg-ink-800 ${FEEDBACK}`;

/** Step number in a stepper row: filled ink for the current step, quiet otherwise. */
export function stepNumberClass(current: boolean): string {
  return `flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
    current ? "bg-foreground text-white" : "bg-surface-subtle text-muted-foreground"
  }`;
}

/**
 * Shared class strings for every step of the health assistant, so step 1, the pathway questions
 * and the results read as one system.
 *
 * Radii: controls (buttons, inputs, icon tiles) are rounded-xl (public actions live in @/components/ui/Button); surfaces (panels, option rows) are
 * rounded-2xl; chips are rounded-full. Type: step heading 20/24, lead and body 16, labels and
 * descriptions 14. Red (primary) is kept for 112 and danger signs only.
 */

const motion = "duration-[var(--dur-fast)] ease-[var(--ease-out-calm)]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const stepHeading =
  "text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground text-balance sm:text-xl";

export const stepLead = "mt-2 text-base leading-relaxed text-muted-foreground text-pretty";

export const subHeading = "text-base font-semibold text-foreground";

/** A whole-row button or link: icon tile, title, description, arrow. */
const optionRowBase = `group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-[border-color,background-color] ${motion} ${focusRing} sm:p-5`;

export const optionRow = `${optionRowBase} press-row border-border bg-card shadow-2xs hover:border-sapphire/45 hover:bg-sapphire-soft/25 dark:border-ink-800`;

export const optionIcon = `mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-sapphire transition-colors ${motion} dark:text-sapphire-border`;

export const optionTitle = "block text-base font-semibold leading-snug text-foreground";

export const optionDesc = "mt-1 block text-sm leading-relaxed text-muted-foreground";

/** Row arrow indicator; transitions colour calmly on hover. */
export const optionArrow = `mt-1 h-4.5 w-4.5 shrink-0 text-muted-foreground transition-colors ${motion} motion-reduce:transition-none group-hover:text-sapphire`;

/** A calm tinted panel (no border) for a short aside inside a step. */
export const softPanel = "rounded-xl border border-sapphire/15 bg-sapphire-soft/55 p-5 dark:border-sapphire/25 dark:bg-sapphire/15";

/** The danger-signs panel: the only red surface in the steps. */
export const dangerPanel = "rounded-xl border border-primary/25 bg-primary-soft/50 p-5 sm:p-6";

/** `field-focus` gives the hover edge and the eased sapphire focus halo (aria-invalid aware). */
export const textInput = `field-focus min-h-12 w-full rounded-xl border border-border-control bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground`;

export const textLink = `group/link inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg font-semibold text-sapphire dark:text-sapphire-border ${focusRing}`;

export const textLinkLabel = `underline decoration-sapphire/30 underline-offset-4 transition-colors ${motion} group-hover/link:decoration-sapphire`;

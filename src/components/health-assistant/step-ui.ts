/**
 * Shared class strings for every step of the health assistant, so step 1, the pathway questions
 * and the results read as one system.
 *
 * Radii: controls (buttons, inputs, icon tiles) are rounded-xl; surfaces (panels, option rows) are
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

export const optionRow = `${optionRowBase} press-row border-stone-200/90 bg-card shadow-2xs hover:border-sapphire/45 hover:bg-sapphire-soft/25 dark:border-stone-800`;

/** The same row once chosen (radio rows). */
export const optionRowSelected = `${optionRowBase} border-sapphire bg-sapphire-soft/40 shadow-2xs`;

export const optionIcon = `mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-sapphire transition-colors ${motion} dark:text-sapphire-border`;

export const optionTitle = "block text-base font-semibold leading-snug text-foreground";

export const optionDesc = "mt-1 block text-sm leading-relaxed text-muted-foreground";

/** The arrow hands off (leaves right, returns from the left) on hover; see `arrow-travel` in globals.css. */
export const optionArrow = `arrow-travel mt-1 h-4.5 w-4.5 shrink-0 text-stone-400 transition-colors ${motion} group-hover:text-sapphire`;

const buttonBase = `group inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-[background-color,border-color] sm:px-5 sm:text-[0.9375rem] ${motion}`;

export const primaryButton = `${buttonBase} press-solid bg-sapphire text-white shadow-2xs hover:bg-sapphire-light ${focusRing} disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none`;

export const secondaryButton = `${buttonBase} press-row border border-border-control bg-card text-foreground shadow-2xs hover:border-sapphire/50 hover:bg-sapphire-soft/30 ${focusRing}`;

/** Outline button for the "yes, I have a danger sign" answer inside the red panel. */
export const dangerOutlineButton = `${buttonBase} border border-primary/40 bg-card text-primary hover:border-primary hover:bg-primary-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`;

export const emergencyButton = `${buttonBase} bg-primary text-white shadow-2xs hover:bg-primary-hover active:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`;

/** A calm tinted panel (no border) for a short aside inside a step. */
export const softPanel = "rounded-xl border border-sapphire/15 bg-sapphire-soft/55 p-5 dark:border-sapphire/25 dark:bg-sapphire/15";

/** The danger-signs panel: the only red surface in the steps. */
export const dangerPanel = "rounded-xl border border-primary/25 bg-primary-soft/50 p-5 sm:p-6";

/** `field-focus` gives the hover edge and the eased sapphire focus halo (aria-invalid aware). */
export const textInput = `field-focus min-h-12 w-full rounded-xl border border-border-control bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground`;

export const textLink = `group/link inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg font-semibold text-sapphire dark:text-sapphire-border ${focusRing}`;

export const textLinkLabel = `underline decoration-sapphire/30 underline-offset-4 transition-colors ${motion} group-hover/link:decoration-sapphire`;

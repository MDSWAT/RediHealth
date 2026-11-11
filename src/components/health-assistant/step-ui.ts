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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2";

export const stepHeading =
  "text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground text-balance sm:text-2xl";

export const stepLead = "mt-2 text-base leading-relaxed text-muted-foreground text-pretty";

export const subHeading = "text-base font-semibold text-foreground";

/** A whole-row button or link: icon tile, title, description, arrow. */
const optionRowBase = `group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-[border-color,background-color,transform] ${motion} motion-safe:active:scale-[0.99] ${focusRing} sm:p-5`;

export const optionRow = `${optionRowBase} border-border bg-card hover:border-sapphire/50 hover:bg-sapphire-soft/30`;

/** The same row once chosen (radio rows). */
export const optionRowSelected = `${optionRowBase} border-sapphire bg-sapphire-soft/40`;

export const optionIcon = `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sapphire-soft text-sapphire transition-colors ${motion} group-hover:bg-sapphire group-hover:text-white`;

export const optionTitle = "block text-base font-semibold leading-snug text-foreground";

export const optionDesc = "mt-1 block text-sm leading-relaxed text-muted-foreground";

export const optionArrow = `mt-1 h-4.5 w-4.5 shrink-0 text-sapphire transition-transform ${motion} motion-safe:group-hover:translate-x-0.5`;

const buttonBase = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-center text-base font-semibold transition-[background-color,border-color,transform] ${motion} motion-safe:active:scale-[0.98]`;

export const primaryButton = `${buttonBase} bg-sapphire text-white shadow-2xs hover:bg-sapphire-light ${focusRing} disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none motion-safe:disabled:active:scale-100`;

export const secondaryButton = `${buttonBase} border border-border-control bg-card text-foreground hover:border-sapphire/60 hover:bg-sapphire-soft/30 ${focusRing}`;

/** Outline button for the "yes, I have a danger sign" answer inside the red panel. */
export const dangerOutlineButton = `${buttonBase} border border-primary/40 bg-card text-primary hover:border-primary hover:bg-primary-soft/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`;

export const emergencyButton = `${buttonBase} bg-primary text-white shadow-2xs hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`;

/** A calm tinted panel (no border) for a short aside inside a step. */
export const softPanel = "rounded-2xl bg-sapphire-soft/60 p-5 dark:bg-sapphire/15";

/** The danger-signs panel: the only red surface in the steps. */
export const dangerPanel = "rounded-2xl border border-primary/25 bg-primary-soft/55 p-5 sm:p-6";

export const textInput = `min-h-12 w-full rounded-xl border border-border-control bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground transition-colors ${motion} hover:border-sapphire/60 focus-visible:border-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire`;

export const textLink = `group/link inline-flex min-h-11 items-center gap-1.5 rounded-lg font-semibold text-sapphire dark:text-sapphire-border ${focusRing}`;

export const textLinkLabel = `underline decoration-sapphire/30 underline-offset-4 transition-colors ${motion} group-hover/link:decoration-sapphire`;

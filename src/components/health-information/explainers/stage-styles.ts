/** Shared class names so every explainer (generic or custom) looks like one system. */

export const STAGE_CARD_CLASS = "rounded-lg border border-border bg-card p-6 shadow-xs";

export const STAGE_CANVAS_CLASS =
  "relative my-5 flex aspect-[16/9] max-h-64 w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-elevated";

export const STAGE_CONTROL_CLASS =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border bg-card px-3 text-sm font-semibold text-sapphire transition-colors hover:bg-sapphire-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire disabled:cursor-not-allowed disabled:opacity-40";

export const STAGE_PRIMARY_CONTROL_CLASS =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-sapphire px-4 text-sm font-semibold text-white transition-colors hover:bg-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-2";

export const STAGE_CREDIT_CLASS = "mt-3 text-[11px] leading-snug text-muted-foreground/80";

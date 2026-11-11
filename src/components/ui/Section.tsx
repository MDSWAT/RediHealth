import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type SectionTone = "paper" | "sand" | "sapphire-soft" | "ink";

const TONES: Record<SectionTone, string> = {
  paper: "bg-background text-foreground dark:bg-ink-950 dark:text-paper",
  sand: "border-y border-sand-line bg-sand text-foreground dark:border-white/10 dark:bg-ink-900 dark:text-paper",
  "sapphire-soft":
    "border-y border-sapphire-border bg-sapphire-soft text-foreground dark:border-white/10 dark:bg-ink-900 dark:text-paper",
  ink: "bg-ink-950 text-paper",
};

type SectionProps = ComponentProps<"section"> & {
  /** Ground colour. Neighbouring sections take different tones so the page has a rhythm. */
  tone?: SectionTone;
};

/**
 * A page section: a `<section>` with one of four grounds and the shared vertical padding.
 * It adds no gutter, so put a Container inside. `data-tone` lets SectionHeading match its text
 * to the ground. Server-safe.
 */
export function Section({ tone = "paper", className, children, ...rest }: SectionProps) {
  return (
    <section data-tone={tone} className={cn("py-14 sm:py-20 lg:py-24", TONES[tone], className)} {...rest}>
      {children}
    </section>
  );
}

import type { ComponentType, SVGProps } from "react";
import { ListCheckIcon, MessageDotsIcon, PhoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Boxicons (regular), same family as the triage panel: tell us, get next steps, talk to a doctor.
// The doctor step uses a telephone glyph because online consultations are voice-first.
const STEP_ICONS: readonly ComponentType<SVGProps<SVGSVGElement>>[] = [MessageDotsIcon, ListCheckIcon, PhoneIcon];

/**
 * How it works, in three steps. Informational, not interactive: the triage
 * panel next to it is the single place to act. Phones: three plain lines of
 * icon and text, with no rules that could pass for links. From sm: three
 * columns, each under a hairline with a 24px tick and its step figure.
 * Static, no staggered motion.
 */
export function CarePath({ steps, className }: { steps: [string, string, string]; className?: string }) {
  return (
    <ol className={cn("care-path hidden gap-3 lg:grid lg:grid-cols-3 lg:gap-x-6", className)}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[index] ?? MessageDotsIcon;
        return (
          <li
            key={step}
            className="relative flex flex-col items-start gap-2.5 border-t border-white/15 pt-4"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-px left-0 block h-px w-6 bg-paper/65"
            />
            <div aria-hidden="true" className="flex shrink-0 items-center gap-2">
              <span className="text-base font-semibold tabular-nums text-paper/70">
                {index + 1}
              </span>
              <Icon className="h-5 w-5 shrink-0 text-paper/80" />
            </div>
            <span className="min-w-0 text-body text-paper/85">
              <span className="sr-only">{index + 1}. </span>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

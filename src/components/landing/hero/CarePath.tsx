import type { ComponentType, SVGProps } from "react";
import { ListCheckIcon, MessageDotsIcon, PhoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Boxicons (regular), same family as the triage panel: tell us, get next steps, talk to a doctor.
// The doctor step uses a telephone glyph because online consultations are voice-first.
const STEP_ICONS: readonly ComponentType<SVGProps<SVGSVGElement>>[] = [MessageDotsIcon, ListCheckIcon, PhoneIcon];

/**
 * How it works, in three steps. Informational, not interactive: the triage
 * panel next to it is the single place to act. Static: a hairline with a 24px
 * top-edge tick and tabular numeral above each step, no staggered motion.
 */
export function CarePath({ steps, className }: { steps: [string, string, string]; className?: string }) {
  return (
    <ol className={cn("care-path grid grid-cols-1 gap-x-6 sm:grid-cols-3", className)}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[index] ?? MessageDotsIcon;
        const stepCode = String(index + 1).padStart(2, "0");
        return (
          <li
            key={step}
            className="relative flex items-center gap-3.5 border-t border-white/15 py-3.5 sm:flex-col sm:items-start sm:gap-2.5 sm:pt-4 sm:pb-0"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-px left-0 h-px w-6 bg-paper/65"
            />
            <div aria-hidden="true" className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-xs font-medium tabular-nums text-paper/55">
                {stepCode}
              </span>
              <Icon className="h-5 w-5 shrink-0 text-paper/80" />
            </div>
            <span className="text-[14.5px] font-medium leading-snug text-paper/85">
              <span className="sr-only">{index + 1}. </span>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

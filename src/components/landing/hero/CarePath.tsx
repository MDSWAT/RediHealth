import type { ComponentType, SVGProps } from "react";
import { ListCheckIcon, MessageDotsIcon, PhoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Boxicons (regular), same family as the triage panel: tell us, get next steps, talk to a doctor.
// The doctor step uses a telephone glyph because online consultations are voice-first.
const STEP_ICONS: readonly ComponentType<SVGProps<SVGSVGElement>>[] = [MessageDotsIcon, ListCheckIcon, PhoneIcon];

/**
 * How it works, in three steps. Informational, not interactive. It sits inside the dark "Find out
 * what to do" card on the landing page, as a short vertical list under the card's text: each
 * step on a hairline, its figure and icon, then the words. Static, no staggered motion.
 */
export function CarePath({ steps, className }: { steps: [string, string, string]; className?: string }) {
  return (
    <ol className={cn("grid", className)}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[index] ?? MessageDotsIcon;
        return (
          <li key={step} className="flex items-center gap-3 border-t border-white/15 py-3">
            <div aria-hidden="true" className="flex w-12 shrink-0 items-center gap-2">
              <span className="text-base font-semibold tabular-nums text-paper/70">{index + 1}</span>
              <Icon className="h-5 w-5 shrink-0 text-paper/80" />
            </div>
            <span className="min-w-0 text-body text-paper/90">
              <span className="sr-only">{index + 1}. </span>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

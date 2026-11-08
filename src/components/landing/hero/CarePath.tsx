import type { ComponentType, SVGProps } from "react";
import { ListCheckIcon, MessageDotsIcon, PhoneIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Boxicons (regular), same family as the triage panel: tell us, get next steps, talk to a doctor.
// The doctor step is a phone: online consultations are voice-only.
const STEP_ICONS: readonly ComponentType<SVGProps<SVGSVGElement>>[] = [MessageDotsIcon, ListCheckIcon, PhoneIcon];

/**
 * How it works, in three steps. Informational, not interactive: the triage
 * panel next to it is the single place to act. Static: a hairline above each
 * step, no drawing or staggered motion.
 */
export function CarePath({ steps, className }: { steps: [string, string, string]; className?: string }) {
  return (
    <ol className={cn("care-path grid grid-cols-1 gap-x-6 sm:grid-cols-3", className)}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[index] ?? MessageDotsIcon;
        return (
          <li
            key={step}
            className="flex items-center gap-3.5 border-t border-white/15 py-3.5 sm:flex-col sm:items-start sm:gap-3 sm:pt-4 sm:pb-0"
          >
            <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-paper/80" />
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

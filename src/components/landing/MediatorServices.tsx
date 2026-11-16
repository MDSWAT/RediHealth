"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { HomeStep } from "@/lib/i18n/home-sections-copy";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * What a health mediator does, on the ink ground.
 * - From sm: three columns under an amber rule, every text showing.
 * - Phones: the same three as rows that grow open and shrink shut, so the section reads as three
 *   short titles first. The first is open; any number can be open at once. Each title is a real
 *   button (aria-expanded) and the text under a closed one leaves the tab order.
 * The server renders everything open, so nothing is hidden before the script runs.
 */
export function MediatorServices({ services }: { services: HomeStep[] }) {
  const isPhone = useIsPhone();
  const [open, setOpen] = useState<boolean[]>(() => services.map((_, index) => index === 0));
  const baseId = useId();

  return (
    <ul className="mt-12 grid gap-0 sm:grid-cols-3 sm:gap-6 lg:mt-16 lg:gap-10">
      {services.map((service, index) => {
        const shown = !isPhone || open[index];
        const panelId = `${baseId}-${index}`;
        return (
          <li key={service.title} className="max-sm:border-b max-sm:border-paper/12 max-sm:first:border-t max-sm:first:border-t-amber-care-border/60">
            <span aria-hidden="true" className="hidden h-0.5 bg-amber-care-border sm:block" />

            {/* Phones: the title is the toggle. */}
            <h3 className="sm:hidden">
              <button
                type="button"
                aria-expanded={shown}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => prev.map((value, i) => (i === index ? !value : value)))}
                className="press-row -mx-2 flex min-h-14 w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 text-left text-title font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-paper/[0.05] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none"
              >
                <span className="min-w-0 flex-1 text-balance">{service.title}</span>
                <ChevronDownIcon
                  className={cn(
                    "h-5 w-5 shrink-0 text-amber-care-border transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                    shown && "rotate-180",
                  )}
                />
              </button>
            </h3>
            {/* From sm: a plain heading. */}
            <h3 className="mt-5 hidden text-balance text-title font-semibold text-paper sm:block">{service.title}</h3>

            <div
              id={panelId}
              inert={!shown}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-(--measure-reading) pb-4 text-pretty text-body text-mist sm:mt-2 sm:pb-0">{service.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

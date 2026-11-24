"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { HomeStep } from "@/lib/i18n/home-sections-copy";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * What a health mediator does, on the ink ground.
 * - From sm: an asymmetric editorial hairline list with titles on the left and descriptions on the right.
 * - Phones: the same three rows grow open and shrink shut, so the section reads as three
 *   short titles first. Each title is a button (aria-expanded) and closed text leaves the tab order.
 */
export function MediatorServices({ services }: { services: HomeStep[] }) {
  const isPhone = useIsPhone();
  const [open, setOpen] = useState<boolean[]>(() => services.map(() => false));
  const baseId = useId();

  return (
    <ul className="mt-7 divide-y divide-paper/12 border-t border-paper/12 sm:mt-12 lg:mt-14">
      {services.map((service, index) => {
        const shown = !isPhone || open[index];
        const panelId = `${baseId}-${index}`;
        return (
          <li
            key={service.title}
            className="sm:grid sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] sm:items-baseline sm:gap-10 sm:py-6"
          >
            {/* Phones: compact tappable row. */}
            <h3 className="sm:hidden">
              <button
                type="button"
                aria-expanded={shown}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => prev.map((value, i) => (i === index ? !value : value)))}
                className="press-row flex min-h-13 w-full items-center gap-3 text-left text-body font-semibold text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper motion-reduce:transition-none"
              >
                <span className="min-w-0 flex-1 text-balance">{service.title}</span>
                <ChevronDownIcon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 text-amber-care-border transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                    shown && "rotate-180",
                  )}
                />
              </button>
            </h3>

            {/* From sm: asymmetric left column heading. */}
            <h3 className="hidden text-balance text-title font-semibold text-paper sm:block">{service.title}</h3>

            <div
              id={panelId}
              inert={!shown}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                shown ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-(--measure-reading) pb-4 text-pretty text-body text-mist sm:pb-0">{service.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

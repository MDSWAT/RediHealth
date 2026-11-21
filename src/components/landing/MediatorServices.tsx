"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { HomeStep } from "@/lib/i18n/home-sections-copy";
import { useIsPhone } from "@/lib/use-is-phone";

/**
 * What a health mediator does, on the ink ground.
 * - From sm: three elevated dark-glass architectural panels under an animated amber rule, every text showing.
 * - Phones: the same three as rows that grow open and shrink shut, so the section reads as three
 *   short titles first. The first is open; any number can be open at once. Each title is a real
 *   button (aria-expanded) and the text under a closed one leaves the tab order.
 * The server renders everything open, so nothing is hidden before the script runs.
 */
export function MediatorServices({ services }: { services: HomeStep[] }) {
  const isPhone = useIsPhone();
  const [open, setOpen] = useState<boolean[]>(() => services.map(() => false));
  const baseId = useId();

  return (
    <Reveal
      as="ul"
      stagger="editorial"
      className="mt-7 grid gap-2.5 sm:mt-12 sm:grid-cols-3 sm:gap-5 lg:mt-14 lg:gap-6"
    >
      {services.map((service, index) => {
        const shown = !isPhone || open[index];
        const panelId = `${baseId}-${index}`;
        return (
          <li
            key={service.title}
            className="max-sm:rounded-xl max-sm:border max-sm:border-paper/12 max-sm:bg-paper/[0.04] max-sm:px-4 sm:rounded-2xl sm:border sm:border-paper/12 sm:bg-paper/[0.035] sm:p-6 sm:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.07)] sm:backdrop-blur-xs sm:transition-[background-color,border-color,box-shadow] sm:duration-(--dur-base) sm:ease-(--ease-out-calm) sm:hover:border-amber-care-border/45 sm:hover:bg-paper/[0.06] sm:hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.12),0_18px_36px_-20px_rgb(0_0_0/0.6)] motion-reduce:transition-none"
          >
            <span aria-hidden="true" className="rule-draw hidden h-0.5 w-10 bg-amber-care-border sm:block" />

            {/* Phones: compact tappable info box. */}
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
                <p className="max-w-(--measure-reading) pb-4 text-pretty text-body text-mist sm:mt-2.5 sm:pb-0">{service.text}</p>
              </div>
            </div>
          </li>
        );
      })}
    </Reveal>
  );
}

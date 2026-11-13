"use client";

import React, { useId, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

export type DispatcherScriptAccordionProps = {
  defaultOpen?: boolean;
  className?: string;
};

function useSafeLanguage() {
  try {
    const ctx = useLanguage();
    const lang = ctx?.lang || "ro";
    const baseT = translations[lang] ?? translations.ro;
    const t = {
      ...baseT,
      ...(ctx?.t || {}),
      emergency: ctx?.t?.emergency ?? baseT.emergency,
    };
    return { lang, t };
  } catch {
    return { lang: "ro" as const, t: translations.ro };
  }
}

/** What to tell the 112 dispatcher: where you are, who needs help, what happened. Closed by default. */
export function DispatcherScriptAccordion({
  defaultOpen = false,
  className,
}: DispatcherScriptAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const { t } = useSafeLanguage();
  const e = t.emergency;

  return (
    <div className={cn("rounded-xl border border-primary/15 bg-primary-soft/50", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="press-row flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] motion-reduce:transition-none hover:bg-primary-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[0.9375rem]"
      >
        <span>{e.dispatcherGuideTitle}</span>
        <ChevronDownIcon
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Opens by height instead of appearing at full size; the steps then arrive in order. */}
      <div id={panelId} className="calm-collapse" data-open={isOpen ? "true" : "false"}>
        <div className="calm-collapse-inner" inert={!isOpen}>
          <div className="px-4 pb-4 text-sm text-foreground">
            <p className="text-muted-foreground leading-relaxed">{e.dispatcherGuideSubtitle}</p>

            <ol className="mt-3 space-y-3">
              {e.dispatcherSteps.map((step, idx) => (
                <li
                  key={idx}
                  style={{ "--i": idx } as React.CSSProperties}
                  className={cn(isOpen && "list-in", "flex items-start gap-3")}
                >
                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-card text-[11px] font-semibold tabular-nums text-primary ring-1 ring-primary/20">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <strong className="block font-semibold leading-snug">{step.title}</strong>
                    <span className="mt-0.5 block leading-relaxed text-muted-foreground">
                      {step.description}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 border-t border-primary/15 pt-3 font-medium leading-relaxed text-foreground">
              {e.dispatcherImportantNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

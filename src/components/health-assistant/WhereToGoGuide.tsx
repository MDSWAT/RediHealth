"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { PathwayNavigation } from "@/components/health-assistant/pathways/PathwayNavigation";
import { type NavigationScenarioId, useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { getCalmMotionSnapshot } from "@/lib/comfort-preferences";

/**
 * "I don't know which doctor to see, or I have no ID card": pick a situation, then read where to go,
 * which documents to bring and how a health mediator can help. Browser Back returns to the list.
 */
export function WhereToGoGuide() {
  const copy = useAssistantCopy();
  const [scenario, setScenario] = useState<NavigationScenarioId | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const handlePopState = () => setScenario(null);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const choose = useCallback((next: NavigationScenarioId) => {
    window.history.pushState({ ...(window.history.state ?? {}), whereToGo: next }, "");
    setScenario(next);
  }, []);

  const back = useCallback(() => {
    // Undo the history entry added when the situation was chosen; popstate then shows the list.
    if (window.history.state?.whereToGo) window.history.back();
    else setScenario(null);
  }, []);

  // Bring the top of the card into view on small screens and move focus to the new view.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || getCalmMotionSnapshot();
      card.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }
    contentRef.current?.focus({ preventScroll: true });
  }, [scenario]);

  return (
    <section
      ref={cardRef}
      aria-label={copy.tree.options.navigation.plainTitle}
      className="min-w-0 scroll-mt-[calc(var(--chrome-h,0px)+1rem)]"
    >
      {/* No wrapping card: the situation rows are the only boxes, so nothing is a box in a box. */}
      <div>
        {scenario && (
          <button
            type="button"
            onClick={back}
            className="-ml-1 mb-4 inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-1 text-body font-semibold text-sapphire press-row transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-sapphire-border"
          >
            <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{copy.machine.back}</span>
          </button>
        )}
        <div key={scenario ?? "list"} ref={contentRef} tabIndex={-1} className="focus:outline-none">
          <PathwayNavigation
            step={scenario ? 3 : 2}
            selectedScenario={scenario ?? undefined}
            onSelectScenario={choose}
            plainLanguage
          />
        </div>
      </div>
    </section>
  );
}

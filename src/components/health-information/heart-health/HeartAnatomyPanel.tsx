"use client";

import { useId, useState } from "react";
import type { Lang } from "@/lib/i18n/translations";
import { HeartDiagram } from "../explainers/scenes/HeartDiagram";
import { HEART_ANATOMY_UI_COPY, HEART_PARTS, type HeartPartId } from "./heart-anatomy-copy";

export interface HeartAnatomyPanelProps {
  lang: Lang;
  className?: string;
}

/**
 * The beating heart diagram with a plain-language list of four parts. Choosing a
 * part highlights it on the diagram and explains what high blood pressure does to it.
 */
export function HeartAnatomyPanel({ lang, className = "" }: HeartAnatomyPanelProps) {
  const copy = HEART_ANATOMY_UI_COPY[lang] ?? HEART_ANATOMY_UI_COPY.ro;
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<HeartPartId | null>(null);
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const listLabelId = `${baseId}-parts`;

  // Under reduced motion the CSS keeps the diagram still and hides the pause button,
  // so server and client render the same markup (no hydration mismatch).
  const playing = !paused;
  const toggle = (id: HeartPartId) => setSelected((prev) => (prev === id ? null : id));

  return (
    <section aria-labelledby={headingId} className={className}>
      <h4 id={headingId} className="text-lg font-semibold text-foreground">
        {copy.heading}
      </h4>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start">
        <figure className="relative">
          <div role="img" aria-label={copy.diagramLabel} className="mx-auto max-w-[320px]">
            <HeartDiagram
              playing={playing}
              highlight={selected}
              showMarkers
              onMarkerSelect={toggle}
            />
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={!paused}
            aria-label={paused ? copy.play : copy.pause}
            title={paused ? copy.play : copy.pause}
            className="press-row absolute right-0 top-0 inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hidden motion-reduce:transition-none"
          >
            {paused ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
          </button>
          <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {copy.ecgCaption}
          </figcaption>
        </figure>

        <div>
          <p id={listLabelId} className="text-sm font-semibold text-foreground">
            {copy.partsLabel}
          </p>
          <ul aria-labelledby={listLabelId} className="mt-2 divide-y divide-border border-y border-border">
            {HEART_PARTS.map((part) => {
              const open = selected === part.id;
              const detailId = `${baseId}-${part.id}`;
              return (
                <li key={part.id} data-heart-part={part.id}>
                  <button
                    type="button"
                    onClick={() => toggle(part.id)}
                    aria-expanded={open}
                    aria-controls={detailId}
                    className="press-row flex min-h-[44px] w-full items-start gap-3 rounded-lg px-2.5 py-3 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] ${
                        open
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {part.marker}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{part.name[lang]}</span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">
                        {part.role[lang]}
                      </span>
                    </span>
                  </button>
                  <div
                    id={detailId}
                    aria-hidden={!open}
                    className={`grid transition-[grid-template-rows,opacity] duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${
                      open ? "mt-2 grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="pb-3 pl-11 pr-2.5 text-sm leading-relaxed text-foreground">
                        <strong className="font-semibold">{copy.whenHighLabel}</strong> {part.whenHigh[lang]}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

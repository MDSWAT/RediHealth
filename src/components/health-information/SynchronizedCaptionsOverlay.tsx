"use client";

import type { Lang } from "@/lib/i18n/translations";

export interface WordCue {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
  words?: WordCue[];
}

export interface CaptionLabels {
  turnOn: string;
  turnOff: string;
  activeBadge: string;
}

export const CAPTION_LABELS: Record<Lang, CaptionLabels> = {
  ro: { turnOn: "Activează subtitrările", turnOff: "Dezactivează subtitrările", activeBadge: "CC activ" },
  en: { turnOn: "Turn captions on", turnOff: "Turn captions off", activeBadge: "CC on" },
  sq: { turnOn: "Aktivizo titrat", turnOff: "Çaktivizo titrat", activeBadge: "CC aktiv" },
  it: { turnOn: "Attiva i sottotitoli", turnOff: "Disattiva i sottotitoli", activeBadge: "CC attivi" },
};

export interface SynchronizedCaptionsOverlayProps {
  cues: SubtitleCue[];
  currentTime: number;
  isVisible: boolean;
  onToggleVisible?: () => void;
  lang?: Lang;
  className?: string;
  /** When true, renders captions inline inside the card flow and omits the floating top-right toggle button. */
  inline?: boolean;
}

export function SynchronizedCaptionsOverlay({
  cues,
  currentTime,
  isVisible,
  onToggleVisible,
  lang = "ro",
  className = "",
  inline = false,
}: SynchronizedCaptionsOverlayProps) {
  const labels = CAPTION_LABELS[lang] ?? CAPTION_LABELS.ro;
  const activeCue = cues.find((c) => currentTime >= c.start && currentTime <= c.end);

  if (inline) {
    if (!isVisible || !activeCue) return null;
    return (
      <div
        className={`rounded-md border border-border bg-surface-subtle px-3.5 py-2.5 text-left ${className}`}
        aria-live="polite"
      >
        <p className="text-[13.5px] font-medium leading-relaxed text-foreground">
          {activeCue.words && activeCue.words.length > 0 ? (
            activeCue.words.map((w, idx) => {
              const isWordActive = currentTime >= w.start && currentTime <= w.end;
              return (
                <span
                  key={idx}
                  data-active-word={isWordActive ? "true" : undefined}
                  className={`transition-colors duration-150 motion-reduce:transition-none ${
                    isWordActive
                      ? "font-semibold text-foreground underline decoration-foreground decoration-2 underline-offset-4"
                      : "text-muted-foreground"
                  }`}
                >
                  {w.word}{" "}
                </span>
              );
            })
          ) : (
            <span className="text-foreground">{activeCue.text}</span>
          )}
        </p>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={onToggleVisible}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card/95 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          aria-label={labels.turnOn}
          aria-pressed={false}
        >
          CC
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={onToggleVisible}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-foreground bg-surface-subtle px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          aria-label={labels.turnOff}
          aria-pressed={true}
        >
          {labels.activeBadge}
        </button>
      </div>

      {activeCue && (
        <div
          className={`absolute bottom-[4.25rem] inset-x-3 z-20 rounded-md border border-border bg-card/95 px-3.5 py-2.5 text-left shadow-xs ${className}`}
          aria-live="polite"
        >
          <p className="text-[13.5px] font-medium leading-relaxed text-foreground">
            {activeCue.words && activeCue.words.length > 0 ? (
              activeCue.words.map((w, idx) => {
                const isWordActive = currentTime >= w.start && currentTime <= w.end;
                return (
                  <span
                    key={idx}
                    data-active-word={isWordActive ? "true" : undefined}
                    className={`transition-colors duration-150 motion-reduce:transition-none ${
                      isWordActive
                        ? "font-semibold text-foreground underline decoration-foreground decoration-2 underline-offset-4"
                        : "text-muted-foreground"
                    }`}
                  >
                    {w.word}{" "}
                  </span>
                );
              })
            ) : (
              <span className="text-foreground">{activeCue.text}</span>
            )}
          </p>
        </div>
      )}
    </>
  );
}

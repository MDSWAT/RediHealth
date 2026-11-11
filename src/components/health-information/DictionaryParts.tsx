"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CloseIcon, SearchIcon, VolumeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Lang } from "@/lib/i18n/translations";

export type DictionaryTabKind = "dictionary" | "romanes";

interface TabHandoffState {
  from: DictionaryTabKind;
  to: DictionaryTabKind;
}

let pendingTabHandoff: TabHandoffState | null = null;
let sharedDrawerOpener: HTMLElement | null = null;
let sharedPrevBodyOverflow: string | null = null;
let activeDrawerInstances = 0;

/**
 * Marks an intentional in-place switch between the medical dictionary and the Romanes
 * lexicon so the incoming drawer frame skips outer slide/scrim animations, preserves
 * keyboard focus on the newly selected tab, and retains the original page trigger for Escape/close.
 */
export function markDictionaryTabHandoff(
  from: DictionaryTabKind,
  to: DictionaryTabKind,
): void {
  if (from === to) return;
  pendingTabHandoff = { from, to };
}

function readPendingTabHandoff(): boolean {
  return pendingTabHandoff !== null;
}

const LARGE_TEXT_STORAGE_KEY = "redihealth_dict_large_text";

function readStoredLargeText(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LARGE_TEXT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export const DICTIONARY_UTILITY_COPY: Record<
  Lang,
  {
    clearSearch: string;
    largeTextLabel: string;
    largeTextAria: string;
    stopAudio: string;
    resetFilters: string;
  }
> = {
  ro: {
    clearSearch: "Șterge căutarea",
    largeTextLabel: "Text mare",
    largeTextAria: "Activează scrisul mai mare în dicționar",
    stopAudio: "Oprește",
    resetFilters: "Arată toate",
  },
  en: {
    clearSearch: "Clear search",
    largeTextLabel: "Large text",
    largeTextAria: "Toggle larger text in the dictionary",
    stopAudio: "Stop",
    resetFilters: "Show all",
  },
  sq: {
    clearSearch: "Pastro kërkimin",
    largeTextLabel: "Tekst i madh",
    largeTextAria: "Aktivizo shkrimin më të madh në fjalor",
    stopAudio: "Ndalo",
    resetFilters: "Shfaq të gjitha",
  },
  it: {
    clearSearch: "Cancella ricerca",
    largeTextLabel: "Testo grande",
    largeTextAria: "Attiva il testo più grande nel dizionario",
    stopAudio: "Ferma",
    resetFilters: "Mostra tutti",
  },
  hr: {
    clearSearch: "Obriši pretragu",
    largeTextLabel: "Veliki tekst",
    largeTextAria: "Uključi veći tekst u rječniku",
    stopAudio: "Zaustavi",
    resetFilters: "Prikaži sve",
  },
  rom: {
    clearSearch: "Kos o rodimos",
    largeTextLabel: "Baro teksto",
    largeTextAria: "Phuter maj baro teksto ando alavari",
    stopAudio: "Ačhav",
    resetFilters: "Sikav savore",
  },
};

/**
 * Shared frame for the dual-register medical dictionary and the Romanes lexicon:
 * bottom sheet on phones (translateY), 672px lateral drawer on sm:+ (translateX),
 * 2-zone non-clipping flex architecture, persisted A+ large-text scaling, and focus coordination.
 */
export function DictionaryDrawerFrame({
  labelledBy,
  title,
  subtitle,
  closeLabel,
  onClose,
  headerControls,
  lang = "ro",
  className,
  children,
}: {
  labelledBy: string;
  title: string;
  subtitle: string;
  closeLabel: string;
  onClose: () => void;
  headerControls?: ReactNode;
  lang?: Lang;
  className?: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  const [isTabHandoff] = useState<boolean>(readPendingTabHandoff);
  const [largeText, setLargeText] = useState<boolean>(readStoredLargeText);

  const utilCopy = DICTIONARY_UTILITY_COPY[lang] ?? DICTIONARY_UTILITY_COPY.ro;

  const handleToggleLargeText = () => {
    setLargeText((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(LARGE_TEXT_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage quota or private mode restrictions
      }
      return next;
    });
  };

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const handoff = pendingTabHandoff;
    if (activeDrawerInstances === 0 && !handoff) {
      sharedDrawerOpener = document.activeElement as HTMLElement | null;
      sharedPrevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    activeDrawerInstances += 1;

    if (handoff) {
      const activeTab = panelRef.current?.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );
      activeTab?.focus({ preventScroll: true });
      queueMicrotask(() => {
        pendingTabHandoff = null;
      });
    } else {
      closeRef.current?.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]):not([tabindex="-1"]), [href]:not([tabindex="-1"]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      activeDrawerInstances = Math.max(0, activeDrawerInstances - 1);
      queueMicrotask(() => {
        if (activeDrawerInstances === 0 && pendingTabHandoff === null) {
          if (sharedPrevBodyOverflow !== null) {
            document.body.style.overflow = sharedPrevBodyOverflow;
            sharedPrevBodyOverflow = null;
          }
          const opener = sharedDrawerOpener;
          sharedDrawerOpener = null;
          opener?.focus?.();
        }
      });
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      data-tab-handoff={isTabHandoff ? "true" : undefined}
      className="hh-scrim fixed inset-0 z-50 flex items-end justify-end bg-obsidian-navy/45 backdrop-blur-[2px] sm:items-stretch"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        data-large-text={largeText ? "true" : "false"}
        data-tab-handoff={isTabHandoff ? "true" : undefined}
        className={cn(
          "rh-glossary-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-2xl sm:h-full sm:max-h-none sm:max-w-2xl sm:rounded-none sm:border-l sm:border-border",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Zone 1: Pinned non-scrolling masthead + tab/search control deck */}
        <header className="shrink-0 border-b border-border bg-card">
          <div className="rh-dict-masthead pt-2.5 sm:pt-0">
            <div
              className="mx-auto mb-2 h-1.5 w-12 shrink-0 rounded-full bg-border sm:hidden"
              aria-hidden="true"
            />
            <div
              className={cn(
                "flex items-start justify-between gap-3 px-4 pb-3.5 pt-1 sm:px-6 sm:py-5",
                headerControls ? "border-b border-border/75" : "",
              )}
            >
              <div className="min-w-0 flex-1">
                <h2
                  id={labelledBy}
                  className="text-xl font-semibold tracking-[-0.015em] text-foreground text-balance sm:text-[22px]"
                >
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-snug text-muted-foreground text-pretty">
                  {subtitle}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleLargeText}
                  aria-pressed={largeText}
                  aria-label={utilCopy.largeTextAria}
                  title={utilCopy.largeTextAria}
                  className={cn(
                    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
                    largeText
                      ? "border-sapphire bg-sapphire text-white shadow-xs"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  <span aria-hidden="true" className="text-[13px] font-bold tracking-tight">
                    A+
                  </span>
                  <span className="hidden sm:inline">{utilCopy.largeTextLabel}</span>
                </button>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label={closeLabel}
                  title={closeLabel}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-border hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {headerControls && (
            <div className="shrink-0 bg-card px-4 py-3 sm:px-6 sm:py-3.5">
              {headerControls}
            </div>
          )}
        </header>

        {/* Zone 2: Scrollable lexicon body */}
        {children}
      </div>
    </div>
  );
}

export function DictionarySearch({
  value,
  onChange,
  placeholder,
  clearLabel = "Șterge căutarea",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  clearLabel?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {/* 16px text so iPhones do not zoom into the field. */}
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "min-h-[46px] w-full rounded-xl border border-border bg-surface-card/70 pl-10 text-base text-foreground placeholder:text-muted-foreground/80 transition-colors duration-[var(--dur-fast)] focus:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
          value.length > 0 ? "pr-11" : "pr-4",
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label={clearLabel}
          title={clearLabel}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Multi-line wrapping category pills with semantic icons and live tabular counts.
 * Eliminates horizontal overflow so every category is visible at a glance on all viewports.
 */
export function DictionaryFilters<T extends string>({
  options,
  selected,
  onSelect,
  label,
}: {
  options: {
    value: T;
    label: string;
    count?: number;
    tone?: "default" | "emergency";
    icon?: ReactNode;
  }[];
  selected: T;
  onSelect: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-1.5 sm:gap-2"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        const isEmergency = option.tone === "emergency";

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "inline-flex min-h-[40px] max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold leading-tight transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-1 sm:min-h-[42px] sm:px-3.5",
              isEmergency
                ? isSelected
                  ? "border-primary bg-primary text-white shadow-xs"
                  : "border-primary/25 bg-primary-soft/60 text-primary hover:border-primary/50 hover:bg-primary-soft"
                : isSelected
                  ? "border-sapphire bg-sapphire text-white shadow-xs"
                  : "border-border bg-card text-foreground hover:border-sapphire/35 hover:bg-sapphire-soft/55 hover:text-sapphire",
            )}
          >
            {option.icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "flex shrink-0 items-center justify-center",
                  isSelected
                    ? "text-white"
                    : isEmergency
                      ? "text-primary"
                      : "text-sapphire",
                )}
              >
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums leading-none",
                  isSelected
                    ? "bg-white/20 text-white"
                    : isEmergency
                      ? "bg-primary/12 text-primary"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Tactile audio pronunciation pill with explicit listen/stop text and a 4-bar waveform while speaking.
 */
export function DictionarySpeakButton({
  speaking,
  onClick,
  label,
  listenText = "Ascultă",
  stopText = "Oprește",
  tone = "default",
}: {
  speaking: boolean;
  onClick: () => void;
  label: string;
  listenText?: string;
  stopText?: string;
  tone?: "default" | "emergency";
}) {
  const isEmergency = tone === "emergency";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={speaking}
      title={label}
      className={cn(
        "inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold leading-none transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire focus-visible:ring-offset-1",
        isEmergency
          ? speaking
            ? "border-primary bg-primary text-white shadow-xs hover:bg-primary-hover"
            : "border-primary/25 bg-primary-soft text-primary hover:border-primary/45 hover:bg-primary-soft/80"
          : speaking
            ? "border-sapphire bg-sapphire text-white shadow-xs hover:bg-sapphire-light"
            : "border-sapphire-border bg-sapphire-soft text-sapphire hover:border-sapphire/40 hover:bg-sapphire-soft/80",
      )}
    >
      {speaking ? (
        <>
          <span
            aria-hidden="true"
            className="inline-flex h-4 w-4 shrink-0 items-center justify-between gap-[2px]"
          >
            <span className="rh-dict-wave-bar h-3.5 w-[2.5px] rounded-full bg-current" />
            <span className="rh-dict-wave-bar h-3.5 w-[2.5px] rounded-full bg-current" />
            <span className="rh-dict-wave-bar h-3.5 w-[2.5px] rounded-full bg-current" />
            <span className="rh-dict-wave-bar h-3.5 w-[2.5px] rounded-full bg-current" />
          </span>
          <span>{stopText}</span>
        </>
      ) : (
        <>
          <VolumeIcon className="h-4 w-4 shrink-0" />
          <span>{listenText}</span>
        </>
      )}
    </button>
  );
}

function stripDiacriticsWithMap(input: string): {
  normalized: string;
  indexMap: number[];
} {
  let normalized = "";
  const indexMap: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const clean = input[i]
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    for (let j = 0; j < clean.length; j++) {
      normalized += clean[j];
      indexMap.push(i);
    }
  }
  return { normalized, indexMap };
}

/** Diacritic-insensitive substring highlighter with WCAG AAA obsidian-on-cream contrast. */
export function HighlightGlossaryText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const cleanQuery = query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (!cleanQuery || !text) {
    return <>{text}</>;
  }

  const { normalized, indexMap } = stripDiacriticsWithMap(text);
  const parts: ReactNode[] = [];
  let searchFrom = 0;
  let lastOrigIdx = 0;
  let keyCounter = 0;

  while (searchFrom < normalized.length) {
    const matchIdx = normalized.indexOf(cleanQuery, searchFrom);
    if (matchIdx === -1) break;

    const origStart = indexMap[matchIdx];
    const endNormIdx = matchIdx + cleanQuery.length - 1;
    const origEnd =
      endNormIdx + 1 < indexMap.length
        ? indexMap[endNormIdx + 1]
        : text.length;

    if (origStart > lastOrigIdx) {
      parts.push(text.slice(lastOrigIdx, origStart));
    }
    parts.push(
      <mark
        key={`hl-${keyCounter++}`}
        className="rounded-xs bg-amber-care-soft px-1 font-semibold text-obsidian-navy ring-1 ring-inset ring-amber-care-border"
      >
        {text.slice(origStart, origEnd)}
      </mark>,
    );
    lastOrigIdx = origEnd;
    searchFrom = matchIdx + cleanQuery.length;
  }

  if (parts.length === 0) {
    return <>{text}</>;
  }
  if (lastOrigIdx < text.length) {
    parts.push(text.slice(lastOrigIdx));
  }
  return <>{parts}</>;
}

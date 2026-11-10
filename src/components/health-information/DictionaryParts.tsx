"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, SearchIcon, VolumeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Shared pieces of the two dictionary drawers (medical dictionary and Romanes glossary):
 * bottom sheet on phones (translateY), lateral drawer from the right on sm:+ (translateX),
 * with focus trap and reduced-motion bypass.
 */
export function DictionaryDrawerFrame({
  labelledBy,
  title,
  subtitle,
  closeLabel,
  onClose,
  className,
  children,
}: {
  labelledBy: string;
  title: string;
  subtitle: string;
  closeLabel: string;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
      opener?.focus?.();
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="hh-scrim fixed inset-0 z-50 flex items-end justify-end bg-black/50 sm:items-stretch"
      onClick={onClose}
    >
      <style>{`
        @keyframes rh-glossary-sheet-up {
          from { transform: translateY(100%); }
          to { transform: none; }
        }
        @keyframes rh-glossary-drawer-in {
          from { transform: translateX(100%); }
          to { transform: none; }
        }
        .rh-glossary-panel {
          animation: rh-glossary-sheet-up var(--dur-slow) var(--ease-out-calm) both;
        }
        @media (min-width: 640px) {
          .rh-glossary-panel {
            animation: rh-glossary-drawer-in var(--dur-base) var(--ease-out-calm) both;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .rh-glossary-panel {
            animation: none !important;
          }
        }
      `}</style>

      <div
        ref={panelRef}
        className={cn(
          "rh-glossary-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl bg-card shadow-2xl sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none sm:border-l sm:border-border",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-sm bg-border sm:hidden"
          aria-hidden="true"
        />
        <div className="flex items-start justify-between gap-3 px-4 pt-3 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2
              id={labelledBy}
              className="text-xl font-semibold text-foreground text-balance"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty sm:text-base">
              {subtitle}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DictionarySearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mt-4">
      <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      {/* 16px text so iPhones do not zoom into the field. */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
      />
    </div>
  );
}

/** One row of filters; scrolls sideways on phones instead of wrapping into a block of buttons. */
export function DictionaryFilters<T extends string>({
  options,
  selected,
  onSelect,
  label,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 no-scrollbar sm:-mx-6 sm:px-6"
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "min-h-[44px] shrink-0 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
              isSelected
                ? "bg-foreground font-semibold text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function DictionarySpeakButton({
  speaking,
  onClick,
  label,
}: {
  speaking: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={speaking}
      title={label}
      className={cn(
        "-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
        speaking
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <VolumeIcon className="h-5 w-5" />
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

/** Diacritic-insensitive substring highlighter for glossary entries. */
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
        className="rounded-xs bg-sapphire-soft px-0.5 font-semibold text-sapphire"
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

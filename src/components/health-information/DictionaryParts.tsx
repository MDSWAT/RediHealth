"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon, SearchIcon, VolumeIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Shared pieces of the two dictionary drawers (medical dictionary and Romanes glossary):
 * full screen on phones, a 36rem panel from the right on larger screens.
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
  // Focus moves to the close button, Escape closes, focus returns to the opener.
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
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
      className="hh-scrim fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={onClose}
    >
      <div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden bg-card shadow-2xl sm:max-w-xl sm:border-l sm:border-border",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="min-w-0">
            <h2 id={labelledBy} className="text-xl font-semibold text-foreground text-balance">
              {title}
            </h2>
            <p className="mt-0.5 text-base text-muted-foreground text-pretty">{subtitle}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
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
    <div role="group" aria-label={label} className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6">
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={cn(
              "min-h-10 shrink-0 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
              isSelected ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
        "-mr-2 -mt-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire",
        speaking ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <VolumeIcon className="h-5 w-5" />
    </button>
  );
}

"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface FilterDropdownProps {
  label: string;
  value: string;
  icon?: ReactNode;
  align?: "left" | "right";
  /** Renders a compact single-line value inside the trigger instead of a stacked field label. */
  hideLabel?: boolean;
  /** Renders `{label}: {value}` on a single horizontal baseline inside the trigger. */
  inlineLabel?: boolean;
  /** Keep the menu open when buttons inside are clicked (useful for multi-filter settings popovers). */
  keepOpenOnSelect?: boolean;
  id?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Shared pick-one filter folded into one horizontal trigger: names the active choice,
 * opens an elevated menu surface aligned with top-bar popovers, and restores trigger focus on close.
 */
export function FilterDropdown({
  label,
  value,
  icon,
  align = "left",
  hideLabel = false,
  inlineLabel = false,
  keepOpenOnSelect = false,
  id,
  className,
  children,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedPanelId = useId();
  const panelId = id ? `${id}-panel` : generatedPanelId;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const selected =
      rootRef.current?.querySelector<HTMLElement>(`[id="${panelId}"] [aria-pressed="true"]`) ??
      rootRef.current?.querySelector<HTMLElement>(`[id="${panelId}"] button`);
    selected?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelId]);

  return (
    <div
      ref={rootRef}
      className={cn("relative min-w-0", className)}
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${value}`}
        title={`${label}: ${value}`}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "press-row flex min-h-12 w-full max-w-full items-center gap-2 whitespace-nowrap rounded-(--radius-control) border px-3.5 py-2 text-left text-body shadow-(--shadow-card-rest) transition-[border-color,background-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-foreground/40 hover:bg-muted/70 hover:shadow-(--shadow-card-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open ? "border-sapphire bg-sapphire-soft/25 dark:bg-white/6" : "border-border-control bg-card",
        )}
      >
        {icon ? <span className="shrink-0 text-sapphire dark:text-sapphire-border">{icon}</span> : null}
        <span className="min-w-0 flex-1">
          {hideLabel ? (
            <span className="block truncate text-body font-semibold text-foreground">{value}</span>
          ) : inlineLabel ? (
            <span className="flex min-w-0 items-baseline gap-1.5 truncate text-body">
              <span className="hidden shrink-0 font-normal text-muted-foreground sm:inline">{label}:</span>
              <span className="min-w-0 truncate font-semibold text-foreground">{value}</span>
            </span>
          ) : (
            <>
              <span className="block truncate text-meta text-muted-foreground">{label}</span>
              <span className="block truncate text-meta font-semibold leading-tight text-foreground">{value}</span>
            </>
          )}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-[var(--dur-fast)] motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={panelId}
          className={cn(
            "fhs-enter absolute top-full z-30 mt-2 max-h-[min(70dvh,28rem)] w-[min(calc(100vw-2.5rem),24rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] rounded-2xl border border-border-control/80 bg-card/98 p-2 shadow-xl shadow-ink-950/10 backdrop-blur-md sm:w-88 dark:border-white/12 dark:bg-ink-900/98",
            align === "right" ? "right-0" : "left-0",
          )}
          onClick={(event) => {
            if (keepOpenOnSelect) return;
            if (!(event.target as HTMLElement).closest("button")) return;
            setOpen(false);
            triggerRef.current?.focus();
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** One row in a dropdown panel. The active option carries a surface tint and a check icon. */
export function FilterMenuOption({
  selected,
  onSelect,
  icon,
  description,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "press-row flex min-h-11 w-full max-w-full gap-3 rounded-lg px-3 py-2 text-left text-body transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        description ? "items-start" : "items-center whitespace-nowrap",
        selected
          ? "bg-rose-tint font-semibold text-rose-ink"
          : "font-medium text-foreground hover:bg-muted",
      )}
    >
      {icon ? (
        <span className={cn("shrink-0", selected ? "text-rose-ink" : "text-foreground/75", description && "mt-0.5")}>
          {icon}
        </span>
      ) : null}
      <span className={cn("min-w-0 flex-1", !description && "truncate")}>
        <span className="block leading-snug">{children}</span>
        {description ? (
          <span className="mt-0.5 block whitespace-normal text-meta font-normal leading-snug text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      {selected ? (
        <CheckIcon
          className={cn("h-4 w-4 shrink-0 text-rose-ink", description && "mt-0.5")}
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

/** Two-column sub-group inside a dropdown panel. */
export function FilterMenuGroup({ label, children }: { label: string; children?: ReactNode }) {
  const labelId = useId();
  return (
    <div role="group" aria-labelledby={labelId} className="border-t border-border pt-2 first:border-t-0 first:pt-0">
      <p id={labelId} className="px-3 pb-1 pt-1.5 text-meta font-medium text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-0.5">{children}</div>
    </div>
  );
}

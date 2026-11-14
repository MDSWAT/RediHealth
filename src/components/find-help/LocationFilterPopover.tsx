"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { CheckIcon, ChevronDownIcon, PinIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { SUPPORTED_COUNTRIES, type CountryCode } from "@/lib/countries";
import { REGIONAL_CITY_PRESETS, type CityPreset } from "@/lib/i18n/find-help-translations";

export interface LocationFilterPopoverProps {
  id?: string;
  defaultOpen?: boolean;
  label: string;
  displayValue: string;
  activeCountry: CountryCode;
  wholeCountrySelected: boolean;
  activeCityName: string | null;
  gpsActive: boolean;
  locating: boolean;
  countries: Record<CountryCode, string>;
  countryGroupLabel: string;
  cityGroupLabel: string;
  useMyLocationLabel: string;
  locatingLabel: string;
  wholeCountryOption: (countryName: string) => string;
  onSelectCountry: (country: CountryCode) => void;
  onSelectCity: (city: CityPreset & { country: CountryCode }) => void;
  onLocateUser: () => void;
}

/**
 * Hierarchical master-detail location picker for the Find Help toolbar:
 * GPS action at the top, country selector on the left, and live-updating whole-country
 * plus city presets on the right.
 */
export function LocationFilterPopover({
  id,
  defaultOpen = false,
  label,
  displayValue,
  activeCountry,
  wholeCountrySelected,
  activeCityName,
  gpsActive,
  locating,
  countries,
  countryGroupLabel,
  cityGroupLabel,
  useMyLocationLabel,
  locatingLabel,
  wholeCountryOption,
  onSelectCountry,
  onSelectCity,
  onLocateUser,
}: LocationFilterPopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gpsButtonRef = useRef<HTMLButtonElement>(null);
  const countryButtonRefs = useRef<Partial<Record<CountryCode, HTMLButtonElement | null>>>({});
  const pane2ContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoFocusOnOpenRef = useRef(false);

  const generatedPanelId = useId();
  const panelId = id ? `${id}-panel` : generatedPanelId;
  const countryGroupId = useId();
  const cityGroupId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    if (shouldAutoFocusOnOpenRef.current) {
      shouldAutoFocusOnOpenRef.current = false;
      const target = gpsActive
        ? gpsButtonRef.current
        : (countryButtonRefs.current[activeCountry] ?? gpsButtonRef.current);
      target?.focus({ preventScroll: true });
    }

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, activeCountry, gpsActive]);

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleCountryKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextCountry = SUPPORTED_COUNTRIES[(index + 1) % SUPPORTED_COUNTRIES.length];
      countryButtonRefs.current[nextCountry]?.focus();
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prevCountry = SUPPORTED_COUNTRIES[(index - 1 + SUPPORTED_COUNTRIES.length) % SUPPORTED_COUNTRIES.length];
      countryButtonRefs.current[prevCountry]?.focus();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      pane2ContainerRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }

  function handlePane2KeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      countryButtonRefs.current[activeCountry]?.focus();
    }
  }

  const cities = REGIONAL_CITY_PRESETS[activeCountry] ?? [];

  return (
    <div
      ref={rootRef}
      className="relative min-w-0"
      onBlur={(event) => {
        if (open && !rootRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${displayValue}`}
        onClick={() => {
          if (!open) {
            shouldAutoFocusOnOpenRef.current = true;
          }
          setOpen((prev) => !prev);
        }}
        className={cn(
          "min-h-12 w-full max-w-full press-row flex items-center gap-2.5 whitespace-nowrap rounded-xl border px-3.5 text-left transition-[border-color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire hover:bg-sapphire-soft/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          open ? "border-sapphire bg-sapphire-soft/25 dark:bg-white/6" : "border-border-control bg-card",
        )}
      >
        <PinIcon className="h-5 w-5 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 truncate text-sm">
          <span className="hidden shrink-0 text-muted-foreground sm:inline">{label}:</span>
          <span className="min-w-0 truncate font-semibold text-foreground">{displayValue}</span>
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
          tabIndex={-1}
          className="popover-in absolute left-0 top-full z-30 mt-2 max-h-[min(78dvh,30rem)] w-[min(calc(100vw-3.75rem),29rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] rounded-2xl border border-border-control/80 bg-card shadow-(--shadow-card-hover) dark:border-white/12 dark:bg-ink-900"
        >
          <div className="border-b border-border/80 p-2">
            <button
              ref={gpsButtonRef}
              type="button"
              aria-pressed={gpsActive}
              onClick={() => {
                onLocateUser();
                closeAndFocusTrigger();
              }}
              className={cn(
                "press-row flex min-h-11 w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                gpsActive
                  ? "bg-sapphire-soft font-semibold text-sapphire dark:bg-white/12 dark:text-paper"
                  : "font-medium text-foreground hover:bg-muted",
              )}
            >
              <PinIcon className="h-4.5 w-4.5 shrink-0 text-sapphire dark:text-sapphire-border" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{locating ? locatingLabel : useMyLocationLabel}</span>
              {gpsActive ? <CheckIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-paper" aria-hidden="true" /> : null}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[11.5rem_minmax(0,1fr)]">
            <div
              role="group"
              aria-labelledby={countryGroupId}
              className="border-b border-border/80 bg-surface-subtle/65 p-2 sm:border-b-0 sm:border-r dark:bg-ink-950/45"
            >
              <p id={countryGroupId} className="px-2.5 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">
                {countryGroupLabel}
              </p>
              <div className="flex flex-wrap gap-1 sm:flex-col sm:flex-nowrap sm:gap-0.5">
                {SUPPORTED_COUNTRIES.map((country, index) => {
                  const selected = activeCountry === country;
                  return (
                    <button
                      key={country}
                      ref={(el) => {
                        countryButtonRefs.current[country] = el;
                      }}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        onSelectCountry(country);
                        if (selected) {
                          closeAndFocusTrigger();
                        }
                      }}
                      onKeyDown={(event) => handleCountryKeyDown(event, index)}
                      className={cn(
                        "press-row flex min-h-11 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-full",
                        selected
                          ? "bg-card font-semibold text-sapphire shadow-2xs ring-1 ring-sapphire/25 dark:bg-ink-800 dark:text-paper dark:ring-sapphire-border/35"
                          : "font-medium text-foreground hover:bg-card/80 dark:hover:bg-white/6",
                      )}
                    >
                      <span className="truncate">{countries[country]}</span>
                      {selected ? (
                        <CheckIcon className="hidden h-4 w-4 shrink-0 text-sapphire dark:text-paper sm:block" aria-hidden="true" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div role="group" aria-labelledby={cityGroupId} className="p-2">
              <div key={activeCountry} ref={pane2ContainerRef} className="swap-in">
                <p id={cityGroupId} className="px-2.5 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">
                  {cityGroupLabel}
                </p>

                <button
                  type="button"
                  aria-pressed={wholeCountrySelected}
                  onClick={() => {
                    onSelectCountry(activeCountry);
                    closeAndFocusTrigger();
                  }}
                  onKeyDown={handlePane2KeyDown}
                  className={cn(
                    "press-row mb-1 flex min-h-11 w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    wholeCountrySelected
                      ? "bg-sapphire-soft font-semibold text-sapphire dark:bg-white/12 dark:text-paper"
                      : "font-medium text-foreground hover:bg-muted",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{wholeCountryOption(countries[activeCountry])}</span>
                  {wholeCountrySelected ? (
                    <CheckIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-paper" aria-hidden="true" />
                  ) : null}
                </button>

                <div className="grid grid-cols-2 gap-0.5">
                  {cities.map((city) => {
                    const citySelected = activeCityName === city.name && !gpsActive;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        aria-pressed={citySelected}
                        onClick={() => {
                          onSelectCity({ ...city, country: activeCountry });
                          closeAndFocusTrigger();
                        }}
                        onKeyDown={handlePane2KeyDown}
                        className={cn(
                          "press-row flex min-h-11 w-full items-center justify-between gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          citySelected
                            ? "bg-sapphire-soft font-semibold text-sapphire dark:bg-white/12 dark:text-paper"
                            : "font-medium text-foreground hover:bg-muted",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{city.name}</span>
                        {citySelected ? (
                          <CheckIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-paper" aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

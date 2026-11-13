"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { languages, type Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";

export type LanguageSelectorProps = {
  className?: string;
  variant?: "default" | "drawer";
  tone?: "default" | "light";
  /** Pairs the drawer trigger cleanly in a 2-column grid while letting the open menu span both columns. */
  gridPaired?: boolean;
  /** Renders the drawer selector as a progressive-disclosure Settings row inside a grouped card. */
  listRow?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onNavigate?: () => void;
};

export const languageSelectorCopy: Record<Lang, { label: string; romaniNote: string }> = {
  ru: {
    label: "Язык сайта",
    romaniNote: "Объяснения медицинских терминов также доступны на языке романи в словаре раздела «Узнать».",
  },

  ro: {
    label: "Limba site-ului",
    romaniNote: "Termenii medicali sunt explicați și în limba romani, în glosarul din secțiunea Află.",
  },
  en: {
    label: "Site language",
    romaniNote: "Medical terms are also explained in Romani, in the glossary under Learn.",
  },
  sq: {
    label: "Gjuha e faqes",
    romaniNote: "Termat mjekësorë shpjegohen edhe në gjuhën rome, te fjalori në seksionin Mëso.",
  },
  it: {
    label: "Lingua del sito",
    romaniNote: "I termini medici sono spiegati anche in lingua romaní, nel glossario della sezione Scopri.",
  },
  hr: {
    label: "Jezik stranice",
    romaniNote: "Medicinski pojmovi objašnjeni su i na romskom jeziku u rječniku u odjeljku Saznaj.",
  },
  rom: {
    label: "Chib e rigaki",
    romaniNote: "Le doktorikane vorbe si shpjegime vi pe romani chib and-o alavari ki rig Sikljov.",
  },
};

const ISO_BADGE: Record<Lang, string> = {




"ru": "RU",

  ro: "RO",
  en: "EN",
  sq: "SQ",
  it: "IT",
  hr: "HR",
  rom: "ROM",
};

// Romanian first (the site's default language), then the others in a fixed order on every page.
const LANGUAGE_ORDER: Lang[] = ["ro", "en", "hr", "rom", "sq", "it", "ru"];
const orderedLanguages = [...languages].sort(
  (a, b) => LANGUAGE_ORDER.indexOf(a.code) - LANGUAGE_ORDER.indexOf(b.code),
);

/**
 * Language choice. Each option is a real link to the same page in that language
 * (hreflang, and the name is spoken in its own language); a click keeps the query and hash.
 * Both variants are one trigger that opens the same list; the current language is bold and ticked.
 * Desktop/tablet: a compact ISO trigger with the list in a popover.
 * Phone menu: one full-width 44px row showing the current language name; the list opens in the
 * flow below it, so the closed menu spends a single row on language.
 */
export function LanguageSelector({
  className,
  variant = "default",
  tone = "default",
  gridPaired = false,
  listRow = false,
  open,
  onOpenChange,
  onNavigate,
}: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname() || "/";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const isOpenRef = useRef(isOpen);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const setOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof next === "function" ? next(isOpenRef.current) : next;
      isOpenRef.current = resolved;
      if (!isControlled) {
        setUncontrolledOpen(resolved);
      }
      onOpenChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const focusRafRef = useRef<number>(0);
  const pointerOutsideRef = useRef(false);
  const panelId = useId();

  const activeIndex = Math.max(
    0,
    orderedLanguages.findIndex((l) => l.code === lang),
  );
  const activeLang = orderedLanguages[activeIndex] || languages[0];
  const copy = languageSelectorCopy[lang] ?? languageSelectorCopy.ro;
  const glossaryHref = withLangPrefix("/health-information", lang);

  useEffect(() => {
    return () => {
      if (focusRafRef.current !== 0) {
        window.cancelAnimationFrame(focusRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      pointerOutsideRef.current = false;
      return;
    }
    function handlePointerDown(event: PointerEvent) {
      const outside = Boolean(rootRef.current && !rootRef.current.contains(event.target as Node));
      pointerOutsideRef.current = outside;
      if (outside && variant !== "drawer") {
        setOpen(false);
      }
    }
    function handleClick(event: Event) {
      pointerOutsideRef.current = false;
      if (variant === "drawer" && rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handlePointerEnd() {
      window.requestAnimationFrame(() => {
        pointerOutsideRef.current = false;
      });
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Capture phase and stopped here: the first Escape closes only this list, not the menu around it.
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("click", handleClick);
    document.addEventListener("pointercancel", handlePointerEnd);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("pointercancel", handlePointerEnd);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, variant, setOpen]);

  function focusOption(index: number) {
    const count = orderedLanguages.length;
    if (count === 0) return;
    const normalized = ((index % count) + count) % count;
    if (focusRafRef.current !== 0) {
      window.cancelAnimationFrame(focusRafRef.current);
    }
    focusRafRef.current = window.requestAnimationFrame(() => {
      focusRafRef.current = 0;
      optionRefs.current[normalized]?.focus();
    });
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const wasOpen = isOpenRef.current;
      setOpen(true);
      focusOption(wasOpen ? 0 : activeIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const wasOpen = isOpenRef.current;
      setOpen(true);
      focusOption(wasOpen ? orderedLanguages.length - 1 : activeIndex);
    }
  }

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLUListElement>) {
    const currentIdx = optionRefs.current.findIndex((el) => el === document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption((currentIdx === -1 ? activeIndex : currentIdx) + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption((currentIdx === -1 ? activeIndex : currentIdx) - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(orderedLanguages.length - 1);
    }
  }

  function handleSelect(event: MouseEvent<HTMLAnchorElement>, code: Lang) {
    // Plain clicks go through setLang so the query string and hash survive; modified clicks open the link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setOpen(false);
    onNavigate?.();
    setLang(code);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    // When clicking a link below the in-flow drawer tray, let the click finish before collapsing so nothing shifts under the pointer.
    if (variant === "drawer" && pointerOutsideRef.current) return;
    // Tabbing away closes the list. No next target (a tap in Safari, which does not focus links) is not leaving.
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) setOpen(false);
  }

  const chevronMotion =
    "shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none";

  const panelBody = (
    <>
      <ul aria-label={copy.label} onKeyDown={handleListKeyDown} className="space-y-0.5">
        {orderedLanguages.map((item, idx) => {
          const isSelected = item.code === lang;
          return (
            <li key={item.code}>
              <a
                ref={(el) => {
                  optionRefs.current[idx] = el;
                }}
                href={withLangPrefix(pathname, item.code)}
                hrefLang={item.code}
                lang={item.code}
                aria-current={isSelected ? "true" : undefined}
                onClick={(event) => handleSelect(event, item.code)}
                className={cn(
                  "flex min-h-11 w-full max-w-full items-center justify-between gap-2 whitespace-nowrap rounded-(--radius-control) px-3 py-2 text-body leading-snug press-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                  isSelected
                    ? "bg-sapphire-soft font-semibold text-sapphire dark:bg-white/10 dark:text-paper"
                    : "text-foreground hover:bg-muted dark:text-paper dark:hover:bg-white/5",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {isSelected ? <CheckIcon className="h-5 w-5 shrink-0" /> : null}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-1.5 border-t border-border pt-1.5 dark:border-white/10">
        <Link
          href={glossaryHref}
          onClick={() => {
            setOpen(false);
            onNavigate?.();
          }}
          className="flex min-h-11 max-w-full items-center justify-between gap-3 whitespace-nowrap rounded-(--radius-control) px-3 py-2 text-body leading-snug text-muted-foreground press-row hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper dark:text-mist dark:hover:bg-white/5 dark:hover:text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
        >
          <span className="min-w-0 truncate">{copy.romaniNote}</span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-sapphire dark:text-paper" />
        </Link>
      </div>
    </>
  );

  if (variant === "drawer" && listRow) {
    return (
      <div ref={rootRef} onBlur={handleBlur} className={cn("w-full text-left", className)}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={cn(
            "group flex min-h-12 w-full max-w-full items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-left press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper",
            isOpen
              ? "bg-sapphire/[0.06] dark:bg-white/[0.07]"
              : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
          )}
        >
          <GlobeIcon
            className={cn(
              "h-4.5 w-4.5 shrink-0 transition-colors duration-(--dur-fast)",
              isOpen
                ? "text-sapphire dark:text-sapphire-border"
                : "text-ink-900/50 group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper",
            )}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate text-[15.5px] font-medium leading-snug text-foreground dark:text-paper">
            {copy.label}
          </span>
          <span
            lang={activeLang.code}
            className="shrink-0 whitespace-nowrap text-sm font-medium text-muted-foreground dark:text-mist"
          >
            {activeLang.label}
          </span>
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 shrink-0 text-ink-900/35 dark:text-paper/35",
              chevronMotion,
              isOpen && "rotate-180 text-sapphire dark:text-paper",
            )}
          />
        </button>

        <div
          id={panelId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden" inert={!isOpen}>
            <div className="px-1 pt-1.5 pb-3">
              <ul aria-label={copy.label} onKeyDown={handleListKeyDown} className="grid grid-cols-2 gap-1.5">
                {orderedLanguages.map((item, idx) => {
                  const isSelected = item.code === lang;
                  return (
                    <li key={item.code}>
                      <a
                        ref={(el) => {
                          optionRefs.current[idx] = el;
                        }}
                        href={withLangPrefix(pathname, item.code)}
                        hrefLang={item.code}
                        lang={item.code}
                        aria-current={isSelected ? "true" : undefined}
                        onClick={(event) => handleSelect(event, item.code)}
                        className={cn(
                          "flex min-h-11 max-w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm leading-snug press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper",
                          isSelected
                            ? "border-sapphire bg-sapphire/[0.06] font-semibold text-sapphire dark:border-paper dark:bg-white/15 dark:text-paper"
                            : "border-ink-900/12 bg-white text-foreground hover:bg-ink-900/[0.03] dark:border-white/12 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {isSelected ? <CheckIcon className="h-4 w-4 shrink-0" /> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={glossaryHref}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="mt-2 flex min-h-11 items-center justify-between max-w-full gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs leading-snug text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-ink-900/[0.035] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:text-mist dark:hover:bg-white/5 dark:hover:text-paper dark:focus-visible:ring-paper"
              >
                <span className="min-w-0 truncate">{copy.romaniNote}</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-sapphire dark:text-paper" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "drawer") {
    return (
      <div
        ref={rootRef}
        onBlur={handleBlur}
        className={cn(gridPaired ? "contents" : "w-full text-left", className)}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          className={cn(
            "flex w-full max-w-full items-center gap-2 whitespace-nowrap text-left text-foreground press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-paper dark:focus-visible:ring-paper",
            gridPaired
              ? "order-1 min-h-11 rounded-xl border px-3 py-1.5 text-[13.5px] font-medium bg-muted/40 hover:bg-muted/75 dark:bg-white/5 dark:hover:bg-white/10"
              : "min-h-11 rounded-(--radius-control) border bg-card px-3.5 py-2 text-body font-semibold hover:bg-muted dark:bg-ink-900 dark:hover:bg-white/10",
            isOpen
              ? "border-sapphire bg-card dark:border-paper dark:bg-ink-900"
              : gridPaired
                ? "border-border/75 dark:border-white/12"
                : "border-border-control dark:border-white/40",
          )}
        >
          <GlobeIcon className={cn("shrink-0 text-muted-foreground dark:text-mist", gridPaired ? "h-4.5 w-4.5" : "h-5 w-5")} />
          <span className="sr-only">{copy.label}: </span>
          <span lang={activeLang.code} className="min-w-0 flex-1 truncate whitespace-nowrap">
            {activeLang.label}
          </span>
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground dark:text-mist",
              gridPaired ? "h-4.5 w-4.5" : "h-5 w-5",
              chevronMotion,
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen ? (
          <div
            id={panelId}
            className={cn(
              "fhs-enter rounded-(--radius-surface) border border-border bg-card p-1.5 dark:border-white/10 dark:bg-ink-800",
              gridPaired ? "order-3 col-span-2 mt-0.5" : "mt-2",
            )}
          >
            {panelBody}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} onBlur={handleBlur} className={cn("relative inline-block text-left", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={cn(
          "inline-flex min-h-11 min-w-20 max-w-full items-center justify-between gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
          tone === "light"
            ? "text-paper/85 hover:bg-white/10 hover:text-paper focus-visible:ring-paper/70"
            : "text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
        )}
      >
        <GlobeIcon className={cn("h-4 w-4 shrink-0", tone === "light" ? "text-paper/75" : "text-muted-foreground dark:text-mist")} />
        <span className="sr-only">
          {copy.label}: {activeLang.label},{" "}
        </span>
        <span className="text-meta font-semibold tracking-wide">{ISO_BADGE[activeLang.code]}</span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4",
            chevronMotion,
            tone === "light" ? "text-paper/65" : "text-muted-foreground dark:text-mist",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        inert={!isOpen}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-stone-200/90 bg-card/98 p-2 shadow-xl shadow-ink-950/12 backdrop-blur-md dark:border-stone-800 dark:bg-ink-900/98 dark:shadow-black/45",
          "transition-[opacity,translate,visibility] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
          isOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        {panelBody}
      </div>
    </div>
  );
}

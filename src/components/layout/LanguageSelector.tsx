"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
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
  onNavigate?: () => void;
};

export const languageSelectorCopy: Record<Lang, { label: string; romaniNote: string }> = {
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
  ro: "RO",
  en: "EN",
  sq: "SQ",
  it: "IT",
  hr: "HR",
  rom: "ROM",
};

// Romanian first (the site's default language), then the others in a fixed order on every page.
const LANGUAGE_ORDER: Lang[] = ["ro", "en", "hr", "rom", "sq", "it"];
const orderedLanguages = [...languages].sort(
  (a, b) => LANGUAGE_ORDER.indexOf(a.code) - LANGUAGE_ORDER.indexOf(b.code),
);

/**
 * Language choice. Each option is a real link to the same page in that language
 * (hreflang, and the name is spoken in its own language); a click keeps the query and hash.
 * Desktop/tablet: a compact fixed-width ISO trigger with roving keyboard focus.
 * Phone menu: a 2-column grid with sapphire active indicators.
 */
export function LanguageSelector({
  className,
  variant = "default",
  tone = "default",
  onNavigate,
}: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const focusRafRef = useRef<number>(0);
  const panelId = useId();
  const labelId = useId();

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
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
      setOpen(true);
      focusOption(open ? 0 : activeIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      focusOption(open ? orderedLanguages.length - 1 : activeIndex);
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

  if (variant === "drawer") {
    return (
      <div role="group" aria-labelledby={labelId} className={cn("space-y-2.5", className)}>
        <p id={labelId} className="text-sm font-semibold text-foreground">
          {copy.label}
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {orderedLanguages.map((item) => {
            const isSelected = item.code === lang;
            return (
              <li key={item.code}>
                <a
                  href={withLangPrefix(pathname, item.code)}
                  hrefLang={item.code}
                  lang={item.code}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={(event) => handleSelect(event, item.code)}
                  className={cn(
                    "flex min-h-[48px] items-center justify-between gap-2 rounded-lg border px-3 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-sapphire/40 bg-sapphire-soft font-semibold text-sapphire"
                      : "border-border bg-card font-medium text-foreground/85 hover:bg-muted",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider",
                        isSelected
                          ? "bg-sapphire text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ISO_BADGE[item.code]}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-sapphire" /> : null}
                </a>
              </li>
            );
          })}
        </ul>
        <Link
          href={glossaryHref}
          onClick={() => onNavigate?.()}
          className="group flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-subtle/60 px-3.5 py-2.5 text-sm leading-snug text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:border-sapphire/35 hover:bg-sapphire-soft/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span>{copy.romaniNote}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 text-sapphire transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex min-h-11 min-w-[5rem] items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
          tone === "light"
            ? "text-paper/85 hover:bg-white/10 hover:text-paper focus-visible:ring-paper/70"
            : "text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring",
        )}
      >
        <GlobeIcon className={cn("h-4 w-4 shrink-0", tone === "light" ? "text-paper/75" : "text-muted-foreground")} />
        <span className="sr-only">
          {copy.label}: {activeLang.label},{" "}
        </span>
        <span className="font-mono text-xs font-semibold tracking-wider tabular-nums">
          {ISO_BADGE[activeLang.code]}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
            tone === "light" ? "text-paper/65" : "text-muted-foreground",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card p-1.5 text-foreground shadow-(--shadow-card-hover)",
          "transition-[opacity,translate,visibility] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
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
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2.5 text-sm transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isSelected
                      ? "bg-sapphire-soft font-semibold text-sapphire"
                      : "font-medium text-foreground/85 hover:bg-muted",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex min-w-[2.5rem] shrink-0 items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider",
                        isSelected
                          ? "bg-sapphire text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ISO_BADGE[item.code]}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-sapphire" /> : null}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="mt-1.5 border-t border-border pt-1.5">
          <Link
            href={glossaryHref}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className="group flex min-h-11 items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs leading-relaxed text-muted-foreground transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span>{copy.romaniNote}</span>
            <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 text-sapphire transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
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
 * Both variants are one trigger that opens the same list; the current language is bold and ticked.
 * Desktop/tablet: a compact ISO trigger with the list in a popover.
 * Phone menu: one full-width 44px row showing the current language name; the list opens in the
 * flow below it, so the closed menu spends a single row on language.
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
    if (!open) {
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
  }, [open, variant]);

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
                  "flex min-h-11 w-full items-center justify-between gap-2 rounded-(--radius-control) px-3 py-2 text-body leading-snug press-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
                  isSelected
                    ? "bg-sapphire-soft font-semibold text-sapphire dark:bg-white/10 dark:text-paper"
                    : "text-foreground hover:bg-muted dark:text-paper dark:hover:bg-white/5",
                )}
              >
                <span className="min-w-0 break-words">{item.label}</span>
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
          className="flex min-h-11 items-center justify-between gap-3 rounded-(--radius-control) px-3 py-2 text-body leading-snug text-muted-foreground press-row hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper dark:text-mist dark:hover:bg-white/5 dark:hover:text-paper transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none"
        >
          <span>{copy.romaniNote}</span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-sapphire dark:text-paper" />
        </Link>
      </div>
    </>
  );

  if (variant === "drawer") {
    return (
      <div ref={rootRef} onBlur={handleBlur} className={cn("w-full text-left", className)}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className={cn(
            "flex min-h-11 w-full items-center gap-2.5 rounded-(--radius-control) border bg-card px-3.5 py-2 text-left text-body font-semibold text-foreground press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-ink-900 dark:text-paper dark:hover:bg-white/10 dark:focus-visible:ring-paper",
            open ? "border-sapphire dark:border-paper" : "border-border-control dark:border-white/40",
          )}
        >
          <GlobeIcon className="h-5 w-5 shrink-0 text-muted-foreground dark:text-mist" />
          <span className="sr-only">{copy.label}: </span>
          <span lang={activeLang.code} className="min-w-0 flex-1 break-words">
            {activeLang.label}
          </span>
          <ChevronDownIcon
            className={cn("h-5 w-5 text-muted-foreground dark:text-mist", chevronMotion, open && "rotate-180")}
          />
        </button>

        {open ? (
          <div
            id={panelId}
            className="fhs-enter mt-2 rounded-(--radius-surface) border border-border bg-card p-1.5 dark:border-white/10 dark:bg-ink-800"
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
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex min-h-11 min-w-20 items-center justify-between gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2",
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
            open && "rotate-180",
          )}
        />
      </button>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-72 rounded-(--radius-surface) border border-border bg-card p-1.5 shadow-(--shadow-card-hover) dark:border-white/10 dark:bg-ink-800",
          "transition-[opacity,translate,visibility] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0",
        )}
      >
        {panelBody}
      </div>
    </div>
  );
}

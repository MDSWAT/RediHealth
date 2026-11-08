"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import { languages, type Lang } from "@/lib/i18n/translations";
import { cn } from "@/lib/cn";

export type LanguageSelectorProps = {
  className?: string;
  variant?: "default" | "drawer";
  tone?: "default" | "light";
};

const selectorCopy: Record<Lang, { label: string; romaniNote: string }> = {
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
};

/**
 * Language choice. Each option is a real link to the same page in that language
 * (hreflang, and the name is spoken in its own language); a click keeps the query and hash.
 * Desktop: a small disclosure under the button. Phone menu: a 2 x 2 grid.
 */
export function LanguageSelector({
  className,
  variant = "default",
  tone = "default",
}: LanguageSelectorProps) {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const labelId = useId();

  const activeLang = languages.find((l) => l.code === lang) || languages[0];
  const copy = selectorCopy[lang] ?? selectorCopy.ro;

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

  function handleSelect(event: MouseEvent<HTMLAnchorElement>, code: Lang) {
    // Plain clicks go through setLang so the query string and hash survive; modified clicks open the link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    setOpen(false);
    setLang(code);
  }

  if (variant === "drawer") {
    return (
      <div role="group" aria-labelledby={labelId} className={cn("space-y-2.5", className)}>
        <p id={labelId} className="text-sm font-semibold text-foreground">
          {copy.label}
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {languages.map((item) => {
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
                    "flex min-h-[48px] items-center justify-between gap-2 rounded-lg border px-3.5 text-base transition-colors duration-(--dur-fast)",
                    isSelected
                      ? "border-foreground/60 bg-card font-semibold text-foreground"
                      : "border-border bg-card font-medium text-foreground/85 hover:bg-muted"
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected ? <CheckIcon className="h-5 w-5 shrink-0 text-foreground" /> : null}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="text-sm leading-relaxed text-muted-foreground">{copy.romaniNote}</p>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block text-left", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2",
          tone === "light"
            ? "text-paper/80 hover:bg-white/[0.07] hover:text-paper focus-visible:ring-paper/70"
            : "text-foreground/80 hover:bg-muted hover:text-foreground focus-visible:ring-ring"
        )}
      >
        <GlobeIcon className={cn("h-4 w-4", tone === "light" ? "text-paper/70" : "text-muted-foreground")} />
        <span className="sr-only">{copy.label}: </span>
        <span>{activeLang.label}</span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 transition-transform duration-(--dur-fast) ease-(--ease-out-calm)",
            tone === "light" ? "text-paper/60" : "text-muted-foreground",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-1.5 text-foreground shadow-lg",
          "transition-[opacity,translate,visibility] duration-(--dur-fast) ease-(--ease-out-calm)",
          open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
        )}
      >
        <ul aria-label={copy.label}>
          {languages.map((item) => {
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
                    "flex min-h-[44px] w-full items-center justify-between rounded-lg px-3 text-sm transition-colors duration-(--dur-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isSelected ? "bg-muted font-semibold text-foreground" : "font-medium text-foreground/85 hover:bg-muted"
                  )}
                >
                  <span>{item.label}</span>
                  {isSelected ? <CheckIcon className="h-4 w-4 shrink-0 text-foreground" /> : null}
                </a>
              </li>
            );
          })}
        </ul>

        <p className="mt-1.5 border-t border-border px-3 pb-1.5 pt-2.5 text-xs leading-relaxed text-muted-foreground">
          {copy.romaniNote}
        </p>
      </div>
    </div>
  );
}

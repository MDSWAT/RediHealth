"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import {
  resetComfortPreferences,
  useCalmMotion,
  useReadingLevel,
  useTextScale,
  type TextScale,
} from "@/lib/comfort-preferences";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";

type ComfortCopy = {
  buttonLabel: string;
  title: string;
  textSizeLabel: string;
  scaleNormal: string;
  scaleLarge: string;
  scaleXl: string;
  explanationLabel: string;
  simpleLabel: string;
  completeLabel: string;
  motionLabel: string;
  calmMotionToggle: string;
  calmMotionHelp: string;
  reset: string;
  close: string;
};

export const COMFORT_COPY: Record<Lang, ComfortCopy> = {
  ro: {
    buttonLabel: "Scris și confort",
    title: "Citește mai ușor",
    textSizeLabel: "Mărimea scrisului",
    scaleNormal: "Obișnuit",
    scaleLarge: "Mare",
    scaleXl: "Foarte mare",
    explanationLabel: "Mod de citire",
    simpleLabel: "Pe scurt",
    completeLabel: "Detaliat",
    motionLabel: "Mișcări pe ecran",
    calmMotionToggle: "Oprește elementele care se mișcă",
    calmMotionHelp: "Paginile și știrile rămân nemișcate, fără efecte de derulare.",
    reset: "Revino la setările obișnuite",
    close: "Închide",
  },
  en: {
    buttonLabel: "Text and comfort",
    title: "Easier reading",
    textSizeLabel: "Text size",
    scaleNormal: "Normal",
    scaleLarge: "Large",
    scaleXl: "Extra large",
    explanationLabel: "Reading mode",
    simpleLabel: "Easy",
    completeLabel: "Detailed",
    motionLabel: "Screen motion",
    calmMotionToggle: "Stop moving screen elements",
    calmMotionHelp: "Keeps news tickers and sections still while you read.",
    reset: "Reset to standard settings",
    close: "Close",
  },
  sq: {
    buttonLabel: "Shkrimi dhe leximi",
    title: "Lexim më i lehtë",
    textSizeLabel: "Madhësia e shkrimit",
    scaleNormal: "Normale",
    scaleLarge: "E madhe",
    scaleXl: "Shumë e madhe",
    explanationLabel: "Mënyra e leximit",
    simpleLabel: "Shkurt",
    completeLabel: "Detajuar",
    motionLabel: "Lëvizjet në ekran",
    calmMotionToggle: "Ndalo elementet që lëvizin",
    calmMotionHelp: "Lajmet dhe faqet qëndrojnë të qeta ndërsa lexon.",
    reset: "Kthe cilësimet fillestare",
    close: "Mbyll",
  },
  it: {
    buttonLabel: "Testo e lettura",
    title: "Leggi più facilmente",
    textSizeLabel: "Grandezza del testo",
    scaleNormal: "Normale",
    scaleLarge: "Grande",
    scaleXl: "Molto grande",
    explanationLabel: "Modalità di lettura",
    simpleLabel: "Semplice",
    completeLabel: "Dettagliato",
    motionLabel: "Movimenti sullo schermo",
    calmMotionToggle: "Ferma gli elementi in movimento",
    calmMotionHelp: "Notizie e sezioni restano ferme mentre leggi.",
    reset: "Ripristina impostazioni iniziali",
    close: "Chiudi",
  },
  hr: {
    buttonLabel: "Tekst i čitanje",
    title: "Lakše čitanje",
    textSizeLabel: "Veličina slova",
    scaleNormal: "Uobičajeno",
    scaleLarge: "Veliko",
    scaleXl: "Vrlo veliko",
    explanationLabel: "Način čitanja",
    simpleLabel: "Ukratko",
    completeLabel: "Detaljno",
    motionLabel: "Pokreti na zaslonu",
    calmMotionToggle: "Zaustavi pokretne elemente",
    calmMotionHelp: "Vijesti i stranice ostaju mirne dok čitaš.",
    reset: "Vrati zadane postavke",
    close: "Zatvori",
  },
  rom: {
    buttonLabel: "Lekhipen thaj dikhipen",
    title: "Mai lokho drabaripe",
    textSizeLabel: "Baripen le alfabetosko",
    scaleNormal: "Normalno",
    scaleLarge: "Baro",
    scaleXl: "But baro",
    explanationLabel: "Sar drabares",
    simpleLabel: "Skurto",
    completeLabel: "Detaliime",
    motionLabel: "Miškipen pe ekrano",
    calmMotionToggle: "Ačhav so miškisajvel",
    calmMotionHelp: "E nevimata thaj e riga ačhon phandade kana drabares.",
    reset: "Risar kal purane setimata",
    close: "Phandav",
  },
  ru: {
    buttonLabel: "Текст и чтение",
    title: "Удобнее читать",
    textSizeLabel: "Размер текста",
    scaleNormal: "Обычный",
    scaleLarge: "Крупный",
    scaleXl: "Очень крупный",
    explanationLabel: "Режим чтения",
    simpleLabel: "Коротко",
    completeLabel: "Подробно",
    motionLabel: "Движение на экране",
    calmMotionToggle: "Остановить движущиеся элементы",
    calmMotionHelp: "Строка новостей и блоки остаются неподвижными при чтении.",
    reset: "Сбросить настройки",
    close: "Закрыть",
  },
};

type ComfortMenuProps = {
  variant?: "header" | "drawer";
  tone?: "light" | "default";
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDone?: () => void;
};

export function ComfortMenu({
  variant = "header",
  tone = "default",
  collapsible = false,
  open,
  onOpenChange,
  onDone,
}: ComfortMenuProps) {
  const { lang } = useLanguage();
  const copy = COMFORT_COPY[lang] ?? COMFORT_COPY.ro;
  const [textScale, setTextScale] = useTextScale();
  const [readingLevel, setReadingLevel] = useReadingLevel();
  const [calmMotion, setCalmMotion] = useCalmMotion();
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

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const isCustomized = textScale !== "normal" || calmMotion || readingLevel === "complete";
  const hasComfortBoost = textScale !== "normal" || calmMotion;

  useEffect(() => {
    if (!isOpen || variant !== "header") return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, variant, setOpen]);

  useEffect(() => {
    if (!isOpen || variant !== "drawer" || !collapsible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen, variant, collapsible, setOpen]);

  const scaleOptions: { value: TextScale; glyph: string; label: string }[] = [
    { value: "normal", glyph: "A", label: copy.scaleNormal },
    { value: "large", glyph: "A+", label: copy.scaleLarge },
    { value: "xl", glyph: "A++", label: copy.scaleXl },
  ];

  const controlsBody = (
    <div className="space-y-3.5 text-left">
      <div style={{ "--i": 0 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className="text-xs font-semibold text-muted-foreground dark:text-mist">{copy.textSizeLabel}</p>
        <div role="group" aria-label={copy.textSizeLabel} className="mt-1.5 grid grid-cols-3 gap-1.5">
          {scaleOptions.map((option) => {
            const active = textScale === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTextScale(option.value)}
                className={cn(
                  "press-row flex min-h-12 min-w-0 flex-col items-center justify-center whitespace-nowrap rounded-xl border px-1.5 py-1.5 text-center transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  active
                    ? "border-sapphire bg-sapphire-soft/75 text-sapphire shadow-xs ring-1 ring-sapphire/20 dark:border-paper dark:bg-white/15 dark:text-paper dark:ring-white/20"
                    : "border-border-control bg-muted/35 text-foreground hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                )}
              >
                <span className="text-sm font-bold leading-none tabular-nums">{option.glyph}</span>
                <span className="mt-1 max-w-full truncate text-[11px] font-medium leading-tight">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ "--i": 1 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className="text-xs font-semibold text-muted-foreground dark:text-mist">{copy.explanationLabel}</p>
        <div role="group" aria-label={copy.explanationLabel} className="mt-1.5 grid grid-cols-2 gap-1.5">
          {(
            [
              { value: "simple", label: copy.simpleLabel },
              { value: "complete", label: copy.completeLabel },
            ] as const
          ).map((option) => {
            const active = readingLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setReadingLevel(option.value)}
                className={cn(
                  "press-row flex min-h-12 min-w-0 items-center justify-center whitespace-nowrap rounded-xl border px-2.5 py-1.5 text-center text-[13px] font-semibold leading-tight transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  active
                    ? "border-sapphire bg-sapphire-soft/75 text-sapphire shadow-xs ring-1 ring-sapphire/20 dark:border-paper dark:bg-white/15 dark:text-paper dark:ring-white/20"
                    : "border-border-control bg-muted/35 text-foreground hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                )}
              >
                <span className="min-w-0 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ "--i": 2 } as CSSProperties} className={cn(isOpen && "list-in", "pt-0.5")}>
        <button
          type="button"
          role="switch"
          aria-checked={calmMotion}
          onClick={() => setCalmMotion(!calmMotion)}
          className={cn(
            "press-row flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
            calmMotion
              ? "border-sapphire bg-sapphire-soft/60 dark:border-paper dark:bg-white/12"
              : "border-border-control bg-muted/35 hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-foreground dark:text-paper">
              {copy.calmMotionToggle}
            </span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground dark:text-mist">
              {copy.calmMotionHelp}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-6 w-11 shrink-0 items-center justify-start rounded-md p-0.5 transition-colors duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
              calmMotion ? "bg-sapphire" : "bg-ink-950/20 dark:bg-white/25",
            )}
          >
            {/* The thumb travels the track (20px) rather than jumping between ends. */}
            <span
              className={cn(
                "h-5 w-5 rounded-sm bg-white shadow-xs transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                calmMotion ? "translate-x-5" : "translate-x-0",
              )}
            />
          </span>
        </button>
      </div>

      {isCustomized && (
        <button
          type="button"
          onClick={() => {
            resetComfortPreferences();
            onDone?.();
          }}
          className="inline-flex min-h-11 w-full items-center justify-center max-w-full whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-sapphire underline decoration-sapphire/35 underline-offset-4 transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-sapphire-soft/45 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-paper dark:hover:bg-white/10"
        >
          <span className="min-w-0 truncate">{copy.reset}</span>
        </button>
      )}
    </div>
  );

  if (variant === "drawer" && collapsible) {
    const activeScaleLabel =
      textScale === "xl" ? copy.scaleXl : textScale === "large" ? copy.scaleLarge : copy.scaleNormal;

    return (
      <div ref={wrapperRef} className="w-full text-left">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "group flex min-h-12 w-full max-w-full items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-2.5 text-left press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper",
            isOpen
              ? "bg-sapphire/[0.06] dark:bg-white/[0.07]"
              : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex w-4.5 shrink-0 items-center justify-center text-[13.5px] font-bold tracking-tight transition-colors duration-(--dur-fast)",
              isOpen || isCustomized
                ? "text-sapphire dark:text-sapphire-border"
                : "text-ink-900/50 group-hover:text-foreground dark:text-paper/55 dark:group-hover:text-paper",
            )}
          >
            Aa
          </span>
          <span className="min-w-0 flex-1 truncate text-[15.5px] font-medium leading-snug text-foreground dark:text-paper">
            {copy.buttonLabel}
          </span>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap text-sm font-medium",
              textScale !== "normal"
                ? "font-semibold text-sapphire dark:text-paper"
                : "text-muted-foreground dark:text-mist",
            )}
          >
            {activeScaleLabel}
          </span>
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 shrink-0 text-ink-900/35 transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-paper/35",
              isOpen && "rotate-180 text-sapphire dark:text-paper",
            )}
          />
        </button>

        <div
          id={panelId}
          role="region"
          aria-label={copy.title}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none",
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden" inert={!isOpen}>
            <div className="px-1 pt-1.5 pb-3">{controlsBody}</div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "drawer") {
    return (
      <section
        aria-label={copy.title}
        className="rounded-xl border border-border/75 bg-muted/25 p-3 dark:border-white/12 dark:bg-white/5"
      >
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sapphire-soft text-xs font-bold text-sapphire dark:bg-white/15 dark:text-paper"
            >
              Aa
            </span>
            <p className="text-[13.5px] font-semibold text-foreground dark:text-paper">{copy.buttonLabel}</p>
          </div>
        </div>
        {controlsBody}
      </section>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={copy.buttonLabel}
        title={copy.buttonLabel}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "press-row relative inline-flex h-11 w-11 min-h-11 min-w-11 items-center justify-center whitespace-nowrap rounded-lg px-0 text-sm font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 motion-reduce:transition-none",
          tone === "light"
            ? "text-paper/90 hover:bg-white/10 hover:text-white focus-visible:ring-paper/70"
            : "text-foreground/85 hover:bg-muted hover:text-foreground focus-visible:ring-ring dark:text-paper/85 dark:hover:bg-white/10 dark:hover:text-paper dark:focus-visible:ring-paper",
          !isOpen &&
            hasComfortBoost &&
            (tone === "light"
              ? "bg-white/12 text-white"
              : "bg-sapphire-soft/75 text-sapphire dark:bg-white/12 dark:text-paper"),
          isOpen && (tone === "light" ? "bg-white/15 text-white" : "bg-muted text-foreground dark:bg-white/15"),
        )}
      >
        <span aria-hidden="true" className="text-[15px] font-bold tracking-tight">
          Aa
        </span>
        <span className="sr-only">{copy.buttonLabel}</span>
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label={copy.title}
        inert={!isOpen}
        className={cn(
          "fixed inset-x-3 top-[calc(var(--site-header-h,4rem)+0.5rem)] z-50 transition-[opacity,transform,visibility] duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:pt-2",
          isOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1.5 opacity-0",
        )}
      >
        <div className="w-auto rounded-(--radius-surface) border border-border bg-card p-4 text-foreground shadow-(--shadow-card-hover) sm:w-84 dark:border-white/10 dark:bg-ink-900 dark:text-paper">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/70 pb-2.5 dark:border-white/10">
            <h2 className="text-sm font-semibold text-foreground dark:text-paper">{copy.title}</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={copy.close}
              className="-mr-2 -mt-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          {controlsBody}
        </div>
      </div>
    </div>
  );
}

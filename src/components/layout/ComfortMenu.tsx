"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { CAPSULE_PANEL, CAPSULE_PANEL_LABEL, capsuleItem } from "@/components/layout/chrome-capsule";
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

  // The letter itself grows from one option to the next, so the choice shows what it does.
  const scaleOptions: { value: TextScale; glyphClass: string; label: string }[] = [
    { value: "normal", glyphClass: "text-[0.875rem]", label: copy.scaleNormal },
    { value: "large", glyphClass: "text-[1.0625rem]", label: copy.scaleLarge },
    { value: "xl", glyphClass: "text-[1.3125rem]", label: copy.scaleXl },
  ];

  // One recessed track per choice, with the chosen option lifted onto a plate: a single control, not a row of boxes.
  const segmentTrack = "mt-2 grid gap-1 rounded-xl bg-ink-950/[0.06] p-1 dark:bg-white/8";
  const segmentLabel = CAPSULE_PANEL_LABEL;
  const segment = (active: boolean) =>
    cn(
      "press-row flex min-h-12 min-w-0 items-center justify-center whitespace-nowrap rounded-lg px-1.5 text-center transition-[background-color,color,box-shadow] duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
      active
        ? "bg-card font-semibold text-sapphire shadow-xs ring-1 ring-sapphire/45 dark:bg-white/18 dark:text-paper dark:ring-white/35"
        : "font-medium text-foreground/75 hover:bg-card/60 hover:text-foreground dark:text-paper/75 dark:hover:bg-white/8 dark:hover:text-paper",
    );

  const controlsBody = (
    <div className="space-y-4 text-left">
      <div style={{ "--i": 0 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className={segmentLabel}>{copy.textSizeLabel}</p>
        <div role="group" aria-label={copy.textSizeLabel} className={cn(segmentTrack, "grid-cols-3")}>
          {scaleOptions.map((option) => {
            const active = textScale === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTextScale(option.value)}
                className={cn(segment(active), "min-h-16 flex-col justify-end gap-1 pt-1.5 pb-2")}
              >
                <span aria-hidden="true" className={cn("font-bold leading-none", option.glyphClass)}>
                  A
                </span>
                <span className="max-w-full truncate text-xs leading-tight">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ "--i": 1 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className={segmentLabel}>{copy.explanationLabel}</p>
        <div role="group" aria-label={copy.explanationLabel} className={cn(segmentTrack, "grid-cols-2")}>
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
                className={cn(segment(active), "text-sm leading-tight")}
              >
                <span className="min-w-0 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{ "--i": 2 } as CSSProperties}
        className={cn(isOpen && "list-in", "border-t border-border/70 pt-2 dark:border-white/10")}
      >
        <button
          type="button"
          role="switch"
          aria-checked={calmMotion}
          onClick={() => setCalmMotion(!calmMotion)}
          className="press-row -mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center justify-between gap-4 rounded-lg px-2 py-2 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:hover:bg-white/8"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-snug text-foreground dark:text-paper">
              {copy.calmMotionToggle}
            </span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground dark:text-mist">
              {copy.calmMotionHelp}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex h-6 w-11 shrink-0 items-center justify-start rounded-md p-0.5 transition-colors duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
              calmMotion ? "bg-sapphire dark:bg-sapphire-border" : "bg-border-control dark:bg-white/30",
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
        data-capsule-item=""
        onClick={() => setOpen((prev) => !prev)}
        className={cn(capsuleItem(tone === "light", isOpen || hasComfortBoost), "w-11")}
      >
        <span aria-hidden="true" className="text-[14.5px] font-bold leading-none tracking-[-0.02em]">
          Aa
        </span>
        <span className="sr-only">{copy.buttonLabel}</span>
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-label={copy.title}
        inert={!isOpen}
        data-open={isOpen}
        className="capsule-panel fixed inset-x-3 top-[calc(var(--site-header-h,4rem)+0.5rem)] z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:pt-3"
      >
        <div className={cn(CAPSULE_PANEL, "w-auto p-4 sm:w-92")}>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground dark:text-paper">{copy.title}</h2>
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

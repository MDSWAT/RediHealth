"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useIsPhone } from "@/lib/use-is-phone";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { CAPSULE_PANEL, capsuleItem } from "@/components/layout/chrome-capsule";
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
  comfortShort: string;
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
    comfortShort: "Text mare",
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
    reset: "Resetează",
    close: "Închide",
  },
  en: {
    buttonLabel: "Text and comfort",
    comfortShort: "Text size",
    title: "Easier reading",
    textSizeLabel: "Text size",
    scaleNormal: "Normal",
    scaleLarge: "Large",
    scaleXl: "Extra large",
    explanationLabel: "Reading mode",
    simpleLabel: "Simple",
    completeLabel: "Detailed",
    motionLabel: "Screen motion",
    calmMotionToggle: "Stop moving screen elements",
    calmMotionHelp: "Keeps news tickers and sections still while you read.",
    reset: "Reset settings",
    close: "Close",
  },
  sq: {
    buttonLabel: "Shkrimi dhe leximi",
    comfortShort: "Teksti",
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
    reset: "Kthe cilësimet",
    close: "Mbyll",
  },
  it: {
    buttonLabel: "Testo e lettura",
    comfortShort: "Testo",
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
    reset: "Ripristina tutto",
    close: "Chiudi",
  },
  hr: {
    buttonLabel: "Tekst i čitanje",
    comfortShort: "Tekst",
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
    reset: "Vrati zadano",
    close: "Zatvori",
  },
  rom: {
    buttonLabel: "Lekhipen thaj dikhipen",
    comfortShort: "Lil",
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
    reset: "Risar setimata",
    close: "Phandav",
  },
  ru: {
    buttonLabel: "Текст и чтение",
    comfortShort: "Шрифт",
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
    reset: "Сбросить",
    close: "Закрыть",
  },
};

type ComfortMenuProps = {
  variant?: "header" | "drawer";
  tone?: "light" | "default";
  showLabel?: boolean;
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDone?: () => void;
};

export function ComfortMenu({
  variant = "header",
  tone = "default",
  showLabel = false,
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
  const isPhone = useIsPhone();
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
  const scaleRadioRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  const scaleOptions: { value: TextScale; previewSize: string; label: string }[] = [
    { value: "normal", previewSize: "1rem", label: copy.scaleNormal },
    { value: "large", previewSize: "1.14rem", label: copy.scaleLarge },
    { value: "xl", previewSize: "1.26rem", label: copy.scaleXl },
  ];

  function handleScaleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    let targetIdx: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      targetIdx = (idx + 1) % scaleOptions.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      targetIdx = (idx - 1 + scaleOptions.length) % scaleOptions.length;
    } else if (event.key === "Home") {
      targetIdx = 0;
    } else if (event.key === "End") {
      targetIdx = scaleOptions.length - 1;
    }
    if (targetIdx === null) return;
    event.preventDefault();
    setTextScale(scaleOptions[targetIdx].value);
    scaleRadioRefs.current[targetIdx]?.focus();
  }

  const controlsBody = (
    <div className="space-y-4 text-left">
      <div style={{ "--i": 0 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className="text-body font-semibold text-foreground dark:text-paper">{copy.textSizeLabel}</p>
        <div role="radiogroup" aria-label={copy.textSizeLabel} className="mt-1.5 flex flex-col gap-1.5">
          {scaleOptions.map((option, idx) => {
            const active = textScale === option.value;
            return (
              <button
                key={option.value}
                ref={(el) => {
                  scaleRadioRefs.current[idx] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setTextScale(option.value)}
                onKeyDown={(event) => handleScaleKeyDown(event, idx)}
                className={cn(
                  "press-row flex min-h-12 w-full items-center justify-start whitespace-nowrap rounded-xl border px-3 py-2 text-left text-body font-medium transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:px-3.5",
                  active
                    ? "border-sapphire bg-sapphire-soft/75 font-semibold text-sapphire shadow-xs ring-1 ring-sapphire/20 dark:border-paper dark:bg-white/15 dark:text-paper dark:ring-white/20"
                    : "border-border-control bg-muted/35 text-foreground hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                )}
              >
                <span style={{ fontSize: option.previewSize }} className="leading-snug">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ "--i": 1 } as CSSProperties} className={cn(isOpen && "list-in")}>
        <p className="text-body font-semibold text-foreground dark:text-paper">{copy.explanationLabel}</p>
        <div role="group" aria-label={copy.explanationLabel} className="mt-1.5 flex flex-col gap-1.5">
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
                  "press-row flex min-h-12 w-full items-center justify-start whitespace-nowrap rounded-xl border px-3 py-2 text-left text-body font-semibold leading-tight transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:px-3.5",
                  active
                    ? "border-sapphire bg-sapphire-soft/75 text-sapphire shadow-xs ring-1 ring-sapphire/20 dark:border-paper dark:bg-white/15 dark:text-paper dark:ring-white/20"
                    : "border-border-control bg-muted/35 text-foreground hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                )}
              >
                <span>{option.label}</span>
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
          className={cn(
            "press-row flex min-h-11 w-full max-w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
            calmMotion
              ? "border-sapphire bg-sapphire-soft/60 dark:border-paper dark:bg-white/12"
              : "border-border-control bg-muted/35 hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold text-foreground dark:text-paper">
              {copy.calmMotionToggle}
            </span>
            <span className="mt-0.5 block text-meta leading-snug text-muted-foreground dark:text-mist">
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
          className="inline-flex min-h-11 w-full items-center justify-center max-w-full whitespace-nowrap rounded-lg px-2 text-body font-semibold text-sapphire underline decoration-sapphire/35 underline-offset-4 transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-sapphire-soft/45 hover:text-sapphire-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-paper dark:hover:bg-white/10"
        >
          {copy.reset}
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
            "group flex min-h-11 w-full max-w-full items-center gap-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left press-row transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:focus-visible:ring-paper",
            isOpen
              ? "bg-sapphire/[0.06] dark:bg-white/[0.07]"
              : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex w-4.5 shrink-0 items-center justify-center text-body font-bold transition-colors duration-(--dur-fast)",
              isOpen || isCustomized
                ? "text-sapphire dark:text-sapphire-border"
                : "text-muted-foreground group-hover:text-foreground dark:text-mist dark:group-hover:text-paper",
            )}
          >
            Aa
          </span>
          <span className="min-w-0 flex-1 truncate text-body font-medium leading-snug text-foreground dark:text-paper">
            {copy.buttonLabel}
          </span>
          <span
            className={cn(
              "shrink-0 whitespace-nowrap text-body font-medium",
              textScale !== "normal"
                ? "font-semibold text-sapphire dark:text-paper"
                : "text-muted-foreground dark:text-mist",
            )}
          >
            {activeScaleLabel}
          </span>
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none dark:text-mist",
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
      <section aria-label={copy.title} className="space-y-2.5 pt-2">
        <p className="text-body font-semibold text-foreground dark:text-paper">{copy.buttonLabel}</p>
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
        aria-label={showLabel ? undefined : copy.buttonLabel}
        title={copy.buttonLabel}
        data-capsule-item=""
        data-header-trigger={showLabel ? "" : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          capsuleItem(tone === "light", isOpen || hasComfortBoost),
          showLabel
            ? "gap-1.5 px-2.5 text-meta font-semibold max-[359px]:px-2"
            : "w-11",
        )}
      >
        <span
          aria-hidden="true"
          data-comfort-glyph={showLabel ? "" : undefined}
          className={cn("text-body font-bold leading-none", showLabel && "max-[359px]:hidden")}
        >
          Aa
        </span>
        {showLabel ? <span>{copy.comfortShort}</span> : <span className="sr-only">{copy.buttonLabel}</span>}
      </button>

      {/* Phones: the panel is a bottom sheet (the shared phone-sheet surface) over a dimmed page. */}
      {isPhone && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 z-40 bg-ink-950/45 transition-opacity duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
            isOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        />
      )}
      <div
        id={panelId}
        role="dialog"
        aria-label={copy.title}
        inert={!isOpen}
        data-open={isOpen}
        style={isPhone ? ({ "--panel-origin": "bottom center" } as CSSProperties) : undefined}
        className={cn(
          "capsule-panel fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:pt-3",
        )}
      >
        <div
          className={cn(
            CAPSULE_PANEL,
            // Phones: a white sheet from the bottom edge, like search; dark only when the site is.
            isPhone && "phone-sheet-light",
            "w-auto max-w-full overflow-x-hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:w-84 sm:p-4",
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/70 pb-2.5 dark:border-white/10">
            <h2 className="text-body font-semibold text-foreground dark:text-paper">{copy.title}</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={copy.close}
              className={
                isPhone
                  ? "sheet-close"
                  : "-mr-2 -mt-1.5 inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-lg text-muted-foreground transition-colors duration-(--dur-fast) hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-mist dark:hover:bg-white/10 dark:hover:text-paper"
              }
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

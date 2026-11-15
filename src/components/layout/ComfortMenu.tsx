"use client";

import { useCallback, useEffect, useId, useRef, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import { useIsPhone } from "@/lib/use-is-phone";
import {
  AccessibilityIcon,
  ChevronDownIcon,
  CloseIcon,
  ContrastIcon,
  PauseCircleIcon,
  TextSpacingIcon,
  UnderlineIcon,
  VolumeIcon,
} from "@/components/ui/icons";
import { CAPSULE_PANEL, CAPSULE_SHAPE, capsuleItem } from "@/components/layout/chrome-capsule";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { speechEngine } from "@/lib/audio/speech-engine";
import { clearPageAutoReadSession } from "@/lib/audio/page-auto-read";
import { cn } from "@/lib/cn";
import {
  resetComfortPreferences,
  useAutoRead,
  useCalmMotion,
  useHighContrast,
  useReadingLevel,
  useTextScale,
  useUnderlineLinks,
  useWideSpacing,
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
  autoReadToggle: string;
  autoReadHelp: string;
  highContrastToggle: string;
  highContrastHelp: string;
  underlineLinksToggle: string;
  underlineLinksHelp: string;
  wideSpacingToggle: string;
  wideSpacingHelp: string;
  motionLabel: string;
  calmMotionToggle: string;
  calmMotionHelp: string;
  reset: string;
  close: string;
};

export const COMFORT_COPY: Record<Lang, ComfortCopy> = {
  ro: {
    buttonLabel: "Accesibilitate",
    comfortShort: "Acces",
    title: "Accesibilitate și citire",
    textSizeLabel: "Mărimea scrisului",
    scaleNormal: "Obișnuit",
    scaleLarge: "Mare",
    scaleXl: "Foarte mare",
    explanationLabel: "Mod de citire",
    simpleLabel: "Pe scurt",
    completeLabel: "Detaliat",
    autoReadToggle: "Citire automată cu voce",
    autoReadHelp: "Pornește automat citirea pe paginile cu audio disponibil.",
    highContrastToggle: "Contrast ridicat",
    highContrastHelp: "Text mai închis și margini clare pentru o citire ușoară.",
    underlineLinksToggle: "Subliniază linkurile",
    underlineLinksHelp: "Fiecare link rămâne subliniat vizibil în pagină.",
    wideSpacingToggle: "Spațiere mărită",
    wideSpacingHelp: "Mai mult spațiu între litere, cuvinte și rânduri.",
    motionLabel: "Mișcări pe ecran",
    calmMotionToggle: "Oprește elementele care se mișcă",
    calmMotionHelp: "Paginile și știrile rămân nemișcate, fără efecte de derulare.",
    reset: "Resetează",
    close: "Închide",
  },
  en: {
    buttonLabel: "Accessibility",
    comfortShort: "Access",
    title: "Accessibility and reading",
    textSizeLabel: "Text size",
    scaleNormal: "Normal",
    scaleLarge: "Large",
    scaleXl: "Extra large",
    explanationLabel: "Reading mode",
    simpleLabel: "Simple",
    completeLabel: "Detailed",
    autoReadToggle: "Auto-read pages",
    autoReadHelp: "Reads aloud automatically on pages where voice is available.",
    highContrastToggle: "High contrast",
    highContrastHelp: "Sharper ink, pure canvas, and bolder control borders.",
    underlineLinksToggle: "Underline links",
    underlineLinksHelp: "Keeps every clickable link clearly underlined.",
    wideSpacingToggle: "Wider text spacing",
    wideSpacingHelp: "Adds breathing room between letters, words, and lines.",
    motionLabel: "Screen motion",
    calmMotionToggle: "Stop moving screen elements",
    calmMotionHelp: "Keeps news tickers and sections still while you read.",
    reset: "Reset settings",
    close: "Close",
  },
  sq: {
    buttonLabel: "Aksesueshmëria",
    comfortShort: "Qasje",
    title: "Qasje dhe lexim i lehtë",
    textSizeLabel: "Madhësia e shkrimit",
    scaleNormal: "Normale",
    scaleLarge: "E madhe",
    scaleXl: "Shumë e madhe",
    explanationLabel: "Mënyra e leximit",
    simpleLabel: "Shkurt",
    completeLabel: "Detajuar",
    autoReadToggle: "Lexim automatik me zë",
    autoReadHelp: "Nis leximin me zë automatikisht në faqet ku audio ofrohet.",
    highContrastToggle: "Kontrast i lartë",
    highContrastHelp: "Shkrim më i mprehtë dhe korniza më të qarta.",
    underlineLinksToggle: "Nënvizo lidhjet",
    underlineLinksHelp: "Të gjitha lidhjet shfaqen të nënvizuara qartë.",
    wideSpacingToggle: "Hapësirë më e gjerë e tekstit",
    wideSpacingHelp: "Shton hapësirë mes shkronjave, fjalëve dhe rreshtave.",
    motionLabel: "Lëvizjet në ekran",
    calmMotionToggle: "Ndalo elementet që lëvizin",
    calmMotionHelp: "Lajmet dhe faqet qëndrojnë të qeta ndërsa lexon.",
    reset: "Kthe cilësimet",
    close: "Mbyll",
  },
  it: {
    buttonLabel: "Accessibilità",
    comfortShort: "Accesso",
    title: "Accessibilità e lettura",
    textSizeLabel: "Grandezza del testo",
    scaleNormal: "Normale",
    scaleLarge: "Grande",
    scaleXl: "Molto grande",
    explanationLabel: "Modalità di lettura",
    simpleLabel: "Semplice",
    completeLabel: "Dettagliato",
    autoReadToggle: "Lettura vocale automatica",
    autoReadHelp: "Avvia automaticamente la voce nelle pagine con audio disponibile.",
    highContrastToggle: "Contrasto elevato",
    highContrastHelp: "Testo più scuro e bordi nitidi per leggere meglio.",
    underlineLinksToggle: "Sottolinea i link",
    underlineLinksHelp: "Mantiene ogni collegamento chiaramente sottolineato.",
    wideSpacingToggle: "Spaziatura ampia",
    wideSpacingHelp: "Più spazio tra lettere, parole e righe di testo.",
    motionLabel: "Movimenti sullo schermo",
    calmMotionToggle: "Ferma gli elementi in movimento",
    calmMotionHelp: "Notizie e sezioni restano ferme mentre leggi.",
    reset: "Ripristina tutto",
    close: "Chiudi",
  },
  hr: {
    buttonLabel: "Pristupačnost",
    comfortShort: "Pristup",
    title: "Pristupačnost i čitanje",
    textSizeLabel: "Veličina slova",
    scaleNormal: "Uobičajeno",
    scaleLarge: "Veliko",
    scaleXl: "Vrlo veliko",
    explanationLabel: "Način čitanja",
    simpleLabel: "Ukratko",
    completeLabel: "Detaljno",
    autoReadToggle: "Automatsko čitanje naglas",
    autoReadHelp: "Automatski pokreće čitanje na stranicama s dostupnim glasom.",
    highContrastToggle: "Visoki kontrast",
    highContrastHelp: "Oštrija slova i jasniji rubovi za lakše čitanje.",
    underlineLinksToggle: "Podcrtaj poveznice",
    underlineLinksHelp: "Svaka poveznica ostaje jasno podcrtana.",
    wideSpacingToggle: "Veći razmak teksta",
    wideSpacingHelp: "Više prostora između slova, riječi i redaka.",
    motionLabel: "Pokreti na zaslonu",
    calmMotionToggle: "Zaustavi pokretne elemente",
    calmMotionHelp: "Vijesti i stranice ostaju mirne dok čitaš.",
    reset: "Vrati zadano",
    close: "Zatvori",
  },
  rom: {
    buttonLabel: "Akceso thaj drabaripe",
    comfortShort: "Akceso",
    title: "Akceso thaj mai lokho drabaripe",
    textSizeLabel: "Baripen le alfabetosko",
    scaleNormal: "Normalno",
    scaleLarge: "Baro",
    scaleXl: "But baro",
    explanationLabel: "Sar drabares",
    simpleLabel: "Skurto",
    completeLabel: "Detaliime",
    autoReadToggle: "Drabar korkoro avazesa",
    autoReadHelp: "Putrel korkoro o avazi pe riga kaj si audio.",
    highContrastToggle: "Zoralo kontrasto",
    highContrastHelp: "Mai kale lekha thaj klaro borduri te dikhes mai mishto.",
    underlineLinksToggle: "Linia telal e linkura",
    underlineLinksHelp: "Sako linko ačhol liniasa telal te dikhjol.",
    wideSpacingToggle: "Mai baro than maškar e lava",
    wideSpacingHelp: "Mai but than maškar e buchave, lava thaj riga.",
    motionLabel: "Miškipen pe ekrano",
    calmMotionToggle: "Ačhav so miškisajvel",
    calmMotionHelp: "E nevimata thaj e riga ačhon phandade kana drabares.",
    reset: "Risar setimata",
    close: "Phandav",
  },
  ru: {
    buttonLabel: "Доступность",
    comfortShort: "Доступ",
    title: "Доступность и чтение",
    textSizeLabel: "Размер текста",
    scaleNormal: "Обычный",
    scaleLarge: "Крупный",
    scaleXl: "Очень крупный",
    explanationLabel: "Режим чтения",
    simpleLabel: "Коротко",
    completeLabel: "Подробно",
    autoReadToggle: "Авточтение вслух",
    autoReadHelp: "Автоматически включает озвучивание на страницах с поддержкой голоса.",
    highContrastToggle: "Высокий контраст",
    highContrastHelp: "Более чёткий шрифт, фон и выраженные границы кнопок.",
    underlineLinksToggle: "Подчёркивать ссылки",
    underlineLinksHelp: "Все ссылки на странице остаются заметно подчёркнутыми.",
    wideSpacingToggle: "Увеличенный интервал",
    wideSpacingHelp: "Больше пространства между буквами, словами и строками.",
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

type SwitchOption = {
  id: string;
  label: string;
  help: string;
  checked: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  onToggle: () => void;
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
  const voiceAvailable = isVoiceEnabled(lang);
  const [textScale, setTextScale] = useTextScale();
  const [readingLevel, setReadingLevel] = useReadingLevel();
  const [calmMotion, setCalmMotion] = useCalmMotion();
  const [autoRead, setAutoRead] = useAutoRead();
  const [highContrast, setHighContrast] = useHighContrast();
  const [underlineLinks, setUnderlineLinks] = useUnderlineLinks();
  const [wideSpacing, setWideSpacing] = useWideSpacing();
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

  const isCustomized =
    textScale !== "normal" ||
    calmMotion ||
    highContrast ||
    underlineLinks ||
    wideSpacing ||
    readingLevel === "complete" ||
    (voiceAvailable && autoRead);
  const hasComfortBoost =
    textScale !== "normal" ||
    calmMotion ||
    highContrast ||
    underlineLinks ||
    wideSpacing ||
    (voiceAvailable && autoRead);

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

  const switchOptions: SwitchOption[] = [
    ...(voiceAvailable
      ? [
          {
            id: "auto-read",
            label: copy.autoReadToggle,
            help: copy.autoReadHelp,
            checked: autoRead,
            Icon: VolumeIcon,
            onToggle: () => {
              const next = !autoRead;
              if (next) {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("redihealth:unlock-audio"));
                }
                clearPageAutoReadSession();
              } else {
                speechEngine.stop();
                speechEngine.requestClose();
              }
              setAutoRead(next);
            },
          },
        ]
      : []),
    {
      id: "high-contrast",
      label: copy.highContrastToggle,
      help: copy.highContrastHelp,
      checked: highContrast,
      Icon: ContrastIcon,
      onToggle: () => setHighContrast(!highContrast),
    },
    {
      id: "underline-links",
      label: copy.underlineLinksToggle,
      help: copy.underlineLinksHelp,
      checked: underlineLinks,
      Icon: UnderlineIcon,
      onToggle: () => setUnderlineLinks(!underlineLinks),
    },
    {
      id: "wide-spacing",
      label: copy.wideSpacingToggle,
      help: copy.wideSpacingHelp,
      checked: wideSpacing,
      Icon: TextSpacingIcon,
      onToggle: () => setWideSpacing(!wideSpacing),
    },
    {
      id: "calm-motion",
      label: copy.calmMotionToggle,
      help: copy.calmMotionHelp,
      checked: calmMotion,
      Icon: PauseCircleIcon,
      onToggle: () => setCalmMotion(!calmMotion),
    },
  ];

  const controlsBody = (
    <div className="space-y-4 text-left">
      <div>
        <p className="text-body font-semibold text-foreground dark:text-paper">{copy.textSizeLabel}</p>
        <div role="radiogroup" aria-label={copy.textSizeLabel} className="mt-2 grid grid-cols-3 gap-2.5">
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
                aria-label={`${copy.textSizeLabel}: ${option.label}`}
                title={option.label}
                tabIndex={active ? 0 : -1}
                onClick={() => setTextScale(option.value)}
                onKeyDown={(event) => handleScaleKeyDown(event, idx)}
                className={cn(
                  "press-row flex min-h-14 w-full items-center justify-center whitespace-nowrap rounded-2xl border px-2 py-2 text-center text-body font-semibold transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  active
                    ? "border-sapphire bg-sapphire-soft/85 font-bold text-sapphire shadow-xs ring-1 ring-sapphire/25 dark:border-paper dark:bg-white/15 dark:text-paper dark:ring-white/25"
                    : "border-border-control bg-muted/35 text-foreground hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
                )}
              >
                <span style={{ fontSize: option.previewSize }} className="leading-none">
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-body font-semibold text-foreground dark:text-paper">{copy.explanationLabel}</p>
        <div
          role="group"
          aria-label={copy.explanationLabel}
          className={cn(
            "mt-2 grid grid-cols-2 gap-1 border border-border-control bg-muted/50 p-1 dark:border-white/15 dark:bg-white/10",
            CAPSULE_SHAPE,
          )}
        >
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
                  "press-row flex min-h-11 w-full items-center justify-center whitespace-nowrap px-3 py-2 text-center text-body leading-tight transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  CAPSULE_SHAPE,
                  active
                    ? "bg-sapphire font-semibold text-white shadow-xs dark:bg-sapphire-light dark:text-white"
                    : "font-medium text-foreground/80 hover:bg-card/70 hover:text-foreground dark:text-paper/80 dark:hover:bg-white/10 dark:hover:text-paper",
                )}
              >
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5 border-t border-border/70 pt-3 dark:border-white/10">
        {switchOptions.map((option) => {
          const { Icon } = option;
          return (
            <button
              key={option.id}
              type="button"
              role="switch"
              aria-checked={option.checked}
              onClick={option.onToggle}
              className={cn(
                "press-row flex min-h-11 w-full max-w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                option.checked
                  ? "border-sapphire bg-sapphire-soft/75 dark:border-paper dark:bg-white/12"
                  : "border-border-control bg-muted/35 hover:bg-muted/75 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
              )}
            >
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 transition-colors duration-(--dur-fast)",
                    option.checked
                      ? "text-sapphire dark:text-sapphire-border"
                      : "text-muted-foreground dark:text-mist",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold leading-snug text-foreground dark:text-paper">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-meta leading-snug text-muted-foreground dark:text-mist">
                    {option.help}
                  </span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex h-6 w-11 shrink-0 items-center justify-start p-0.5 transition-colors duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                  CAPSULE_SHAPE,
                  option.checked
                    ? "border border-sapphire bg-sapphire dark:border-sapphire-light dark:bg-sapphire-light"
                    : "border border-border-control bg-muted dark:border-white/35 dark:bg-white/15",
                )}
              >
                {/* The thumb (18px) travels the 38px inner track (20px) cleanly inside the 1px border. */}
                <span
                  className={cn(
                    "h-4.5 w-4.5 shadow-xs transition-transform duration-(--dur-base) ease-(--ease-out-calm) motion-reduce:transition-none",
                    CAPSULE_SHAPE,
                    option.checked ? "translate-x-5 bg-white" : "translate-x-0 bg-foreground/75 dark:bg-white/85",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>

      {isCustomized && (
        <button
          type="button"
          onClick={() => {
            speechEngine.stop();
            speechEngine.requestClose();
            resetComfortPreferences();
            onDone?.();
          }}
          className={cn(
            "press-row inline-flex min-h-11 w-full max-w-full items-center justify-center whitespace-nowrap border border-border-control bg-card/80 px-4 text-body font-semibold text-sapphire transition-colors duration-(--dur-fast) motion-reduce:transition-none hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/20 dark:bg-white/5 dark:text-paper dark:hover:bg-white/10",
            CAPSULE_SHAPE,
          )}
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
          <AccessibilityIcon
            className={cn(
              "h-4.5 w-4.5 shrink-0 transition-colors duration-(--dur-fast)",
              isOpen || isCustomized
                ? "text-sapphire dark:text-sapphire-border"
                : "text-muted-foreground group-hover:text-foreground dark:text-mist dark:group-hover:text-paper",
            )}
          />
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
        <AccessibilityIcon
          data-comfort-glyph={showLabel ? "" : undefined}
          className={cn("h-4.5 w-4.5 shrink-0", showLabel && "max-[359px]:hidden")}
        />
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
        data-comfort-dialog={panelId}
        aria-label={copy.title}
        inert={!isOpen}
        data-open={isOpen}
        style={isPhone ? ({ "--panel-origin": "bottom center" } as CSSProperties) : undefined}
        className="capsule-panel fixed inset-x-0 bottom-0 z-50 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:pt-3"
      >
        <div
          className={cn(
            CAPSULE_PANEL,
            // Phones: a white sheet from the bottom edge, like search; dark only when the site is.
            isPhone && "phone-sheet-light",
            "w-auto max-w-full overflow-x-hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:w-96 sm:rounded-3xl sm:p-5",
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
              className={cn(
                "-mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap border border-border-control/45 bg-muted/80 text-foreground transition-colors duration-(--dur-fast) hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/25 dark:bg-white/10 dark:text-paper dark:hover:bg-white/20",
                CAPSULE_SHAPE,
              )}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="-m-0.5 max-h-[min(78dvh,38rem)] overflow-y-auto overscroll-contain py-0.5 pl-0.5 pr-1.5">
            {controlsBody}
          </div>
        </div>
      </div>
    </div>
  );
}

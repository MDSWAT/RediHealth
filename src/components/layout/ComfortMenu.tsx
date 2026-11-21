"use client";

import { useCallback, useEffect, useId, useRef, useState, type ComponentType, type CSSProperties, type SVGProps } from "react";
import { useIsPhone } from "@/lib/use-is-phone";
import {
  AccessibilityIcon,
  ChevronDownIcon,
  CloseIcon,
  ContrastIcon,
  PauseCircleIcon,
  DropletIcon,
  ReadingGuideIcon,
  TextSpacingIcon,
  UnderlineIcon,
  VolumeIcon,
} from "@/components/ui/icons";
import { CAPSULE_PANEL, CAPSULE_SHAPE, capsuleComfortItem } from "@/components/layout/chrome-capsule";
import { isVoiceEnabled } from "@/lib/audio/voice-availability";
import { speechEngine } from "@/lib/audio/speech-engine";
import { clearPageAutoReadSession } from "@/lib/audio/page-auto-read";
import { cn } from "@/lib/cn";
import {
  resetComfortPreferences,
  useAutoRead,
  useCalmMotion,
  useGrayscale,
  useReadingGuide,
  useHighContrast,
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
  autoReadToggle: string;
  autoReadHelp: string;
  highContrastToggle: string;
  highContrastHelp: string;
  underlineLinksToggle: string;
  underlineLinksHelp: string;
  wideSpacingToggle: string;
  wideSpacingHelp: string;
  readingGuideToggle: string;
  readingGuideHelp: string;
  grayscaleToggle: string;
  grayscaleHelp: string;
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
    autoReadToggle: "Citire automată cu voce",
    autoReadHelp: "Pornește automat citirea pe paginile cu audio disponibil.",
    highContrastToggle: "Contrast ridicat",
    highContrastHelp: "Text mai închis și margini clare pentru o citire ușoară.",
    underlineLinksToggle: "Subliniază linkurile",
    underlineLinksHelp: "Fiecare link rămâne subliniat vizibil în pagină.",
    wideSpacingToggle: "Spațiere mărită",
    wideSpacingHelp: "Mai mult spațiu între litere, cuvinte și rânduri.",
    readingGuideToggle: "Ghid de citire",
    readingGuideHelp: "O bandă clară urmează degetul sau mouse-ul și umbrește restul paginii.",
    grayscaleToggle: "Tonuri de gri",
    grayscaleHelp: "Pagina apare în nuanțe de gri, fără culori.",
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
    autoReadToggle: "Auto-read pages",
    autoReadHelp: "Reads aloud automatically on pages where voice is available.",
    highContrastToggle: "High contrast",
    highContrastHelp: "Sharper ink, pure canvas, and bolder control borders.",
    underlineLinksToggle: "Underline links",
    underlineLinksHelp: "Keeps every clickable link clearly underlined.",
    wideSpacingToggle: "Wider text spacing",
    wideSpacingHelp: "Adds breathing room between letters, words, and lines.",
    readingGuideToggle: "Reading guide",
    readingGuideHelp: "A clear band follows your finger or mouse and dims the rest of the page.",
    grayscaleToggle: "Greyscale",
    grayscaleHelp: "Shows the page in shades of grey instead of colour.",
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
    autoReadToggle: "Lexim automatik me zë",
    autoReadHelp: "Nis leximin me zë automatikisht në faqet ku audio ofrohet.",
    highContrastToggle: "Kontrast i lartë",
    highContrastHelp: "Shkrim më i mprehtë dhe korniza më të qarta.",
    underlineLinksToggle: "Nënvizo lidhjet",
    underlineLinksHelp: "Të gjitha lidhjet shfaqen të nënvizuara qartë.",
    wideSpacingToggle: "Hapësirë më e gjerë e tekstit",
    wideSpacingHelp: "Shton hapësirë mes shkronjave, fjalëve dhe rreshtave.",
    readingGuideToggle: "Udhëzues leximi",
    readingGuideHelp: "Një brez i qartë ndjek gishtin ose miun dhe errëson pjesën tjetër të faqes.",
    grayscaleToggle: "Nuanca gri",
    grayscaleHelp: "Faqja shfaqet në nuanca gri në vend të ngjyrave.",
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
    autoReadToggle: "Lettura vocale automatica",
    autoReadHelp: "Avvia automaticamente la voce nelle pagine con audio disponibile.",
    highContrastToggle: "Contrasto elevato",
    highContrastHelp: "Testo più scuro e bordi nitidi per leggere meglio.",
    underlineLinksToggle: "Sottolinea i link",
    underlineLinksHelp: "Mantiene ogni collegamento chiaramente sottolineato.",
    wideSpacingToggle: "Spaziatura ampia",
    wideSpacingHelp: "Più spazio tra lettere, parole e righe di testo.",
    readingGuideToggle: "Guida alla lettura",
    readingGuideHelp: "Una fascia chiara segue il dito o il mouse e scurisce il resto della pagina.",
    grayscaleToggle: "Scala di grigi",
    grayscaleHelp: "Mostra la pagina in sfumature di grigio invece che a colori.",
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
    autoReadToggle: "Automatsko čitanje naglas",
    autoReadHelp: "Automatski pokreće čitanje na stranicama s dostupnim glasom.",
    highContrastToggle: "Visoki kontrast",
    highContrastHelp: "Oštrija slova i jasniji rubovi za lakše čitanje.",
    underlineLinksToggle: "Podcrtaj poveznice",
    underlineLinksHelp: "Svaka poveznica ostaje jasno podcrtana.",
    wideSpacingToggle: "Veći razmak teksta",
    wideSpacingHelp: "Više prostora između slova, riječi i redaka.",
    readingGuideToggle: "Vodič za čitanje",
    readingGuideHelp: "Svijetla traka prati prst ili miš i zatamnjuje ostatak stranice.",
    grayscaleToggle: "Nijanse sive",
    grayscaleHelp: "Stranica se prikazuje u nijansama sive umjesto u bojama.",
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
    autoReadToggle: "Drabar korkoro avazesa",
    autoReadHelp: "Putrel korkoro o avazi pe riga kaj si audio.",
    highContrastToggle: "Zoralo kontrasto",
    highContrastHelp: "Mai kale lekha thaj klaro borduri te dikhes mai mishto.",
    underlineLinksToggle: "Linia telal e linkura",
    underlineLinksHelp: "Sako linko ačhol liniasa telal te dikhjol.",
    wideSpacingToggle: "Mai baro than maškar e lava",
    wideSpacingHelp: "Mai but than maškar e buchave, lava thaj riga.",
    readingGuideToggle: "Drom vash drabaripe",
    readingGuideHelp: "Jekh klaro pervazo phirel palal o naj vaj o mouse thaj kalarel aver riga.",
    grayscaleToggle: "Numa siva",
    grayscaleHelp: "I riga sikadjol numa ando siva, bi farbengo.",
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
    autoReadToggle: "Авточтение вслух",
    autoReadHelp: "Автоматически включает озвучивание на страницах с поддержкой голоса.",
    highContrastToggle: "Высокий контраст",
    highContrastHelp: "Более чёткий шрифт, фон и выраженные границы кнопок.",
    underlineLinksToggle: "Подчёркивать ссылки",
    underlineLinksHelp: "Все ссылки на странице остаются заметно подчёркнутыми.",
    wideSpacingToggle: "Увеличенный интервал",
    wideSpacingHelp: "Больше пространства между буквами, словами и строками.",
    readingGuideToggle: "Линейка для чтения",
    readingGuideHelp: "Светлая полоса следует за пальцем или мышью и затемняет остальную страницу.",
    grayscaleToggle: "Оттенки серого",
    grayscaleHelp: "Страница показывается в оттенках серого, без цвета.",
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
  const [calmMotion, setCalmMotion] = useCalmMotion();
  const [autoRead, setAutoRead] = useAutoRead();
  const [highContrast, setHighContrast] = useHighContrast();
  const [underlineLinks, setUnderlineLinks] = useUnderlineLinks();
  const [wideSpacing, setWideSpacing] = useWideSpacing();
  const [readingGuide, setReadingGuide] = useReadingGuide();
  const [grayscale, setGrayscale] = useGrayscale();
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
  const panelId = useId();
  const sliderId = useId();

  const isCustomized =
    textScale !== "normal" ||
    calmMotion ||
    highContrast ||
    underlineLinks ||
    wideSpacing ||
    readingGuide ||
    grayscale ||
    (voiceAvailable && autoRead);
  const hasComfortBoost =
    textScale !== "normal" ||
    calmMotion ||
    highContrast ||
    underlineLinks ||
    wideSpacing ||
    readingGuide ||
    grayscale ||
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

  const scaleOptions: { value: TextScale; label: string }[] = [
    { value: "normal", label: copy.scaleNormal },
    { value: "large", label: copy.scaleLarge },
    { value: "xl", label: copy.scaleXl },
  ];
  const scaleIndex = Math.max(
    0,
    scaleOptions.findIndex((option) => option.value === textScale),
  );

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
      id: "reading-guide",
      label: copy.readingGuideToggle,
      help: copy.readingGuideHelp,
      checked: readingGuide,
      Icon: ReadingGuideIcon,
      onToggle: () => setReadingGuide(!readingGuide),
    },
    {
      id: "grayscale",
      label: copy.grayscaleToggle,
      help: copy.grayscaleHelp,
      checked: grayscale,
      Icon: DropletIcon,
      onToggle: () => setGrayscale(!grayscale),
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
    <div className="space-y-2.5 text-left max-sm:space-y-2">
      <div className="rounded-2xl px-2.5 pt-1 pb-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={sliderId} className="text-body font-medium text-foreground dark:text-paper">
            {copy.textSizeLabel}
          </label>
          <span aria-hidden="true" className="whitespace-nowrap text-body font-medium text-sapphire dark:text-sapphire-border">
            {scaleOptions[scaleIndex].label}
          </span>
        </div>
        {/* Three stops (normal, large, extra large); the small and big A show which way makes text bigger. */}
        <div className="mt-1 flex items-center gap-3 max-sm:mt-0.5">
          <span aria-hidden="true" className="w-4 shrink-0 text-center text-[0.95rem] font-semibold leading-none text-foreground dark:text-paper">
            A
          </span>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={scaleOptions.length - 1}
            step={1}
            value={scaleIndex}
            aria-valuetext={scaleOptions[scaleIndex].label}
            onChange={(event) => setTextScale(scaleOptions[Number(event.currentTarget.value)]?.value ?? "normal")}
            style={{ "--fill": `${(scaleIndex / (scaleOptions.length - 1)) * 100}%` } as CSSProperties}
            className="comfort-slider min-w-0 flex-1"
          />
          <span aria-hidden="true" className="w-6 shrink-0 text-center text-[1.45rem] font-semibold leading-none text-foreground dark:text-paper">
            A
          </span>
        </div>
      </div>

      <div className="divide-y divide-ink-900/8 border-t border-ink-900/10 pt-1 dark:divide-white/10 dark:border-white/10">
        {switchOptions.map((option) => {
          const { Icon } = option;
          return (
            <div key={option.id} className="py-0.5">
              <button
                type="button"
                role="switch"
                aria-checked={option.checked}
                onClick={option.onToggle}
                className={cn(
                  "press-row flex min-h-11 w-full max-w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors duration-(--dur-fast) ease-(--ease-out-calm) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none dark:focus-visible:ring-paper",
                  option.checked
                    ? "bg-sapphire/[0.06] dark:bg-white/[0.08]"
                    : "hover:bg-ink-900/[0.035] dark:hover:bg-white/[0.05]",
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-colors duration-(--dur-fast)",
                      option.checked
                        ? "text-sapphire dark:text-sapphire-border"
                        : "text-muted-foreground dark:text-mist",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-body leading-snug",
                        option.checked
                          ? "font-semibold text-sapphire dark:text-paper"
                          : "font-medium text-foreground dark:text-paper",
                      )}
                    >
                      {option.label}
                    </span>
                    {/* Phones: the help line is read out but not shown, so the whole sheet fits on screen. */}
                    <span className="mt-0.5 block text-meta leading-snug text-muted-foreground max-sm:sr-only dark:text-mist">
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
            </div>
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
              "h-5 w-5 shrink-0 transition-colors duration-(--dur-fast)",
              isOpen || isCustomized
                ? "text-sapphire dark:text-sapphire-border"
                : "text-sapphire/85 group-hover:text-sapphire dark:text-paper/85 dark:group-hover:text-paper",
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
            <div className="pt-1.5 pb-2">{controlsBody}</div>
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
          capsuleComfortItem(tone === "light", isOpen || hasComfortBoost),
          showLabel
            ? "gap-1.5 px-2.5 text-meta font-semibold max-[359px]:px-2"
            : "w-11",
        )}
      >
        <AccessibilityIcon
          data-comfort-glyph={showLabel ? "" : undefined}
          className={cn("h-5.5 w-5.5 shrink-0", showLabel && "max-[359px]:hidden")}
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
            "w-auto max-w-full overflow-x-hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:w-[27rem] lg:w-[30rem] sm:max-w-[calc(100vw-2rem)] sm:rounded-3xl sm:p-5",
            // Phones: the sheet may use the whole screen height so every control stays in view.
            "max-sm:flex max-sm:max-h-[calc(100dvh-0.5rem)] max-sm:flex-col",
          )}
        >
          <div className="mb-3 flex shrink-0 items-center justify-between gap-2 border-b border-border/70 pb-2.5 max-sm:mb-2.5 max-sm:pb-2 dark:border-white/10">
            <h2 className="text-body font-semibold text-foreground dark:text-paper">{copy.title}</h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label={copy.close}
              className={cn(
                "-mr-1 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center whitespace-nowrap bg-[#c62f3c] text-white shadow-[0_2px_8px_-2px_rgb(2_6_23/0.45)] transition-colors duration-(--dur-fast) ease-(--ease-out-calm) motion-reduce:transition-none hover:bg-[#a82733] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c62f3c] focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-[#ff8f98] dark:focus-visible:ring-offset-ink-950",
                CAPSULE_SHAPE,
              )}
            >
              <CloseIcon className="h-4.5 w-4.5" />
            </button>
          </div>
          <div className="-m-0.5 min-h-0 overflow-y-auto overscroll-contain py-0.5 pl-0.5 pr-1.5 max-sm:flex-1 sm:max-h-[min(calc(100dvh-14.5rem),46rem)]">
            {controlsBody}
          </div>
        </div>
      </div>
    </div>
  );
}

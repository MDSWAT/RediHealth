"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, CopyIcon, PrinterIcon, VolumeIcon } from "@/components/ui/icons";
import { FamilyShareButton } from "@/components/ui/FamilyShareButton";
import { useReadAloud } from "./readingTools";
import { detectPhonePlatform } from "./phone-platform";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations, type BodyPartId } from "@/lib/i18n/health-check-translations";
import { getLocalizedSubRegion, type BodyAnatomyProfile, type SubRegionId } from "./anatomy-3d-data";
import { renderClinicalQrSvgData } from "./clinical-qr-svg";
import { COPY as HC_COPY } from "./health-check-copy";
import { PAIN_DIAGRAM_COPY, buildPainAreaDiagramSvg, type PainDiagramSide } from "./pain-area-diagram";
import { useDialogFocus } from "./useDialogFocus";
import { printSummary } from "./printSummary";

export interface SummaryRow {
  label: string;
  value: string;
}

export interface PainLocationSummary {
  part: BodyPartId;
  subRegion?: SubRegionId | null;
  side?: PainDiagramSide;
  bodyProfile?: BodyAnatomyProfile;
}

export interface TriageSummaryCardProps {
  bodyArea: string;
  anatomicalStructure?: string;
  /** Structured anatomical locus used to render the Front/Back pain diagram in the card, modal, and PDF. */
  painLocation?: PainLocationSummary;
  symptoms: string[];
  selfCareTips?: string[];
  redFlagNoticed?: boolean;
  painLevel?: number | string;
  duration?: string;
  sensations?: string[];
  triggers?: string;
  recommendedSpecialty?: string;
  clinicalMechanism?: string;
  /** Highlighted line shown next to the QR code, e.g. "Recommendation given: Go to your family doctor...". */
  recommendationDetail?: string;
  /** Romanian equivalent of `recommendationDetail` for the Romanian doctor tab. */
  romanianRecommendationDetail?: string;
  /** Shareable URL encoded into the QR code so scanning reproduces the Step 4 result. */
  reproduceUrl?: string;
  /** Romanian route equivalent of `reproduceUrl` when the doctor switches to Romanian. */
  romanianReproduceUrl?: string;
  /** Dedicated distraction-free clinical note URL encoded into the QR code for instant iPhone and Android scanning. */
  noteUrl?: string;
  /** Romanian route equivalent of `noteUrl` when the doctor switches to Romanian. */
  romanianNoteUrl?: string;
  /** Extra lines for the doctor screen: care level, guidance, emergency reason. */
  doctorNotes?: string[];
  /** Clinical wording of the symptom for the doctor screen (the page shows the patient's words). */
  doctorSymptom?: string;
  /** The same summary in Romanian, offered on the doctor screen for non-Romanian routes. */
  romanian?: { rows: SummaryRow[]; notes: string[] };
  /** Controlled doctor screen (the page's action bar opens it). */
  doctorOpen?: boolean;
  onDoctorOpenChange?: (open: boolean) => void;
  /** Inside a fold or parent card that already draws the outer border and card surface. */
  bare?: boolean;
  className?: string;
  lang?: Lang;
  /** Optional note timestamp (used when restoring a saved/scanned clinical note). */
  date?: Date;
}

function useSafeLanguage(propLang?: Lang): Lang {
  let contextLang: Lang = "ro";
  try {
    const ctx = useLanguage();
    contextLang = ctx?.lang || "ro";
  } catch {
    contextLang = "ro";
  }
  return propLang || contextLang;
}

const LOCALE_DATE_MAP: Record<Lang, string> = {
ru: "ru-RU",

  ro: "ro-RO",
  en: "en-GB",
  sq: "sq-AL",
  it: "it-IT",
  hr: "hr-HR",
  rom: "ro-RO",
};

const ALBANIAN_MONTHS = [
  "janar", "shkurt", "mars", "prill", "maj", "qershor",
  "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor",
];

const CROATIAN_MONTHS = [
  "siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja",
  "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca",
];

/** Long date in the page language; some browsers ship without Albanian or Croatian date data, and Romani falls back cleanly to ro-RO. */
export function formatTriageSummaryDate(date: Date, lang: Lang): string {
  const locale = LOCALE_DATE_MAP[lang] || "ro-RO";
  try {
    const supported = Intl.DateTimeFormat.supportedLocalesOf([locale]);
    if (lang === "sq" && supported.length === 0) {
      return `${date.getDate()} ${ALBANIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    }
    if (lang === "hr" && supported.length === 0) {
      return `${date.getDate()}. ${CROATIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}.`;
    }
    const safeLocale = supported.length > 0 ? locale : "ro-RO";
    return date.toLocaleDateString(safeLocale, { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}.`;
  }
}

const formatDate = formatTriageSummaryDate;

export interface SummaryCardCopy {
  title: string;
  structure: string;
  sensation: string;
  triggers: string;
  specialty: string;
  redFlag: string;
  noRedFlag: string;
  copy: string;
  copied: string;
  copyFailed: string;
  savedNote: string;
  whatsapp: string;
  screenFor: string;
  patientSummary: string;
  close: string;
  inRomanian: string;
  inOwnLanguage: string;
  myLanguageTab: string;
  romanianTab: string;
  qrTitle: string;
  qrHint: string;
  savePdf: string;
  listen: string;
  stopListening: string;
}

export const SUMMARY_COPY: Record<Lang, SummaryCardCopy> = {
  ru: {
"myLanguageTab": "На моем языке",
"romanianTab": "На румынском",
"qrTitle": "QR-код для передачи врачу без интернета",
"qrHint": "Врач или медсестра могут отсканировать QR-код без интернета, чтобы прочитать медицинскую сводку.",

    title: "Краткое описание симптомов, RediHealth",
    structure: "Точка выбрана на теле",
    sensation: "ощущение",
    triggers: "Триггеры",
    specialty: "Предлагаемая специальность",
    redFlag: "Внимание: выбран аварийный знак.",
    noRedFlag: "Аварийный знак не выбран.",
    copy: "Копировать",
    copied: "Скопировано",
    copyFailed: "Не удалось скопировать. Вместо этого покажите экран врачу.",
    savedNote: "Заметка готова",
    whatsapp: "WhatsApp",
    screenFor: "Для врача",
    patientSummary: "Симптомы пациента",
    close: "Закрыть",
    inRomanian: "Показать на румынском языке",
    inOwnLanguage: "Показать на английском языке",
    savePdf: "Сохранить как PDF",
    listen: "Прослушать сводку",
    stopListening: "Остановить чтение",
  },

  ro: {
    title: "Rezumatul simptomelor, RediHealth",
    structure: "Punct ales pe corp",
    sensation: "Senzație",
    triggers: "Factori declanșatori",
    specialty: "Medic specialist sugerat",
    redFlag: "Atenție: a fost ales un semn de urgență.",
    noRedFlag: "Nu a fost ales niciun semn de urgență.",
    copy: "Copiază în notițe",
    copied: "Copiat",
    copyFailed: "Nu s-a putut copia. Arată ecranul medicului.",
    savedNote: "Notă pregătită",
    whatsapp: "WhatsApp",
    screenFor: "Pentru medic",
    patientSummary: "Simptomele pacientului",
    close: "Închide",
    inRomanian: "Arată în română",
    inOwnLanguage: "Arată în limba mea",
    myLanguageTab: "În limba mea",
    romanianTab: "În română",
    qrTitle: "Cod QR offline pentru notițe și medic",
    qrHint: "Pe Android (Samsung), camera oferă direct „Adăugare în notițe”. Pe iPhone, atinge pictograma Live Text din colțul camerei ca să trimiți în Notițe, fără internet.",
    savePdf: "Salvează PDF",
    listen: "Ascultă rezumatul",
    stopListening: "Oprește citirea",
  },
  en: {
    title: "Symptom summary, RediHealth",
    structure: "Point chosen on the body",
    sensation: "Sensation",
    triggers: "Triggers",
    specialty: "Suggested specialty",
    redFlag: "Warning: an emergency sign was chosen.",
    noRedFlag: "No emergency sign was chosen.",
    copy: "Copy to notes",
    copied: "Copied",
    copyFailed: "Could not copy. Show the screen to the doctor instead.",
    savedNote: "Note ready",
    whatsapp: "WhatsApp",
    screenFor: "For the doctor",
    patientSummary: "Patient's symptoms",
    close: "Close",
    inRomanian: "Show in Romanian",
    inOwnLanguage: "Show in English",
    myLanguageTab: "In my language",
    romanianTab: "În română",
    qrTitle: "Offline QR code for notes and doctor",
    qrHint: "On Android (Samsung), the camera offers “Add to note” directly. On iPhone, tap the Live Text icon in the camera corner to send to Notes, completely offline.",
    savePdf: "Save as PDF",
    listen: "Listen to summary",
    stopListening: "Stop reading",
  },
  sq: {
    title: "Përmbledhja e simptomave, RediHealth",
    structure: "Pika e zgjedhur në trup",
    sensation: "Ndjesia",
    triggers: "Faktorët nxitës",
    specialty: "Specialiteti i sugjeruar",
    redFlag: "Kujdes: u zgjodh një shenjë urgjence.",
    noRedFlag: "Nuk u zgjodh asnjë shenjë urgjence.",
    copy: "Kopjo te shënimet",
    copied: "U kopjua",
    copyFailed: "Nuk u kopjua. Tregoja mjekut ekranin.",
    savedNote: "Shënimi gati",
    whatsapp: "WhatsApp",
    screenFor: "Për mjekun",
    patientSummary: "Simptomat e pacientit",
    close: "Mbyll",
    inRomanian: "Shfaq në rumanisht",
    inOwnLanguage: "Shfaq në shqip",
    myLanguageTab: "Në gjuhën time",
    romanianTab: "În română",
    qrTitle: "Kod QR offline për shënime dhe mjekun",
    qrHint: "Skano këtë kod QR me kamerën e iPhone ose Android për ta shtuar përmbledhjen direkt në shënime, krejtësisht pa internet.",
    savePdf: "Ruaje si PDF",
    listen: "Dëgjo përmbledhjen",
    stopListening: "Ndalo leximin",
  },
  it: {
    title: "Riepilogo dei sintomi, RediHealth",
    structure: "Punto scelto sul corpo",
    sensation: "Sensazione",
    triggers: "Fattori scatenanti",
    specialty: "Specialità suggerita",
    redFlag: "Attenzione: è stato scelto un segno di emergenza.",
    noRedFlag: "Non è stato scelto nessun segno di emergenza.",
    copy: "Copia nelle note",
    copied: "Copiato",
    copyFailed: "Copia non riuscita. Mostra lo schermo al medico.",
    savedNote: "Nota pronta",
    whatsapp: "WhatsApp",
    screenFor: "Per il medico",
    patientSummary: "Sintomi del paziente",
    close: "Chiudi",
    inRomanian: "Mostra in rumeno",
    inOwnLanguage: "Mostra in italiano",
    myLanguageTab: "Nella mia lingua",
    romanianTab: "În română",
    qrTitle: "Codice QR offline per note e medico",
    qrHint: "Scansiona questo codice QR con la fotocamera di iPhone o Android per aggiungere il riepilogo direttamente nelle note, completamente senza internet.",
    savePdf: "Salva come PDF",
    listen: "Ascolta il riepilogo",
    stopListening: "Ferma la lettura",
  },
  hr: {
    title: "Sažetak simptoma, RediHealth",
    structure: "Odabrana točka na tijelu",
    sensation: "Osjet",
    triggers: "Okidači",
    specialty: "Predložena specijalnost",
    redFlag: "Upozorenje: odabran je znak hitnog stanja.",
    noRedFlag: "Nije odabran nijedan znak hitnog stanja.",
    copy: "Kopiraj u bilješke",
    copied: "Kopirano",
    copyFailed: "Kopiranje nije uspjelo. Pokaži zaslon liječniku.",
    savedNote: "Bilješka spremna",
    whatsapp: "WhatsApp",
    screenFor: "Za liječnika",
    patientSummary: "Simptomi pacijenta",
    close: "Zatvori",
    inRomanian: "Prikaži na rumunjskom",
    inOwnLanguage: "Prikaži na hrvatskom",
    myLanguageTab: "Na mom jeziku",
    romanianTab: "În română",
    qrTitle: "Offline QR kod za bilješke i liječnika",
    qrHint: "Skeniraj ovaj QR kod kamerom na iPhoneu ili Androidu za dodavanje sažetka izravno u bilješke, potpuno bez interneta.",
    savePdf: "Spremi kao PDF",
    listen: "Poslušaj sažetak",
    stopListening: "Zaustavi čitanje",
  },
  rom: {
    title: "Skurto lil le simptomengo, RediHealth",
    structure: "Alosardo than pe trupo",
    sensation: "Sar hatjares",
    triggers: "So vazdel i dukh",
    specialty: "Doktori specialistikano",
    redFlag: "Sama: sas alosardo jekh sigardiari znako.",
    noRedFlag: "Na sas alosardo nijekh sigardiari znako.",
    copy: "Kopijisar and-e lila",
    copied: "Kopijime",
    copyFailed: "Nashti kopijisardilo. Sikav o ekrano le doktoreske.",
    savedNote: "O lil si gata",
    whatsapp: "WhatsApp",
    screenFor: "Vash o doktori",
    patientSummary: "Simptome e pacientoske",
    close: "Phandav",
    inRomanian: "Sikav pe rumunikani chib",
    inOwnLanguage: "Sikav pe romani chib",
    myLanguageTab: "Pe miri chib",
    romanianTab: "În română",
    qrTitle: "Offline QR kodo vash o notitse thaj o doktori",
    qrHint: "Skanisar kadava QR kodo le telefonoska kamerasa (iPhone vaj Android) te thos o xarno lil direktno ande notitse, bi internetosko.",
    savePdf: "Arakh sar PDF",
    listen: "Ašun o rezumato",
    stopListening: "Ačhav o drabaripen",
  },
};

const COPY = SUMMARY_COPY;

export function TriageSummaryCard({
  bodyArea,
  anatomicalStructure,
  painLocation,
  symptoms,
  selfCareTips = [],
  redFlagNoticed = false,
  painLevel,
  duration,
  sensations = [],
  triggers,
  recommendedSpecialty,
  clinicalMechanism,
  recommendationDetail,
  romanianRecommendationDetail,
  reproduceUrl,
  romanianReproduceUrl,
  noteUrl,
  romanianNoteUrl,
  doctorNotes = [],
  doctorSymptom,
  romanian,
  doctorOpen,
  onDoctorOpenChange,
  bare = false,
  className = "",
  lang,
  date,
}: TriageSummaryCardProps) {
  const activeLang = useSafeLanguage(lang);
  const dict = getHealthCheckTranslations(activeLang);
  const t = COPY[activeLang] ?? COPY.ro;
  const voice = useReadAloud(activeLang);

  const [copyState, setCopyState] = useState<"idle" | "copied" | "saved" | "failed">("idle");
  const [internalOpen, setInternalOpen] = useState(false);
  const [showRomanian, setShowRomanian] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qrIdPrefix = useId();
  const inlineQrHintId = `${qrIdPrefix}-inline-qr-hint`;
  const dialogQrHintId = `${qrIdPrefix}-dialog-qr-hint`;
  const [inlineQrHintOpen, setInlineQrHintOpen] = useState(false);
  const [inlineQrHintPinned, setInlineQrHintPinned] = useState(false);
  const [dialogQrHintOpen, setDialogQrHintOpen] = useState(false);
  const [dialogQrHintPinned, setDialogQrHintPinned] = useState(false);
  const inlineQrWrapRef = useRef<HTMLDivElement>(null);
  const dialogQrWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!inlineQrHintOpen && !dialogQrHintOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (inlineQrHintOpen && inlineQrWrapRef.current && target && !inlineQrWrapRef.current.contains(target)) {
        setInlineQrHintPinned(false);
        setInlineQrHintOpen(false);
      }
      if (dialogQrHintOpen && dialogQrWrapRef.current && target && !dialogQrWrapRef.current.contains(target)) {
        setDialogQrHintPinned(false);
        setDialogQrHintOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && inlineQrHintOpen) {
        setInlineQrHintPinned(false);
        setInlineQrHintOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inlineQrHintOpen, dialogQrHintOpen]);

  const isControlled = doctorOpen !== undefined;
  const open = isControlled ? doctorOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onDoctorOpenChange?.(value);
    if (!value) {
      setShowRomanian(false);
      setDialogQrHintOpen(false);
      setDialogQrHintPinned(false);
    }
  };
  useDialogFocus(dialogRef, open, () => {
    if (dialogQrHintOpen) {
      setDialogQrHintPinned(false);
      setDialogQrHintOpen(false);
      return;
    }
    setOpen(false);
  });

  const effectiveDate = useMemo(() => date ?? new Date(), [date]);
  const currentDate = formatDate(effectiveDate, activeLang);
  const romanianDate = formatDate(effectiveDate, "ro");
  const todayIso = useMemo(() => {
    const y = effectiveDate.getFullYear();
    const m = String(effectiveDate.getMonth() + 1).padStart(2, "0");
    const d = String(effectiveDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [effectiveDate]);

  const warningNotice = redFlagNoticed ? t.redFlag : t.noRedFlag;

  const rows: SummaryRow[] = [
    { label: dict.ui.areaLabel, value: bodyArea },
    ...(anatomicalStructure ? [{ label: t.structure, value: anatomicalStructure }] : []),
    { label: dict.ui.symptomLabel, value: symptoms.join(", ") },
    ...(painLevel !== undefined ? [{ label: dict.ui.intensityLabel, value: String(painLevel) }] : []),
    ...(duration ? [{ label: dict.ui.durationLabel, value: duration }] : []),
    ...(sensations.length > 0 ? [{ label: t.sensation, value: sensations.join(", ") }] : []),
    ...(triggers ? [{ label: t.triggers, value: triggers }] : []),
    ...(recommendedSpecialty ? [{ label: t.specialty, value: recommendedSpecialty }] : []),
  ];

  const extraRecLine = useMemo(
    () =>
      recommendationDetail && !doctorNotes.includes(recommendationDetail)
        ? [recommendationDetail]
        : [],
    [doctorNotes, recommendationDetail],
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- preserved intact per audio-caller cleanup spec
  const formattedSummary = [
    `${t.title} (${currentDate}):`,
    ...rows.map((r) => `${r.label}: ${r.value}`),
    ...extraRecLine,
    ...doctorNotes,
    warningNotice,
    ...(noteUrl || reproduceUrl ? [noteUrl ?? reproduceUrl ?? ""] : []),
  ].join("\n");

  const copyDone = copyState === "copied" || copyState === "saved";

  /** Clipboard API first; old WebViews and locked-down browsers fall back to a hidden textarea. */
  function legacyCopy(text: string): boolean {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }

  async function copyText(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacyCopy(text);
    }
  }

  const useRomanianInDialog = Boolean(showRomanian && romanian);
  const ownScreenRows = doctorSymptom
    ? rows.map((r) => (r.label === dict.ui.symptomLabel ? { ...r, value: doctorSymptom } : r))
    : rows;
  const screenRows = useRomanianInDialog && romanian ? romanian.rows : ownScreenRows;
  const screenNotes = useRomanianInDialog && romanian ? romanian.notes : doctorNotes;
  const activeDialogLang: Lang = useRomanianInDialog ? "ro" : activeLang;
  const activeDialogCopy = useRomanianInDialog ? COPY.ro : t;
  const activeDialogDate = useRomanianInDialog ? romanianDate : currentDate;
  const activeRecommendationDetail = useRomanianInDialog
    ? (romanianRecommendationDetail ?? recommendationDetail)
    : recommendationDetail;
  const activeReproduceUrl = useRomanianInDialog ? (romanianReproduceUrl ?? reproduceUrl) : reproduceUrl;
  const activeNoteUrl = useRomanianInDialog ? (romanianNoteUrl ?? noteUrl) : noteUrl;

  /**
   * "Copy to notes": the note goes on the clipboard, and on an iPhone or Android phone the
   * system share sheet opens as well, where Notes, Keep or Samsung Notes saves it in one tap.
   * A computer only copies. Both calls start inside the tap, before anything is awaited:
   * Safari refuses a share that begins after the tap has ended.
   */
  async function handleCopyToNotes(forDialog = false) {
    const copy = forDialog ? activeDialogCopy : t;
    const dateLabel = forDialog ? activeDialogDate : currentDate;
    const targetRows = forDialog ? screenRows : ownScreenRows;
    const targetNotes =
      forDialog && useRomanianInDialog ? screenNotes : [...extraRecLine, ...doctorNotes];
    const statusLine = redFlagNoticed ? copy.redFlag : copy.noRedFlag;
    const shareLink = forDialog ? (activeNoteUrl ?? activeReproduceUrl) : (noteUrl ?? reproduceUrl);
    const noteBody = [
      `${copy.title} (${dateLabel})`,
      "",
      ...targetRows.map((r) => `${r.label}: ${r.value}`),
      ...(targetNotes.length > 0 ? ["", ...targetNotes] : []),
      "",
      statusLine,
      ...(shareLink ? ["", shareLink] : []),
    ].join("\n");

    const copying = copyText(noteBody);
    let shared = false;
    if (detectPhonePlatform() && typeof navigator.share === "function") {
      try {
        // No separate `url` field: with one, Apple Notes saves a link bookmark instead of the text.
        await navigator.share({ title: copy.patientSummary, text: noteBody });
        shared = true;
      } catch {
        // Share sheet closed or refused: the note is still on the clipboard.
      }
    }
    const copied = await copying;
    setCopyState(shared ? "saved" : copied ? "copied" : "failed");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState("idle"), 3000);
  }

  const inlinePainDiagramSvg = useMemo(
    () =>
      painLocation
        ? buildPainAreaDiagramSvg({
            part: painLocation.part,
            subRegion: painLocation.subRegion,
            side: painLocation.side,
            bodyProfile: painLocation.bodyProfile,
            urgent: redFlagNoticed,
            lang: activeLang,
          })
        : null,
    [activeLang, painLocation, redFlagNoticed],
  );

  const dialogPainDiagramSvg = useMemo(
    () =>
      painLocation
        ? buildPainAreaDiagramSvg({
            part: painLocation.part,
            subRegion: painLocation.subRegion,
            side: painLocation.side,
            bodyProfile: painLocation.bodyProfile,
            urgent: redFlagNoticed,
            lang: activeDialogLang,
          })
        : null,
    [activeDialogLang, painLocation, redFlagNoticed],
  );

  const dialogSecondaryLocation = useMemo(() => {
    if (painLocation?.subRegion) {
      const hc = HC_COPY[activeDialogLang] ?? HC_COPY.ro;
      const base = getLocalizedSubRegion(painLocation.subRegion, activeDialogLang).label;
      if (painLocation.side === "Left") return `${base}, ${hc.left}`;
      if (painLocation.side === "Right") return `${base}, ${hc.right}`;
      return base;
    }
    return useRomanianInDialog ? undefined : anatomicalStructure;
  }, [activeDialogLang, anatomicalStructure, painLocation, useRomanianInDialog]);

  const inlineQrPayload = useMemo(() => {
    const copy = t;
    const targetRows = ownScreenRows;
    const targetNotes = [...extraRecLine, ...doctorNotes];
    const statusLine = redFlagNoticed ? copy.redFlag : copy.noRedFlag;
    return [
      `${copy.title} (${currentDate})`,
      ...targetRows.map((r) => `${r.label}: ${r.value}`),
      ...targetNotes,
      statusLine,
    ].join("\n");
  }, [currentDate, doctorNotes, extraRecLine, ownScreenRows, redFlagNoticed, t]);

  const dialogQrPayload = useMemo(() => {
    const copy = activeDialogCopy;
    const targetRows = screenRows;
    const targetNotes = useRomanianInDialog ? screenNotes : [...extraRecLine, ...doctorNotes];
    const statusLine = redFlagNoticed ? copy.redFlag : copy.noRedFlag;
    return [
      `${copy.title} (${activeDialogDate})`,
      ...targetRows.map((r) => `${r.label}: ${r.value}`),
      ...targetNotes,
      statusLine,
    ].join("\n");
  }, [
    activeDialogCopy,
    activeDialogDate,
    doctorNotes,
    extraRecLine,
    redFlagNoticed,
    screenNotes,
    screenRows,
    useRomanianInDialog,
  ]);

  const inlineQrSvg = useMemo(() => renderClinicalQrSvgData(inlineQrPayload, 4), [inlineQrPayload]);
  const qrSvg = useMemo(() => renderClinicalQrSvgData(dialogQrPayload, 4), [dialogQrPayload]);

  /** "Save as PDF": print the clinical summary with its anatomical pain diagram and vector QR handoff. */
  function handlePrint() {
    const printLang: Lang = showRomanian ? "ro" : activeLang;
    const copy = printLang === "ro" ? COPY.ro : t;
    const dateLabel = printLang === "ro" ? romanianDate : currentDate;
    const printDict = getHealthCheckTranslations(printLang);
    const painCopy = PAIN_DIAGRAM_COPY[printLang] ?? PAIN_DIAGRAM_COPY.ro;
    const hcCopy = HC_COPY[printLang] ?? HC_COPY.ro;
    const printPrimaryLoc = painLocation ? printDict.bodyParts[painLocation.part].title : bodyArea;
    const printSecondaryLoc = painLocation?.subRegion
      ? `${getLocalizedSubRegion(painLocation.subRegion, printLang).label}${
          painLocation.side === "Left"
            ? `, ${hcCopy.left}`
            : painLocation.side === "Right"
              ? `, ${hcCopy.right}`
              : ""
        }`
      : showRomanian
        ? undefined
        : anatomicalStructure;
    const printDiagramSvg = painLocation
      ? buildPainAreaDiagramSvg({
          part: painLocation.part,
          subRegion: painLocation.subRegion,
          side: painLocation.side,
          bodyProfile: painLocation.bodyProfile,
          urgent: redFlagNoticed,
          lang: printLang,
        })
      : undefined;
    const printRows = showRomanian && romanian ? romanian.rows : ownScreenRows;
    const printNotes = showRomanian && romanian ? romanian.notes : [...extraRecLine, ...doctorNotes];
    const printQr = showRomanian ? qrSvg : inlineQrSvg;
    const printRecDetail =
      printLang === "ro" ? (romanianRecommendationDetail ?? recommendationDetail) : recommendationDetail;

    printSummary({
      lang: printLang,
      meta: `${copy.screenFor} — ${dateLabel}`,
      title: copy.patientSummary,
      rows: printRows,
      notes: printNotes,
      status: redFlagNoticed ? copy.redFlag : copy.noRedFlag,
      urgent: redFlagNoticed,
      painDiagram:
        painLocation && printDiagramSvg
          ? {
              svg: printDiagramSvg,
              heading: painCopy.heading,
              primaryLocation: printPrimaryLoc,
              secondaryLocation: printSecondaryLoc,
            }
          : undefined,
      qr: {
        size: printQr.size,
        path: printQr.path,
        title: copy.qrTitle,
        detail: printRecDetail,
        hint: copy.qrHint,
      },
      footer: printDict.ui.disclaimer,
      fileName: `${copy.patientSummary} - ${todayIso}`,
    });
  }

  const surfaceClass = bare
    ? "rounded-2xl bg-surface-subtle/60"
    : "rounded-2xl border border-border bg-card";

  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  const primaryActionBtn = `press-solid inline-flex min-h-11 w-full min-w-0 items-center justify-center whitespace-nowrap rounded-xl bg-sapphire px-4 text-sm font-semibold text-white shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:bg-sapphire-light sm:w-auto sm:flex-1 ${focusRing}`;

  const iconActionBtn = `press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-border-control bg-card text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/50 hover:bg-sapphire-soft/45 hover:text-sapphire ${focusRing}`;

  const iconActiveBtn = `press-row inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border border-sapphire bg-sapphire-soft text-sapphire shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none ${focusRing}`;

  const modalCloseBtn = `press-row inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-border-control bg-card px-5 text-sm font-semibold text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 hover:bg-sapphire-soft/30 ${focusRing}`;

  return (
    <section className={`select-text ${bare ? "pt-2.5" : "border-t border-border pt-6"} ${className}`}>
      {bare ? (
        <p className="text-xs font-medium text-muted-foreground tabular-nums">{currentDate}</p>
      ) : (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">{dict.ui.summaryHeading}</h3>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">{currentDate}</span>
        </div>
      )}

      {inlinePainDiagramSvg && painLocation && (
        <div className={`mt-3 flex items-center gap-3.5 ${surfaceClass} p-4`}>
          <div
            className="w-28 shrink-0 [&_svg]:h-auto [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: inlinePainDiagramSvg }}
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {(PAIN_DIAGRAM_COPY[activeLang] ?? PAIN_DIAGRAM_COPY.ro).heading}
            </p>
            <p className="mt-0.5 text-[15px] font-semibold leading-snug text-foreground">{bodyArea}</p>
            {anatomicalStructure && (
              <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">{anatomicalStructure}</p>
            )}
          </div>
        </div>
      )}

      <dl className={`mt-3 select-text divide-y divide-border overflow-hidden ${surfaceClass} tabular-nums`}>
        {rows.map((row, index) => (
          <div
            key={row.label}
            style={{ "--i": index } as CSSProperties}
            className="list-in grid grid-cols-[minmax(7rem,38%)_1fr] items-baseline gap-3 px-4 py-3 even:bg-surface-subtle/45"
          >
            <dt className="text-[13px] font-medium text-muted-foreground">{row.label}</dt>
            <dd className="text-[15px] font-semibold leading-snug text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {clinicalMechanism && (
        <p className="mt-3 select-text text-base leading-relaxed text-muted-foreground">{clinicalMechanism}</p>
      )}

      {selfCareTips.length > 0 && (
        <div className="mt-4 select-text">
          <p className="text-sm font-semibold text-foreground">{dict.ui.safeSelfCareHeading}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-base text-foreground/85 marker:text-muted-foreground">
            {selfCareTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {inlineQrSvg.size > 0 && (
        <div
          ref={inlineQrWrapRef}
          onMouseLeave={() => {
            if (!inlineQrHintPinned) setInlineQrHintOpen(false);
          }}
          className={`relative mt-3.5 flex items-center gap-3.5 ${surfaceClass} p-4`}
        >
          <button
            type="button"
            data-qr-trigger="inline"
            aria-label={t.qrTitle}
            aria-expanded={inlineQrHintOpen}
            aria-describedby={inlineQrHintOpen ? inlineQrHintId : undefined}
            onMouseEnter={() => setInlineQrHintOpen(true)}
            onFocus={() => setInlineQrHintOpen(true)}
            onBlur={(e) => {
              if (!inlineQrWrapRef.current?.contains(e.relatedTarget as Node | null)) {
                setInlineQrHintPinned(false);
                setInlineQrHintOpen(false);
              }
            }}
            onClick={() => {
              setInlineQrHintPinned((prev) => {
                const next = !prev;
                setInlineQrHintOpen(next);
                return next;
              });
            }}
            className={`press-row shrink-0 cursor-pointer rounded-xl border border-border-control bg-white p-2 shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 ${focusRing}`}
          >
            <svg
              viewBox={`0 0 ${inlineQrSvg.size} ${inlineQrSvg.size}`}
              shapeRendering="crispEdges"
              aria-hidden="true"
              className="h-20 w-20"
            >
              <rect width={inlineQrSvg.size} height={inlineQrSvg.size} fill="#ffffff" />
              <path d={inlineQrSvg.path} fill="#0b132b" />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground sm:text-sm">{t.qrTitle}</p>
            {recommendationDetail && (
              <p className="mt-1.5 rounded-xl bg-sapphire-soft/65 px-2.5 py-1.5 text-xs font-semibold leading-snug text-foreground dark:bg-sapphire/15">
                {recommendationDetail}
              </p>
            )}
          </div>
          {inlineQrHintOpen && (
            <div className="absolute bottom-full left-0 right-0 z-30 pb-2">
              <div
                id={inlineQrHintId}
                role="tooltip"
                data-qr-hint="inline"
                className="popover-in rounded-xl border border-stone-200/90 bg-card p-3.5 text-xs leading-relaxed text-foreground shadow-lg dark:border-stone-800"
              >
                {t.qrHint}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-nowrap sm:items-center sm:gap-2 print:hidden">
        <button type="button" onClick={() => setOpen(true)} className={primaryActionBtn}>
          <span>{dict.ui.showDoctor}</span>
        </button>
        <div className="flex w-full flex-nowrap items-center justify-center gap-2 sm:w-auto sm:shrink-0 sm:justify-end">
          {voice.available && (
            <button
              type="button"
              aria-pressed={voice.speaking}
              aria-label={voice.speaking ? t.stopListening : t.listen}
              title={voice.speaking ? t.stopListening : t.listen}
              onClick={() => {
                if (voice.speaking) {
                  voice.stop();
                } else {
                  voice.speak(
                    [
                      `${t.title} (${currentDate})`,
                      ...rows.map((r) => `${r.label}: ${r.value}`),
                      ...extraRecLine,
                      ...doctorNotes,
                      warningNotice,
                    ].filter(Boolean),
                  );
                }
              }}
              className={voice.speaking ? iconActiveBtn : iconActionBtn}
            >
              {voice.speaking ? (
                <span aria-hidden="true" className="block h-3 w-3 rounded-xs bg-current" />
              ) : (
                <VolumeIcon className="h-4 w-4 shrink-0" />
              )}
              <span className="sr-only">{voice.speaking ? t.stopListening : t.listen}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleCopyToNotes(false)}
            aria-label={copyState === "saved" ? t.savedNote : copyState === "copied" ? t.copied : t.copy}
            title={copyState === "saved" ? t.savedNote : copyState === "copied" ? t.copied : t.copy}
            className={copyDone ? iconActiveBtn : iconActionBtn}
          >
            {copyDone ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : <CopyIcon className="h-4 w-4 shrink-0" />}
            <span className="sr-only" aria-live="polite">
              {copyState === "saved" ? t.savedNote : copyState === "copied" ? t.copied : t.copy}
            </span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            aria-label={t.savePdf}
            title={t.savePdf}
            className={iconActionBtn}
          >
            <PrinterIcon className="h-4 w-4 shrink-0" />
            <span className="sr-only">{t.savePdf}</span>
          </button>
          <FamilyShareButton
            iconOnly
            align="right"
            title={t.patientSummary}
            text={inlineQrPayload}
            url={reproduceUrl ?? noteUrl}
            lang={activeLang}
          />
        </div>
      </div>
      {copyState === "failed" && (
        <p role="status" className="mt-2 text-sm font-medium text-primary">
          {t.copyFailed}
        </p>
      )}

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="hc-backdrop fixed inset-0 z-50 flex items-stretch justify-center bg-ink-950/60 print:static print:bg-transparent print:p-0 sm:items-center sm:p-4">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={activeDialogCopy.patientSummary}
              className="hc-sheet relative flex w-full max-w-xl flex-col overflow-hidden border border-border bg-card print:max-h-none print:overflow-visible print:shadow-none sm:max-h-[90vh] sm:rounded-2xl sm:shadow-xl"
            >
              <div
                aria-hidden="true"
                className={`h-[3px] w-full shrink-0 ${redFlagNoticed ? "bg-primary" : "bg-sapphire"}`}
              />

              {activeLang !== "ro" && romanian && (
                <div className="shrink-0 border-b border-border bg-card px-5 py-3 print:hidden sm:px-6">
                  <div
                    role="group"
                    aria-label={t.screenFor}
                    className="flex flex-nowrap gap-1 rounded-xl bg-muted p-1"
                  >
                    <button
                      type="button"
                      aria-pressed={!showRomanian}
                      onClick={() => setShowRomanian(false)}
                      className={`inline-flex min-h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm ${
                        !showRomanian
                          ? "bg-card text-sapphire shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="min-w-0 truncate">{t.myLanguageTab}</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={showRomanian}
                      onClick={() => setShowRomanian(true)}
                      className={`inline-flex min-h-11 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-2.5 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:text-sm ${
                        showRomanian
                          ? "bg-card text-sapphire shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="min-w-0 truncate">{t.romanianTab}</span>
                    </button>
                  </div>
                </div>
              )}

              <div
                lang={activeDialogLang}
                className="flex-1 select-text overflow-y-auto p-5 print:overflow-visible print:p-0 sm:p-6"
              >
                {/* Switching between the reader's language and Romanian settles the new text in place. */}
                <div key={activeDialogLang} className="swap-in">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3.5">
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {activeDialogCopy.patientSummary}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground tabular-nums sm:text-sm">
                    {activeDialogCopy.screenFor} — {activeDialogDate}
                  </p>
                </div>

                {dialogPainDiagramSvg && painLocation && (
                  <div className="mt-4 flex items-center gap-4 rounded-2xl bg-surface-subtle/65 p-4">
                    <div
                      className="w-32 shrink-0 [&_svg]:h-auto [&_svg]:w-full"
                      dangerouslySetInnerHTML={{ __html: dialogPainDiagramSvg }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {(PAIN_DIAGRAM_COPY[activeDialogLang] ?? PAIN_DIAGRAM_COPY.ro).heading}
                      </p>
                      <p className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">
                        {getHealthCheckTranslations(activeDialogLang).bodyParts[painLocation.part].title}
                      </p>
                      {dialogSecondaryLocation && (
                        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                          {dialogSecondaryLocation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <dl className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-subtle/35 tabular-nums">
                  {screenRows.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[minmax(7rem,38%)_1fr] items-baseline gap-3 px-4 py-3 even:bg-surface-subtle/45"
                    >
                      <dt className="text-xs font-medium text-muted-foreground sm:text-sm">{row.label}</dt>
                      <dd className="text-base font-semibold leading-snug text-foreground">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                {screenNotes.length > 0 && (
                  <div className="mt-3.5 space-y-2 rounded-2xl bg-surface-subtle/55 p-4">
                    {screenNotes.map((note, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground sm:text-base">
                        {note}
                      </p>
                    ))}
                  </div>
                )}

                <p
                  className={`mt-3.5 rounded-xl border px-4 py-2.5 text-sm font-semibold sm:text-base ${
                    redFlagNoticed
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "border-border bg-surface-subtle/45 text-muted-foreground"
                  }`}
                >
                  {redFlagNoticed ? activeDialogCopy.redFlag : activeDialogCopy.noRedFlag}
                </p>

                {qrSvg.size > 0 && (
                  <div
                    ref={dialogQrWrapRef}
                    onMouseLeave={() => {
                      if (!dialogQrHintPinned) setDialogQrHintOpen(false);
                    }}
                    className="relative mt-3.5 flex flex-col items-center gap-3.5 rounded-2xl bg-surface-subtle/55 p-4 sm:flex-row sm:items-center"
                  >
                    <button
                      type="button"
                      data-qr-trigger="dialog"
                      aria-label={activeDialogCopy.qrTitle}
                      aria-expanded={dialogQrHintOpen}
                      aria-describedby={dialogQrHintOpen ? dialogQrHintId : undefined}
                      onMouseEnter={() => setDialogQrHintOpen(true)}
                      onFocus={() => setDialogQrHintOpen(true)}
                      onBlur={(e) => {
                        if (!dialogQrWrapRef.current?.contains(e.relatedTarget as Node | null)) {
                          setDialogQrHintPinned(false);
                          setDialogQrHintOpen(false);
                        }
                      }}
                      onClick={() => {
                        setDialogQrHintPinned((prev) => {
                          const next = !prev;
                          setDialogQrHintOpen(next);
                          return next;
                        });
                      }}
                      className={`press-row shrink-0 cursor-pointer rounded-xl border border-border-control bg-white p-2 shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none hover:border-sapphire/60 ${focusRing}`}
                    >
                      <svg
                        viewBox={`0 0 ${qrSvg.size} ${qrSvg.size}`}
                        shapeRendering="crispEdges"
                        aria-hidden="true"
                        className="h-28 w-28"
                      >
                        <rect width={qrSvg.size} height={qrSvg.size} fill="#ffffff" />
                        <path d={qrSvg.path} fill="#0b132b" />
                      </svg>
                    </button>
                    <div className="min-w-0 text-center sm:text-left">
                      <p className="text-sm font-semibold text-foreground">{activeDialogCopy.qrTitle}</p>
                      {activeRecommendationDetail && (
                        <p className="mt-1.5 rounded-xl bg-sapphire-soft/65 px-2.5 py-1.5 text-xs font-semibold leading-snug text-foreground dark:bg-sapphire/15">
                          {activeRecommendationDetail}
                        </p>
                      )}
                    </div>
                    {dialogQrHintOpen && (
                      <div className="absolute bottom-full left-0 right-0 z-30 pb-2">
                        <div
                          id={dialogQrHintId}
                          role="tooltip"
                          data-qr-hint="dialog"
                          className="popover-in rounded-xl border border-stone-200/90 bg-card p-3.5 text-xs leading-relaxed text-foreground shadow-lg dark:border-stone-800"
                        >
                          {activeDialogCopy.qrHint}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>

              <div className="flex shrink-0 flex-nowrap items-center justify-between gap-2 border-t border-border bg-card px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] print:hidden sm:px-6">
                <div className="flex flex-nowrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleCopyToNotes(true)}
                    aria-label={
                      copyState === "saved"
                        ? activeDialogCopy.savedNote
                        : copyState === "copied"
                          ? activeDialogCopy.copied
                          : activeDialogCopy.copy
                    }
                    title={
                      copyState === "saved"
                        ? activeDialogCopy.savedNote
                        : copyState === "copied"
                          ? activeDialogCopy.copied
                          : activeDialogCopy.copy
                    }
                    className={copyDone ? iconActiveBtn : iconActionBtn}
                  >
                    {copyDone ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : <CopyIcon className="h-4 w-4 shrink-0" />}
                    <span className="sr-only">
                      {copyState === "saved"
                        ? activeDialogCopy.savedNote
                        : copyState === "copied"
                          ? activeDialogCopy.copied
                          : activeDialogCopy.copy}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    aria-label={activeDialogCopy.savePdf}
                    title={activeDialogCopy.savePdf}
                    className={iconActionBtn}
                  >
                    <PrinterIcon className="h-4 w-4 shrink-0" />
                    <span className="sr-only">{activeDialogCopy.savePdf}</span>
                  </button>
                </div>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className={modalCloseBtn}
                >
                  <span className="min-w-0 truncate">{activeDialogCopy.close}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

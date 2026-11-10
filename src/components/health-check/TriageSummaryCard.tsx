"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, CopyIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
import { renderClinicalQrSvgData } from "./clinical-qr-svg";
import { useDialogFocus } from "./useDialogFocus";
import { printSummary } from "./printSummary";

export interface SummaryRow {
  label: string;
  value: string;
}

export interface TriageSummaryCardProps {
  bodyArea: string;
  anatomicalStructure?: string;
  symptoms: string[];
  selfCareTips?: string[];
  redFlagNoticed?: boolean;
  painLevel?: number | string;
  duration?: string;
  sensations?: string[];
  triggers?: string;
  recommendedSpecialty?: string;
  clinicalMechanism?: string;
  /** Extra lines for the doctor screen: care level, guidance, emergency reason. */
  doctorNotes?: string[];
  /** Clinical wording of the symptom for the doctor screen (the page shows the patient's words). */
  doctorSymptom?: string;
  /** The same summary in Romanian, offered on the doctor screen for non-Romanian routes. */
  romanian?: { rows: SummaryRow[]; notes: string[] };
  /** Controlled doctor screen (the page's action bar opens it). */
  doctorOpen?: boolean;
  onDoctorOpenChange?: (open: boolean) => void;
  /** Inside a fold that already draws the divider and heading spacing. */
  bare?: boolean;
  className?: string;
  lang?: Lang;
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
function formatDate(date: Date, lang: Lang): string {
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

const COPY: Record<
  Lang,
  {
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
  }
> = {
  ro: {
    title: "Rezumatul simptomelor, RediHealth",
    structure: "Punct ales pe corp",
    sensation: "Senzație",
    triggers: "Factori declanșatori",
    specialty: "Medic specialist sugerat",
    redFlag: "Atenție: a fost ales un semn de urgență.",
    noRedFlag: "Nu a fost ales niciun semn de urgență.",
    copy: "Copiază",
    copied: "Copiat",
    copyFailed: "Nu s-a putut copia. Arată ecranul medicului.",
    whatsapp: "WhatsApp",
    screenFor: "Pentru medic",
    patientSummary: "Simptomele pacientului",
    close: "Închide",
    inRomanian: "Arată în română",
    inOwnLanguage: "Arată în limba mea",
    myLanguageTab: "În limba mea",
    romanianTab: "În română",
    qrTitle: "Cod QR offline pentru medic",
    qrHint: "Medicul sau asistentul de la triaj poate scana codul QR cu camera telefonului ca să preia rezumatul fără internet.",
    savePdf: "Salvează PDF",
  },
  en: {
    title: "Symptom summary, RediHealth",
    structure: "Point chosen on the body",
    sensation: "Sensation",
    triggers: "Triggers",
    specialty: "Suggested specialty",
    redFlag: "Warning: an emergency sign was chosen.",
    noRedFlag: "No emergency sign was chosen.",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy. Show the screen to the doctor instead.",
    whatsapp: "WhatsApp",
    screenFor: "For the doctor",
    patientSummary: "Patient's symptoms",
    close: "Close",
    inRomanian: "Show in Romanian",
    inOwnLanguage: "Show in English",
    myLanguageTab: "In my language",
    romanianTab: "În română",
    qrTitle: "Offline QR handoff for the doctor",
    qrHint: "A doctor or triage nurse can scan this QR code offline to read your clinical summary.",
    savePdf: "Save as PDF",
  },
  sq: {
    title: "Përmbledhja e simptomave, RediHealth",
    structure: "Pika e zgjedhur në trup",
    sensation: "Ndjesia",
    triggers: "Faktorët nxitës",
    specialty: "Specialiteti i sugjeruar",
    redFlag: "Kujdes: u zgjodh një shenjë urgjence.",
    noRedFlag: "Nuk u zgjodh asnjë shenjë urgjence.",
    copy: "Kopjo",
    copied: "U kopjua",
    copyFailed: "Nuk u kopjua. Tregoja mjekut ekranin.",
    whatsapp: "WhatsApp",
    screenFor: "Për mjekun",
    patientSummary: "Simptomat e pacientit",
    close: "Mbyll",
    inRomanian: "Shfaq në rumanisht",
    inOwnLanguage: "Shfaq në shqip",
    myLanguageTab: "Në gjuhën time",
    romanianTab: "În română",
    qrTitle: "Kod QR offline për mjekun",
    qrHint: "Mjeku ose infermieri i triazhit mund ta skanojë këtë kod QR pa internet për të lexuar përmbledhjen.",
    savePdf: "Ruaje si PDF",
  },
  it: {
    title: "Riepilogo dei sintomi, RediHealth",
    structure: "Punto scelto sul corpo",
    sensation: "Sensazione",
    triggers: "Fattori scatenanti",
    specialty: "Specialità suggerita",
    redFlag: "Attenzione: è stato scelto un segno di emergenza.",
    noRedFlag: "Non è stato scelto nessun segno di emergenza.",
    copy: "Copia",
    copied: "Copiato",
    copyFailed: "Copia non riuscita. Mostra lo schermo al medico.",
    whatsapp: "WhatsApp",
    screenFor: "Per il medico",
    patientSummary: "Sintomi del paziente",
    close: "Chiudi",
    inRomanian: "Mostra in rumeno",
    inOwnLanguage: "Mostra in italiano",
    myLanguageTab: "Nella mia lingua",
    romanianTab: "În română",
    qrTitle: "Codice QR offline per il medico",
    qrHint: "Il medico o l'infermiere del triage può scansionare questo codice QR senza connessione per leggere il riepilogo.",
    savePdf: "Salva come PDF",
  },
  hr: {
    title: "Sažetak simptoma, RediHealth",
    structure: "Odabrana točka na tijelu",
    sensation: "Osjet",
    triggers: "Okidači",
    specialty: "Predložena specijalnost",
    redFlag: "Upozorenje: odabran je znak hitnog stanja.",
    noRedFlag: "Nije odabran nijedan znak hitnog stanja.",
    copy: "Kopiraj",
    copied: "Kopirano",
    copyFailed: "Kopiranje nije uspjelo. Pokaži zaslon liječniku.",
    whatsapp: "WhatsApp",
    screenFor: "Za liječnika",
    patientSummary: "Simptomi pacijenta",
    close: "Zatvori",
    inRomanian: "Prikaži na rumunjskom",
    inOwnLanguage: "Prikaži na hrvatskom",
    myLanguageTab: "Na mom jeziku",
    romanianTab: "În română",
    qrTitle: "Offline QR kod za liječnika",
    qrHint: "Liječnik ili medicinska sestra na trijaži mogu skenirati ovaj QR kod bez interneta kako bi pročitali sažetak.",
    savePdf: "Spremi kao PDF",
  },
  rom: {
    title: "Skurto lil le simptomengo, RediHealth",
    structure: "Alosardo than pe trupo",
    sensation: "Sar hatjares",
    triggers: "So vazdel i dukh",
    specialty: "Doktori specialistikano",
    redFlag: "Sama: sas alosardo jekh sigardiari znako.",
    noRedFlag: "Na sas alosardo nijekh sigardiari znako.",
    copy: "Kopijisar",
    copied: "Kopijime",
    copyFailed: "Nashti kopijisardilo. Sikav o ekrano le doktoreske.",
    whatsapp: "WhatsApp",
    screenFor: "Vash o doktori",
    patientSummary: "Simptome e pacientoske",
    close: "Phandav",
    inRomanian: "Sikav pe rumunikani chib",
    inOwnLanguage: "Sikav pe romani chib",
    myLanguageTab: "Pe miri chib",
    romanianTab: "În română",
    qrTitle: "Offline QR kodo vash o doktori",
    qrHint: "O doktori shaj skaninel kadava QR kodo bi internetesko te ginavel o skurto lil.",
    savePdf: "Arakh sar PDF",
  },
};

export function TriageSummaryCard({
  bodyArea,
  anatomicalStructure,
  symptoms,
  selfCareTips = [],
  redFlagNoticed = false,
  painLevel,
  duration,
  sensations = [],
  triggers,
  recommendedSpecialty,
  clinicalMechanism,
  doctorNotes = [],
  doctorSymptom,
  romanian,
  doctorOpen,
  onDoctorOpenChange,
  bare = false,
  className = "",
  lang,
}: TriageSummaryCardProps) {
  const activeLang = useSafeLanguage(lang);
  const dict = getHealthCheckTranslations(activeLang);
  const t = COPY[activeLang] ?? COPY.ro;

  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [internalOpen, setInternalOpen] = useState(false);
  const [showRomanian, setShowRomanian] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const isControlled = doctorOpen !== undefined;
  const open = isControlled ? doctorOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (!isControlled) setInternalOpen(value);
    onDoctorOpenChange?.(value);
    if (!value) setShowRomanian(false);
  };
  useDialogFocus(dialogRef, open, () => setOpen(false));

  const currentDate = formatDate(new Date(), activeLang);
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

  const formattedSummary = [
    `${t.title} (${currentDate}):`,
    ...rows.map((r) => `${r.label}: ${r.value}`),
    ...doctorNotes,
    warningNotice,
  ].join("\n");

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

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(formattedSummary);
      ok = true;
    } catch {
      ok = legacyCopy(formattedSummary);
    }
    setCopyState(ok ? "copied" : "failed");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyState("idle"), 3000);
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(formattedSummary)}`, "_blank", "noopener,noreferrer");
  }

  const ownScreenRows = doctorSymptom
    ? rows.map((r) => (r.label === dict.ui.symptomLabel ? { ...r, value: doctorSymptom } : r))
    : rows;
  const screenRows = showRomanian && romanian ? romanian.rows : ownScreenRows;
  const screenNotes = showRomanian && romanian ? romanian.notes : doctorNotes;
  const activeDialogCopy = showRomanian ? COPY.ro : t;
  const qrPayload = useMemo(() => {
    const header = `${activeDialogCopy.title} (${showRomanian ? formatDate(new Date(), "ro") : currentDate})`;
    const bodyLines = screenRows.map((r) => `${r.label}: ${r.value}`);
    const statusLine = redFlagNoticed ? activeDialogCopy.redFlag : activeDialogCopy.noRedFlag;
    return [header, ...bodyLines, ...screenNotes, statusLine].join("\n");
  }, [activeDialogCopy, currentDate, redFlagNoticed, screenNotes, screenRows, showRomanian]);
  const qrSvg = useMemo(() => renderClinicalQrSvgData(qrPayload, 2), [qrPayload]);

  /** "Save as PDF": print the clinical summary with its offline vector QR handoff in the active language. */
  function handlePrint() {
    const printLang = showRomanian ? "ro" : activeLang;
    const copy = showRomanian ? COPY.ro : t;
    const date = showRomanian ? formatDate(new Date(), "ro") : currentDate;
    const printDict = getHealthCheckTranslations(printLang);
    printSummary({
      lang: printLang,
      meta: `${copy.screenFor} · ${date}`,
      title: copy.patientSummary,
      rows: screenRows,
      notes: screenNotes,
      status: redFlagNoticed ? copy.redFlag : copy.noRedFlag,
      urgent: redFlagNoticed,
      qr: {
        size: qrSvg.size,
        path: qrSvg.path,
        title: copy.qrTitle,
        hint: copy.qrHint,
      },
      footer: printDict.ui.disclaimer,
      fileName: `${copy.patientSummary} - ${new Date().toISOString().slice(0, 10)}`,
    });
  }

  const secondaryBtn =
    "inline-flex min-h-11 flex-1 min-w-[7.5rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300/90 bg-white px-3.5 text-sm font-semibold text-foreground shadow-2xs transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:border-sapphire/45 hover:bg-[#f6f8fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire";

  return (
    <section className={`select-text ${bare ? "pt-2.5" : "border-t border-border pt-6"} ${className}`}>
      {bare ? (
        <p className="font-mono text-xs font-medium text-slate-500 tabular-nums">{currentDate}</p>
      ) : (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">{dict.ui.summaryHeading}</h3>
          <span className="font-mono text-xs text-slate-500 tabular-nums">{currentDate}</span>
        </div>
      )}

      <dl className="mt-2.5 select-text divide-y divide-slate-200/85 overflow-hidden rounded-lg border border-slate-200/95 bg-white">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(7rem,38%)_1fr] items-baseline gap-3 px-3.5 py-2.5 odd:bg-white even:bg-[#f7f8fa]"
          >
            <dt className="text-[13px] font-medium text-slate-500">{row.label}</dt>
            <dd className="text-[15px] font-semibold leading-snug text-obsidian-navy">{row.value}</dd>
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

      <div className="mt-3.5 flex flex-wrap gap-2">
        {!isControlled && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-11 flex-1 min-w-[9rem] items-center justify-center whitespace-nowrap rounded-lg bg-obsidian-navy px-4 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
          >
            {dict.ui.showDoctor}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className={
            copyState === "copied"
              ? "inline-flex min-h-11 flex-1 min-w-[7.5rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-obsidian-navy bg-obsidian-navy px-3.5 text-sm font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
              : secondaryBtn
          }
        >
          {copyState === "copied" ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : <CopyIcon className="h-4 w-4 shrink-0" />}
          <span>{copyState === "copied" ? t.copied : t.copy}</span>
        </button>
        <button type="button" onClick={handlePrint} className={secondaryBtn}>
          {t.savePdf}
        </button>
        <button type="button" onClick={handleWhatsApp} className={secondaryBtn}>
          {t.whatsapp}
        </button>
      </div>
      {copyState === "failed" && (
        <p role="status" className="mt-2 text-sm font-medium text-primary">
          {t.copyFailed}
        </p>
      )}

      {open && typeof document !== "undefined" && createPortal(
        <div className="hc-backdrop fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 print:static print:bg-white print:p-0 sm:items-center sm:p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.patientSummary}
            className="hc-sheet relative flex w-full max-w-xl flex-col overflow-hidden bg-card print:max-h-none print:overflow-visible print:shadow-none sm:max-h-[90vh] sm:rounded-xl sm:shadow-xl"
          >
            <div aria-hidden="true" className={`h-[3px] w-full shrink-0 ${redFlagNoticed ? "bg-primary" : "bg-sapphire"}`} />

            {activeLang !== "ro" && romanian && (
              <div className="shrink-0 border-b border-border bg-card px-5 py-3 print:hidden sm:px-6">
                <div
                  role="group"
                  aria-label={t.screenFor}
                  className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
                >
                  <button
                    type="button"
                    aria-pressed={!showRomanian}
                    onClick={() => setShowRomanian(false)}
                    className={`min-h-11 rounded-md px-3 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                      !showRomanian
                        ? "bg-card text-sapphire shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.myLanguageTab}
                  </button>
                  <button
                    type="button"
                    aria-pressed={showRomanian}
                    onClick={() => setShowRomanian(true)}
                    className={`min-h-11 rounded-md px-3 text-sm font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire ${
                      showRomanian
                        ? "bg-card text-sapphire shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.romanianTab}
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 print:overflow-visible print:p-0 sm:p-6">
              <div lang={showRomanian ? "ro" : activeLang} className="select-text rounded-xl border border-sapphire-border/75 bg-[#f4f7fb] p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sapphire-border/60 pb-3">
                  <h3 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {showRomanian ? COPY.ro.patientSummary : t.patientSummary}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground tabular-nums sm:text-sm">
                    {showRomanian ? COPY.ro.screenFor : t.screenFor} ·{" "}
                    {showRomanian ? formatDate(new Date(), "ro") : currentDate}
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-1 gap-2.5 tabular-nums sm:grid-cols-2">
                  {(() => {
                    let col = 0;
                    return screenRows.map((row, idx) => {
                      const ownWide = row.value.length > 36;
                      const nextWide = (screenRows[idx + 1]?.value.length ?? 0) > 36;
                      const isLast = idx === screenRows.length - 1;
                      const spanFull = ownWide || (col === 0 && (nextWide || isLast));
                      col = spanFull ? 0 : col === 0 ? 1 : 0;
                      return (
                        <div
                          key={row.label}
                          className={`rounded-lg border border-sapphire-border/65 bg-white p-3.5 ${
                            spanFull ? "sm:col-span-2" : ""
                          }`}
                        >
                          <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                          <dd className="mt-1 text-base font-semibold leading-snug text-foreground sm:text-lg">
                            {row.value}
                          </dd>
                        </div>
                      );
                    });
                  })()}
                </dl>

                {screenNotes.length > 0 && (
                  <div className="mt-3.5 space-y-2 rounded-lg border border-sapphire-border/65 bg-white p-3.5">
                    {screenNotes.map((note, i) => (
                      <p key={i} className="text-sm leading-relaxed text-foreground sm:text-base">
                        {note}
                      </p>
                    ))}
                  </div>
                )}

                <p
                  className={`mt-3.5 rounded-lg border px-3.5 py-2.5 text-sm font-semibold sm:text-base ${
                    redFlagNoticed
                      ? "border-primary/30 bg-primary-soft text-primary"
                      : "border-sapphire-border/65 bg-white text-muted-foreground"
                  }`}
                >
                  {showRomanian ? (redFlagNoticed ? COPY.ro.redFlag : COPY.ro.noRedFlag) : warningNotice}
                </p>

                <div className="mt-3.5 flex flex-col items-center gap-3.5 rounded-lg border border-sapphire-border/65 bg-white p-4 sm:flex-row sm:items-center">
                  <div className="shrink-0 rounded-md border border-border bg-white p-2">
                    <svg
                      viewBox={`0 0 ${qrSvg.size} ${qrSvg.size}`}
                      shapeRendering="crispEdges"
                      role="img"
                      aria-label={activeDialogCopy.qrTitle}
                      className="h-28 w-28 text-obsidian-navy"
                    >
                      <rect width={qrSvg.size} height={qrSvg.size} fill="#ffffff" />
                      <path d={qrSvg.path} fill="#0b132b" />
                    </svg>
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-sm font-semibold text-foreground">{activeDialogCopy.qrTitle}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{activeDialogCopy.qrHint}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid shrink-0 gap-2 border-t border-border bg-card px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] print:hidden sm:grid-cols-3 sm:px-6">
              <button
                type="button"
                onClick={handleCopy}
                className={
                  copyState === "copied"
                    ? "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-sapphire bg-sapphire-soft px-3.5 text-sm font-semibold text-sapphire transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire"
                    : secondaryBtn
                }
              >
                {copyState === "copied" ? <CheckCircleIcon className="h-4 w-4 shrink-0" /> : <CopyIcon className="h-4 w-4 shrink-0" />}
                <span>{copyState === "copied" ? t.copied : t.copy}</span>
              </button>
              <button type="button" onClick={handlePrint} className={secondaryBtn}>
                {t.savePdf}
              </button>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className={secondaryBtn}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}

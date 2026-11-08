"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircleIcon, CopyIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
import { getHealthCheckTranslations } from "@/lib/i18n/health-check-translations";
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

const LOCALE_DATE_MAP: Record<Lang, string> = { ro: "ro-RO", en: "en-GB", sq: "sq-AL", it: "it-IT" };

const ALBANIAN_MONTHS = [
  "janar", "shkurt", "mars", "prill", "maj", "qershor",
  "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor",
];

/** Long date in the page language; some browsers ship without Albanian date data. */
function formatDate(date: Date, lang: Lang): string {
  const locale = LOCALE_DATE_MAP[lang] || "ro-RO";
  if (lang === "sq" && Intl.DateTimeFormat.supportedLocalesOf([locale]).length === 0) {
    return `${date.getDate()} ${ALBANIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
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
    savePdf: "Salva come PDF",
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
    setTimeout(() => setCopyState("idle"), 3000);
  }

  function handleWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(formattedSummary)}`, "_blank", "noopener,noreferrer");
  }

  const ownScreenRows = doctorSymptom
    ? rows.map((r) => (r.label === dict.ui.symptomLabel ? { ...r, value: doctorSymptom } : r))
    : rows;
  const screenRows = showRomanian && romanian ? romanian.rows : ownScreenRows;

  /** "Save as PDF": print exactly what the doctor screen shows, in its current language. */
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
      footer: printDict.ui.disclaimer,
      fileName: `${copy.patientSummary} - ${new Date().toISOString().slice(0, 10)}`,
    });
  }
  const screenNotes = showRomanian && romanian ? romanian.notes : doctorNotes;
  const secondaryBtn =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-base font-medium text-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-muted";

  return (
    <section className={`${bare ? "pt-2" : "border-t border-border pt-6"} ${className}`}>
      {bare ? (
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      ) : (
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">{dict.ui.summaryHeading}</h3>
          <span className="text-sm text-muted-foreground">{currentDate}</span>
        </div>
      )}

      <dl className="mt-3 divide-y divide-border border-y border-border">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(6.5rem,35%)_1fr] gap-3 py-2.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-base font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      {clinicalMechanism && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{clinicalMechanism}</p>
      )}

      {selfCareTips.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-foreground">{dict.ui.safeSelfCareHeading}</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-base text-foreground/85 marker:text-muted-foreground">
            {selfCareTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`mt-4 grid gap-2 ${isControlled ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {!isControlled && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-lg bg-foreground px-4 text-base font-semibold text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-ink-800 sm:col-span-1"
          >
            {dict.ui.showDoctor}
          </button>
        )}
        <button type="button" onClick={handleCopy} className={secondaryBtn}>
          {copyState === "copied" ? <CheckCircleIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          {copyState === "copied" ? t.copied : t.copy}
        </button>
        <button type="button" onClick={handleWhatsApp} className={secondaryBtn}>
          {t.whatsapp}
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm font-medium text-foreground">
        {copyState === "failed" ? t.copyFailed : ""}
      </p>

      {open && typeof document !== "undefined" && createPortal(
        <div className="hc-backdrop fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 sm:items-center sm:p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.patientSummary}
            className="hc-sheet relative flex w-full max-w-xl flex-col overflow-y-auto bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-h-[90vh] sm:rounded-xl sm:p-8"
          >
            <div lang={showRomanian ? "ro" : activeLang}>
            <h3 className="text-2xl font-semibold text-foreground">
              {showRomanian ? COPY.ro.patientSummary : t.patientSummary}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {showRomanian ? COPY.ro.screenFor : t.screenFor} ·{" "}
              {showRomanian ? formatDate(new Date(), "ro") : currentDate}
            </p>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {screenRows.map((row) => (
                <div key={row.label} className="py-3">
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className="mt-0.5 text-xl font-semibold leading-snug text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
            {screenNotes.length > 0 && (
              <div className="mt-4 space-y-2">
                {screenNotes.map((note, i) => (
                  <p key={i} className="text-base leading-relaxed text-foreground">
                    {note}
                  </p>
                ))}
              </div>
            )}
            <p className={`mt-4 text-base font-semibold ${redFlagNoticed ? "text-primary" : "text-muted-foreground"}`}>
              {showRomanian ? (redFlagNoticed ? COPY.ro.redFlag : COPY.ro.noRedFlag) : warningNotice}
            </p>
            </div>
            <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2 print:hidden">
              <button type="button" onClick={handlePrint} className={`${secondaryBtn} sm:col-span-2`}>
                {t.savePdf}
              </button>
              {romanian && (
                <button type="button" onClick={() => setShowRomanian((v) => !v)} className={secondaryBtn}>
                  {showRomanian ? t.inOwnLanguage : t.inRomanian}
                </button>
              )}
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className={`${secondaryBtn} ${romanian ? "" : "sm:col-span-2"}`}
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

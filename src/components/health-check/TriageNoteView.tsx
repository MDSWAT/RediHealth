"use client";

import { readPublicOrigin, SERVER_PUBLIC_ORIGIN } from "@/components/health-check/public-origin";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import {
  dangerPanel,
  emergencyButton,
  primaryButton,
  softPanel,
  stepHeading,
  stepLead,
} from "@/components/health-assistant/step-ui";
import { getChromeCopy } from "@/components/layout/chrome-copy";
import { Container } from "@/components/ui/Container";
import { AlertCircleIcon, ArrowRightIcon, FileTextIcon, PhoneIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/Logo";
import {
  getHealthCheckTranslations,
  type SymptomChoice,
} from "@/lib/i18n/health-check-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { getLocalizedSubRegion } from "./anatomy-3d-data";
import { COPY } from "./health-check-copy";
import { getCareLevel, isAcuteSurgicalOrEmergency } from "./triage-clinical-rules";
import {
  buildFallbackTriageNoteUrl,
  buildTriageNoteUrl,
  buildTriageReproductionUrl,
  parseFallbackTriageNoteSearch,
  parseTriageNoteDate,
  parseTriageReproductionSearch,
  type TriagePermalinkState,
} from "./triage-permalink";
import {
  SUMMARY_COPY,
  TriageSummaryCard,
  type SummaryRow,
} from "./TriageSummaryCard";

export interface TriageNoteCopy {
  eyebrow: string;
  openFullCheck: string;
  emptyTitle: string;
  emptyBody: string;
  startCheck: string;
}

export const TRIAGE_NOTE_COPY: Record<Lang, TriageNoteCopy> = {
"ru": {"eyebrow":"Клиническая заметка","openFullCheck":"Открыть проверку симптомов","emptyTitle":"В этой ссылке нет заметки","emptyBody":"Ссылка неполная или не содержит описания симптомов. Вы можете начать новую проверку.","startCheck":"Проверить симптомы"},

  ro: {
    eyebrow: "Notă clinică",
    openFullCheck: "Deschide evaluarea interactivă",
    emptyTitle: "Nicio notă găsită în acest link",
    emptyBody:
      "Linkul scanat este incomplet sau nu conține date de evaluare. Poți începe o verificare rapidă a simptomelor oricând.",
    startCheck: "Verifică simptomele",
  },
  en: {
    eyebrow: "Clinical note",
    openFullCheck: "Open interactive symptom check",
    emptyTitle: "No clinical note found in this link",
    emptyBody:
      "The scanned link is incomplete or contains no symptom summary. You can start a quick symptom check at any time.",
    startCheck: "Check symptoms",
  },
  sq: {
    eyebrow: "Shënim klinik",
    openFullCheck: "Hap vlerësimin ndërveprues",
    emptyTitle: "Nuk u gjet shënim klinik në këtë lidhje",
    emptyBody:
      "Lidhja e skanuar është jo e plotë ose nuk përmban të dhëna. Mund të nisësh një kontroll të ri të simptomave.",
    startCheck: "Kontrollo simptomat",
  },
  it: {
    eyebrow: "Nota clinica",
    openFullCheck: "Apri la valutazione interattiva",
    emptyTitle: "Nessuna nota clinica trovata in questo link",
    emptyBody:
      "Il link scansionato è incompleto o non contiene dati sui sintomi. Puoi avviare un controllo rapido in qualsiasi momento.",
    startCheck: "Controlla i sintomi",
  },
  hr: {
    eyebrow: "Klinička bilješka",
    openFullCheck: "Otvori interaktivnu provjeru",
    emptyTitle: "U ovoj poveznici nije pronađena bilješka",
    emptyBody:
      "Skenirana poveznica nije potpuna ili ne sadrži sažetak simptoma. Uvijek možeš pokrenuti novu provjeru.",
    startCheck: "Provjeri simptome",
  },
  rom: {
    eyebrow: "Doktorikano lil",
    openFullCheck: "Putar sasti evaluacija",
    emptyTitle: "Chi arakhlo lil ande kadava linko",
    emptyBody:
      "O skanirime linko chi inkerel date vash le simptome. Shaj nachaves jekh nevi verifikacija akana.",
    startCheck: "Dikh che simptome",
  },
};

export interface TriageNoteViewProps {
  initialSearch?: string;
  lang?: Lang;
}

export function TriageNoteView({ initialSearch = "", lang: propLang }: TriageNoteViewProps = {}) {
  const searchParams = useSearchParams();
  const { lang: contextLang } = useLanguage();
  const activeLang: Lang = propLang || contextLang || "ro";

  const queryString = searchParams.toString();
  const searchStr = queryString ? `?${queryString}` : initialSearch;

  const originUrl = useSyncExternalStore(
    () => () => {},
    readPublicOrigin,
    () => SERVER_PUBLIC_ORIGIN,
  );

  const noteDate = useMemo(() => parseTriageNoteDate(searchStr), [searchStr]);
  const effectiveDate = useMemo(() => noteDate ?? new Date(), [noteDate]);
  const noteDateIso = useMemo(() => {
    const y = effectiveDate.getFullYear();
    const m = String(effectiveDate.getMonth() + 1).padStart(2, "0");
    const d = String(effectiveDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [effectiveDate]);

  const parsed = useMemo(
    () => parseTriageReproductionSearch(searchStr, activeLang),
    [activeLang, searchStr],
  );
  const fallback = useMemo(
    () => (parsed ? null : parseFallbackTriageNoteSearch(searchStr)),
    [parsed, searchStr],
  );

  const dict = getHealthCheckTranslations(activeLang);
  const c = COPY[activeLang] ?? COPY.ro;
  const tSummary = SUMMARY_COPY[activeLang] ?? SUMMARY_COPY.ro;
  const noteCopy = TRIAGE_NOTE_COPY[activeLang] ?? TRIAGE_NOTE_COPY.ro;
  const chrome = getChromeCopy(activeLang);

  const structuredProps = useMemo(() => {
    if (!parsed) return null;

    const regionSymptoms = dict.symptoms[parsed.part] ?? [];
    const selectedSymptom = regionSymptoms.find((s) => s.id === parsed.symptomId) ?? null;
    const extraSymptoms = parsed.extraSymptomIds
      .map((id) => regionSymptoms.find((s) => s.id === id) ?? null)
      .filter((s): s is SymptomChoice => Boolean(s));
    const allSymptoms = [selectedSymptom, ...extraSymptoms].filter(
      (s): s is SymptomChoice => Boolean(s),
    );

    const redFlagNoticed = allSymptoms.some((s) => isAcuteSurgicalOrEmergency(s));
    const urgentSymptom = allSymptoms.find((s) => isAcuteSurgicalOrEmergency(s)) ?? null;
    const careLevel =
      !redFlagNoticed && parsed.severity && parsed.duration
        ? getCareLevel(
            parsed.severity,
            parsed.duration,
            allSymptoms.map((s) => s.id),
            parsed.forWhom,
          )
        : null;

    const areaTitle = dict.bodyParts[parsed.part].title;
    const bodyArea = `${areaTitle}${parsed.forWhom === "child" ? ` — ${c.childRow}` : ""}`;
    const subData = parsed.subRegion ? getLocalizedSubRegion(parsed.subRegion, activeLang) : null;
    const anatomicalStructure = subData
      ? `${subData.label}${
          parsed.side === "Left"
            ? `, ${c.left}`
            : parsed.side === "Right"
              ? `, ${c.right}`
              : ""
        }`
      : undefined;

    const symptoms = allSymptoms.map((s) => s.title);
    const doctorSymptom = allSymptoms.map((s) => s.label || s.title).join("; ") || undefined;
    const painLevel = parsed.severity ? dict.severity[parsed.severity].title : undefined;
    const duration = parsed.duration ? dict.duration[parsed.duration].label : undefined;
    const recommendedSpecialty = subData?.recommendedSpecialty;
    const clinicalMechanism =
      !redFlagNoticed && selectedSymptom
        ? selectedSymptom.guidance || selectedSymptom.description
        : undefined;
    const selfCareTips =
      !redFlagNoticed && careLevel === "low" && selectedSymptom?.selfCareTip
        ? [selectedSymptom.selfCareTip]
        : [];

    const recommendationTitle = redFlagNoticed
      ? dict.ui.emergency.title
      : careLevel
        ? dict.urgency[careLevel].title
        : "";
    const recommendationDetail = recommendationTitle
      ? `${c.recommendationGiven}: ${recommendationTitle}`
      : undefined;
    const recommendationIntro =
      !redFlagNoticed && careLevel ? dict.urgency[careLevel].intro : undefined;

    const roDict = getHealthCheckTranslations("ro");
    const roRecommendationTitle = redFlagNoticed
      ? roDict.ui.emergency.title
      : careLevel
        ? roDict.urgency[careLevel].title
        : "";
    const romanianRecommendationDetail = roRecommendationTitle
      ? `${COPY.ro.recommendationGiven}: ${roRecommendationTitle}`
      : undefined;

    function buildNotes(
      d: ReturnType<typeof getHealthCheckTranslations>,
      recLabel: string,
      childLabel: string,
    ): string[] {
      const notes: string[] = [];
      const partSymptoms = d.symptoms[parsed!.part] ?? [];
      const localizedUrgent = urgentSymptom
        ? partSymptoms.find((x) => x.id === urgentSymptom.id) ?? null
        : null;
      if (redFlagNoticed) {
        notes.push(`${recLabel}: ${d.ui.emergency.title}`);
        if (localizedUrgent) {
          notes.push(`${d.ui.urgentBadge}: ${localizedUrgent.label || localizedUrgent.title}.`);
        }
      } else if (careLevel) {
        notes.push(`${recLabel}: ${d.urgency[careLevel].title}`);
      }
      if (parsed!.forWhom === "child") {
        notes.push(childLabel);
      }
      return notes;
    }

    const doctorNotes = buildNotes(dict, c.recommendationGiven, c.childRow);

    const romanian: { rows: SummaryRow[]; notes: string[] } | undefined =
      activeLang === "ro"
        ? undefined
        : (() => {
            const roPartSymptoms = roDict.symptoms[parsed.part] ?? [];
            const roAllSymptoms = [parsed.symptomId, ...parsed.extraSymptomIds]
              .map((id) => roPartSymptoms.find((x) => x.id === id) ?? null)
              .filter((s): s is SymptomChoice => Boolean(s));
            const roSubData = parsed.subRegion
              ? getLocalizedSubRegion(parsed.subRegion, "ro")
              : null;
            const roRows: SummaryRow[] = [
              ...(parsed.forWhom === "child" ? [{ label: "Pentru", value: COPY.ro.childRow }] : []),
              { label: roDict.ui.areaLabel, value: roDict.bodyParts[parsed.part].title },
              ...(roSubData
                ? [
                    {
                      label: SUMMARY_COPY.ro.structure,
                      value: `${roSubData.label}${
                        parsed.side === "Left"
                          ? `, ${COPY.ro.left}`
                          : parsed.side === "Right"
                            ? `, ${COPY.ro.right}`
                            : ""
                      }`,
                    },
                  ]
                : []),
              {
                label: roDict.ui.symptomLabel,
                value: roAllSymptoms.map((s) => s.label || s.title).join("; "),
              },
              ...(parsed.severity
                ? [{ label: roDict.ui.intensityLabel, value: roDict.severity[parsed.severity].title }]
                : []),
              ...(parsed.duration
                ? [{ label: roDict.ui.durationLabel, value: roDict.duration[parsed.duration].label }]
                : []),
              ...(roSubData?.recommendedSpecialty
                ? [{ label: SUMMARY_COPY.ro.specialty, value: roSubData.recommendedSpecialty }]
                : []),
            ];
            return {
              rows: roRows,
              notes: buildNotes(roDict, COPY.ro.recommendationGiven, COPY.ro.childRow),
            };
          })();

    const permalinkState: TriagePermalinkState = {
      part: parsed.part,
      subRegion: parsed.subRegion,
      side: parsed.side,
      symptomId: parsed.symptomId,
      extraSymptomIds: parsed.extraSymptomIds,
      severity: parsed.severity,
      duration: parsed.duration,
      forWhom: parsed.forWhom,
      bodyProfile: parsed.bodyProfile,
    };

    const reproduceUrl = buildTriageReproductionUrl(originUrl, activeLang, permalinkState);
    const romanianReproduceUrl = buildTriageReproductionUrl(originUrl, "ro", permalinkState);
    const noteUrl = buildTriageNoteUrl(originUrl, activeLang, permalinkState, noteDateIso);
    const romanianNoteUrl = buildTriageNoteUrl(originUrl, "ro", permalinkState, noteDateIso);
    const reproducePath = reproduceUrl.replace(/^https?:\/\/[^/]+/, "");

    return {
      bodyArea,
      anatomicalStructure,
      painLocation: {
        part: parsed.part,
        subRegion: parsed.subRegion,
        side: parsed.side,
      },
      symptoms,
      selfCareTips,
      redFlagNoticed,
      urgentReason: redFlagNoticed && urgentSymptom ? urgentSymptom.title : undefined,
      painLevel,
      duration,
      recommendedSpecialty,
      clinicalMechanism,
      recommendationTitle,
      recommendationDetail,
      recommendationIntro,
      romanianRecommendationDetail,
      reproduceUrl,
      romanianReproduceUrl,
      noteUrl,
      romanianNoteUrl,
      reproducePath,
      doctorNotes,
      doctorSymptom,
      romanian,
      isChild: parsed.forWhom === "child",
    };
  }, [activeLang, c, dict, noteDateIso, originUrl, parsed]);

  const fallbackNoteUrl = useMemo(() => {
    if (!fallback) return undefined;
    return buildFallbackTriageNoteUrl(originUrl, activeLang, {
      ...fallback,
      dateIso: fallback.dateIso ?? noteDateIso,
    });
  }, [activeLang, fallback, noteDateIso, originUrl]);

  return (
    <main id="main-content" className="flex-1 pt-2 pb-12 sm:pt-4 sm:pb-16">
      <Container>
        <div className="mx-auto mb-4 flex max-w-2xl flex-wrap items-center justify-between gap-3 px-0.5 print:hidden">
          <Logo href={withLangPrefix("/", activeLang)} label={chrome.homeLink} />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileTextIcon className="h-4 w-4 shrink-0 text-sapphire" />
            <span>{noteCopy.eyebrow}</span>
          </span>
        </div>

        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-8">
          {structuredProps ? (
            <>
              <header className="border-b border-border pb-4">
                <p className="text-xs font-semibold text-sapphire sm:text-sm">
                  {tSummary.screenFor}
                </p>
                <h1 className={`mt-1 ${stepHeading}`}>{tSummary.patientSummary}</h1>
              </header>

              {structuredProps.redFlagNoticed ? (
                <div role="alert" className={`mt-4 ${dangerPanel}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold leading-snug text-primary">
                        {structuredProps.recommendationTitle || dict.ui.emergency.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground sm:text-base">
                        {dict.ui.emergency.description}
                      </p>
                      {structuredProps.urgentReason && (
                        <p className="mt-1.5 text-sm font-medium text-foreground">
                          {dict.ui.emergency.whyEmergencyPrefix} {structuredProps.urgentReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className={`mt-4 w-full print:hidden sm:w-auto ${emergencyButton}`}
                  >
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    <span>{dict.ui.emergency.call112Now}</span>
                  </a>
                </div>
              ) : (
                structuredProps.recommendationDetail && (
                  <div className={`mt-4 ${softPanel}`}>
                    <p className="text-base font-semibold leading-snug text-foreground">
                      {structuredProps.recommendationDetail}
                    </p>
                    {structuredProps.recommendationIntro && (
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {structuredProps.recommendationIntro}
                      </p>
                    )}
                  </div>
                )
              )}

              {structuredProps.isChild && (
                <p className="mt-3.5 rounded-xl border border-amber-care-border bg-amber-care-soft/60 px-4 py-3 text-sm font-medium leading-relaxed text-foreground">
                  {c.childNote}
                </p>
              )}

              <TriageSummaryCard
                bare
                className="mt-2"
                date={noteDate ?? undefined}
                bodyArea={structuredProps.bodyArea}
                anatomicalStructure={structuredProps.anatomicalStructure}
                painLocation={structuredProps.painLocation}
                symptoms={structuredProps.symptoms}
                selfCareTips={structuredProps.selfCareTips}
                redFlagNoticed={structuredProps.redFlagNoticed}
                painLevel={structuredProps.painLevel}
                duration={structuredProps.duration}
                recommendedSpecialty={structuredProps.recommendedSpecialty}
                clinicalMechanism={structuredProps.clinicalMechanism}
                recommendationDetail={structuredProps.recommendationDetail}
                romanianRecommendationDetail={structuredProps.romanianRecommendationDetail}
                reproduceUrl={structuredProps.reproduceUrl}
                romanianReproduceUrl={structuredProps.romanianReproduceUrl}
                noteUrl={structuredProps.noteUrl}
                romanianNoteUrl={structuredProps.romanianNoteUrl}
                doctorNotes={structuredProps.doctorNotes}
                doctorSymptom={structuredProps.doctorSymptom}
                romanian={structuredProps.romanian}
                lang={activeLang}
              />

              <div className="mt-6 border-t border-border pt-5 print:hidden">
                <Link
                  href={structuredProps.reproducePath}
                  className={`${primaryButton} w-full sm:w-auto`}
                >
                  <span>{noteCopy.openFullCheck}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {dict.ui.disclaimer}
              </p>
            </>
          ) : fallback ? (
            <>
              <header className="border-b border-border pb-4">
                <p className="text-xs font-semibold text-sapphire sm:text-sm">
                  {tSummary.screenFor}
                </p>
                <h1 className={`mt-1 ${stepHeading}`}>{tSummary.patientSummary}</h1>
              </header>

              {fallback.redFlagNoticed ? (
                <div role="alert" className={`mt-4 ${dangerPanel}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold leading-snug text-primary">
                        {dict.ui.emergency.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground sm:text-base">
                        {dict.ui.emergency.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:112"
                    className={`mt-4 w-full print:hidden sm:w-auto ${emergencyButton}`}
                  >
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    <span>{dict.ui.emergency.call112Now}</span>
                  </a>
                </div>
              ) : (
                fallback.recommendationDetail && (
                  <div className={`mt-4 ${softPanel}`}>
                    <p className="text-base font-semibold leading-snug text-foreground">
                      {fallback.recommendationDetail}
                    </p>
                  </div>
                )
              )}

              <TriageSummaryCard
                bare
                className="mt-2"
                date={noteDate ?? undefined}
                bodyArea={fallback.bodyArea}
                anatomicalStructure={fallback.anatomicalStructure}
                symptoms={fallback.symptoms}
                painLevel={fallback.painLevel}
                duration={fallback.duration}
                redFlagNoticed={fallback.redFlagNoticed}
                recommendationDetail={fallback.recommendationDetail}
                noteUrl={fallbackNoteUrl}
                doctorNotes={fallback.recommendationDetail ? [fallback.recommendationDetail] : []}
                lang={activeLang}
              />

              <div className="mt-6 border-t border-border pt-5 print:hidden">
                <Link
                  href={withLangPrefix("/health-check", activeLang)}
                  className={`${primaryButton} w-full sm:w-auto`}
                >
                  <span>{noteCopy.startCheck}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {dict.ui.disclaimer}
              </p>
            </>
          ) : (
            <div>
              <h1 className={stepHeading}>{noteCopy.emptyTitle}</h1>
              <p className={stepLead}>{noteCopy.emptyBody}</p>
              <div className="mt-6">
                <Link
                  href={withLangPrefix("/health-check", activeLang)}
                  className={`${primaryButton} w-full sm:w-auto`}
                >
                  <span>{noteCopy.startCheck}</span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}

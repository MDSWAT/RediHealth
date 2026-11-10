/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { PrinterIcon } from "@/components/ui/icons";
import { TreatmentPlansView } from "./TreatmentPlansView";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupTime, formatDateKey, formatPanelDate } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import { printReportTranslations } from "@/lib/i18n/print-report-translations";
import { encodeQrSvg } from "./print-qr-svg";
import type {
  FollowupItem,
  PatientItem,
  PatientPhoto,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";

interface PatientPrintReportProps {
  patient: PatientItem;
  status: PatientStatus;
  treatmentPlan: TreatmentPlan;
  followups: FollowupItem[];
  photos: PatientPhoto[];
  onClose: () => void;
}

export function PatientPrintReport({
  patient,
  status,
  treatmentPlan,
  followups,
  photos,
  onClose,
}: PatientPrintReportProps) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const t = printReportTranslations[lang];
  const [compactHandout, setCompactHandout] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin || "https://redihealth.org",
    () => "https://redihealth.org",
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const canonicalRecordUrl = useMemo(
    () => `${origin}${withLangPrefix(`/panel/patients/${encodeURIComponent(patient.id)}`, lang)}`,
    [origin, patient.id, lang],
  );

  const qr = useMemo(() => encodeQrSvg(canonicalRecordUrl, 2), [canonicalRecordUrl]);

  const statusLabel =
    status === "active" ? t.active : status === "inactive" ? t.inactive : t.archived;

  const statusBadgeClass =
    status === "active"
      ? "border-slate-300 bg-slate-100 text-slate-900"
      : status === "inactive"
        ? "border-slate-200 bg-white text-slate-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 print:static print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm sm:p-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <PrinterIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold text-foreground">{t.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-pressed={compactHandout}
            onClick={() => setCompactHandout((prev) => !prev)}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              compactHandout
                ? "border-sapphire bg-sapphire-soft text-sapphire"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                compactHandout ? "bg-sapphire" : "bg-muted-foreground/40"
              }`}
              aria-hidden="true"
            />
            <span>{t.compactHandout}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{t.backToProfile}</span>
            <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
              Esc
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PrinterIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.printSave}</span>
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl rounded-xl border border-border bg-white p-6 text-slate-900 shadow-lg sm:p-10 print:border-none print:p-0 print:shadow-none">
        <header className="print-block flex flex-wrap items-start justify-between gap-4 border-b-2 border-primary pb-5">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-primary">{t.clinicName}</h1>
              <span className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                {compactHandout ? t.handoutBadge : t.confidential}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {compactHandout ? t.handoutSubtitle : t.subtitle}
            </p>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="text-right text-xs text-slate-600">
              <p className="tabular-nums font-semibold text-slate-900">
                {t.recordId}: #{patient.id}
              </p>
              <p className="mt-0.5 tabular-nums">
                {t.reportDate}: {formatPanelDate(new Date(), langToLocale[lang], "full")}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{t.qrSealHint}</p>
            </div>

            <div className="shrink-0 rounded-md border border-slate-300 bg-white p-1">
              <svg
                viewBox={`0 0 ${qr.viewBoxSize} ${qr.viewBoxSize}`}
                shapeRendering="crispEdges"
                role="img"
                aria-label={t.qrSealLabel}
                className="block h-16 w-16 text-slate-950"
              >
                <rect width={qr.viewBoxSize} height={qr.viewBoxSize} fill="#ffffff" />
                <path d={qr.pathD} fill="currentColor" />
              </svg>
            </div>
          </div>
        </header>

        <section className="print-block mt-6">
          <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
            {t.s1}
          </h2>
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:grid-cols-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-500">{t.fullName}</p>
              <p className="mt-0.5 text-sm font-bold text-slate-900 [overflow-wrap:anywhere]">
                {patient.full_name}
              </p>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-500">{t.phone}</p>
              <p className="mt-0.5 tabular-nums font-medium text-slate-800 [overflow-wrap:anywhere]">
                {patient.phone || t.notSpecified}
              </p>
            </div>
            {!compactHandout ? (
              <div className="min-w-0">
                <p className="font-semibold text-slate-500">{t.email}</p>
                <p className="mt-0.5 font-medium text-slate-800 [overflow-wrap:anywhere]">
                  {patient.email || t.notSpecified}
                </p>
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="font-semibold text-slate-500">{t.dob}</p>
              <p className="mt-0.5 tabular-nums font-medium text-slate-800">
                {patient.date_of_birth || t.notSpecified}
              </p>
            </div>
            {!compactHandout ? (
              <div className="min-w-0">
                <p className="font-semibold text-slate-500">{t.gender}</p>
                <p className="mt-0.5 font-medium text-slate-800">
                  {patient.gender || t.notSpecified}
                </p>
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="font-semibold text-slate-500">{t.careStatus}</p>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass}`}
                >
                  {statusLabel}
                </span>
              </p>
            </div>
            {!compactHandout ? (
              <div className="col-span-2 min-w-0 sm:col-span-3">
                <p className="font-semibold text-slate-500">{t.address}</p>
                <p className="mt-0.5 font-medium text-slate-800 [overflow-wrap:anywhere]">
                  {patient.address || t.notSpecified}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
            {t.s2}
          </h2>
          <div className="[overflow-wrap:anywhere]">
            <TreatmentPlansView plan={treatmentPlan} />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
            {t.s3}
          </h2>
          {followups.length === 0 ? (
            <p className="text-xs italic text-slate-500">{t.noFollowups}</p>
          ) : (
            <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left text-xs">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700">
                <tr>
                  <th className="border-b border-slate-200 p-2">{t.scheduledDate}</th>
                  <th className="border-b border-slate-200 p-2">{t.goal}</th>
                  <th className="border-b border-slate-200 p-2">{t.status}</th>
                  <th className="border-b border-slate-200 p-2">{t.notes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followups.map((item) => (
                  <tr key={item.id} className="print-block">
                    <td className="whitespace-nowrap p-2 tabular-nums font-medium text-slate-800">
                      {formatDateKey(item.date, langToLocale[lang])}
                      {item.time ? ` ${followupTime(item, "", viewerZone)}` : ""}
                    </td>
                    <td className="p-2 font-semibold text-slate-900 [overflow-wrap:anywhere]">
                      {item.title}
                    </td>
                    <td className="p-2">
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {t[item.status]}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 [overflow-wrap:anywhere]">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {!compactHandout ? (
          <section className="mt-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
              {t.s4}
            </h2>
            <div className="space-y-3 text-xs">
              <div className="print-block">
                <p className="mb-1 font-bold text-slate-800">{t.symptoms}</p>
                <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 [overflow-wrap:anywhere]">
                  {patient.condition_notes || t.noneRecorded}
                </div>
              </div>
              <div className="print-block">
                <p className="mb-1 font-bold text-slate-800">{t.history}</p>
                <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 [overflow-wrap:anywhere]">
                  {patient.medical_history || t.noneRecorded}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {!compactHandout && photos.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold text-slate-800">
              {t.s5} (<span className="tabular-nums">{photos.length}</span>)
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="print-block rounded-lg border border-slate-200 bg-slate-50 p-2"
                >
                  <img
                    src={photo.data_url}
                    alt={photo.name}
                    className="mb-1.5 h-28 w-full rounded border border-slate-200 object-cover"
                  />
                  <p className="truncate text-[11px] font-bold text-slate-800">{photo.name}</p>
                  <p className="tabular-nums text-[10px] text-slate-500">{photo.date}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="print-block mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-slate-300 pt-6 text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700">{t.signature}</p>
            <div className="mt-6 w-48 border-b border-slate-400" />
            <p className="mt-1 text-[10px]">{t.authorizedWorker}</p>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <p className="font-mono text-[10px] text-slate-600 [overflow-wrap:anywhere]">
              {canonicalRecordUrl}
            </p>
            <p className="mt-0.5">{t.generatedBy}</p>
            <p>{compactHandout ? t.handoutBadge : t.strictlyConfidential}</p>
          </div>
        </footer>
      </article>
    </div>
  );
}

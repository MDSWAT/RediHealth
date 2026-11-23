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

  const formatDay = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);
    return Number.isNaN(date.getTime()) ? iso : formatPanelDate(date, langToLocale[lang], "date");
  };

  return (
    <div className="min-h-screen bg-[var(--panel-canvas)] p-4 sm:p-6 print:static print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--panel-line)] bg-[var(--panel-surface)] p-4 text-[var(--panel-ink)] print:hidden">
        <span className="text-sm font-semibold text-[var(--panel-ink)]">{t.title}</span>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-pressed={compactHandout}
            onClick={() => setCompactHandout((prev) => !prev)}
            className={`crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] ${
              compactHandout
                ? "border-[var(--color-sapphire)] bg-[var(--panel-selection)] text-[var(--color-sapphire)] dark:border-[#bad7fa] dark:text-[#bad7fa]"
                : ""
            }`}
          >
            {t.compactHandout}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-keyshortcuts="Escape"
            className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
          >
            {t.backToProfile}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="crm-button crm-primary whitespace-nowrap"
          >
            <PrinterIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.printSave}</span>
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-4xl rounded-2xl border border-[var(--panel-line)] bg-white p-6 text-slate-900 sm:p-10 print:rounded-none print:border-none print:p-0">
        <header className="print-block flex flex-wrap items-start justify-between gap-4 border-b-2 border-[var(--color-sapphire)] pb-5">
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-sapphire)]">{t.clinicName}</h1>
            <p className="text-xs font-semibold text-slate-800">
              {compactHandout ? t.handoutBadge : t.confidential}
            </p>
            <p className="text-xs text-slate-600">
              {compactHandout ? t.handoutSubtitle : t.subtitle}
            </p>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="text-right text-xs text-slate-600">
              <p className="tabular-nums [font-feature-settings:'zero'_0] font-semibold text-slate-900">
                {t.recordId}: #{patient.id}
              </p>
              <p className="mt-0.5 tabular-nums [font-feature-settings:'zero'_0]">
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
          <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-sm font-bold text-slate-800">
            {t.s1}
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-slate-200 pb-4 text-xs sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="font-semibold text-slate-500">{t.fullName}</dt>
              <dd className="mt-0.5 text-sm font-bold text-slate-900 [overflow-wrap:anywhere]">
                {patient.full_name}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="font-semibold text-slate-500">{t.phone}</dt>
              <dd className="mt-0.5 tabular-nums [font-feature-settings:'zero'_0] font-medium text-slate-800 [overflow-wrap:anywhere]">
                {patient.phone || t.notSpecified}
              </dd>
            </div>
            {!compactHandout ? (
              <div className="min-w-0">
                <dt className="font-semibold text-slate-500">{t.email}</dt>
                <dd className="mt-0.5 font-medium text-slate-800 [overflow-wrap:anywhere]">
                  {patient.email || t.notSpecified}
                </dd>
              </div>
            ) : null}
            <div className="min-w-0">
              <dt className="font-semibold text-slate-500">{t.dob}</dt>
              <dd className="mt-0.5 tabular-nums [font-feature-settings:'zero'_0] font-medium text-slate-800">
                {patient.date_of_birth ? formatDay(patient.date_of_birth) : t.notSpecified}
              </dd>
            </div>
            {!compactHandout ? (
              <div className="min-w-0">
                <dt className="font-semibold text-slate-500">{t.gender}</dt>
                <dd className="mt-0.5 font-medium text-slate-800">
                  {patient.gender || t.notSpecified}
                </dd>
              </div>
            ) : null}
            <div className="min-w-0">
              <dt className="font-semibold text-slate-500">{t.careStatus}</dt>
              <dd className="mt-0.5 font-semibold text-slate-900">
                {statusLabel}
              </dd>
            </div>
            {!compactHandout ? (
              <div className="col-span-2 min-w-0 sm:col-span-3">
                <dt className="font-semibold text-slate-500">{t.address}</dt>
                <dd className="mt-0.5 font-medium text-slate-800 [overflow-wrap:anywhere]">
                  {patient.address || t.notSpecified}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-sm font-bold text-slate-800">
            {t.s2}
          </h2>
          <div className="[overflow-wrap:anywhere]">
            <TreatmentPlansView plan={treatmentPlan} />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-sm font-bold text-slate-800">
            {t.s3}
          </h2>
          {followups.length === 0 ? (
            <p className="text-xs text-slate-500">{t.noFollowups}</p>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-slate-300 text-xs font-semibold text-slate-700">
                <tr>
                  <th className="py-2 pr-3">{t.scheduledDate}</th>
                  <th className="py-2 pr-3">{t.goal}</th>
                  <th className="py-2 pr-3">{t.status}</th>
                  <th className="py-2">{t.notes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followups.map((item) => (
                  <tr key={item.id} className="print-block">
                    <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums [font-feature-settings:'zero'_0] font-medium text-slate-800">
                      {formatDateKey(item.date, langToLocale[lang])}
                      {item.time ? ` ${followupTime(item, "", viewerZone)}` : ""}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900 [overflow-wrap:anywhere]">
                      {item.title}
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-slate-700">
                      {t[item.status]}
                    </td>
                    <td className="py-2.5 text-slate-600 [overflow-wrap:anywhere]">
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
            <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-sm font-bold text-slate-800">
              {t.s4}
            </h2>
            <div className="divide-y divide-slate-200 text-xs">
              <div className="print-block py-3 first:pt-0">
                <p className="mb-1 font-semibold text-slate-800">{t.symptoms}</p>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                  {patient.condition_notes || t.noneRecorded}
                </p>
              </div>
              <div className="print-block py-3 last:pb-0">
                <p className="mb-1 font-semibold text-slate-800">{t.history}</p>
                <p className="whitespace-pre-wrap leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
                  {patient.medical_history || t.noneRecorded}
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {!compactHandout && photos.length > 0 ? (
          <section className="mt-6">
            <h2 className="mb-3 border-b border-slate-200 pb-1.5 text-sm font-bold text-slate-800">
              {t.s5} (<span className="tabular-nums [font-feature-settings:'zero'_0]">{photos.length}</span>)
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((photo) => (
                <figure
                  key={photo.id}
                  className="print-block border border-slate-200 bg-white p-2"
                >
                  <img
                    src={photo.data_url}
                    alt={photo.name}
                    className="mb-1.5 h-32 w-full bg-white object-contain"
                  />
                  <figcaption>
                    <p className="truncate text-[11px] font-semibold text-slate-800">{photo.name}</p>
                    {photo.date ? (
                      <p className="tabular-nums [font-feature-settings:'zero'_0] text-[10px] text-slate-500">
                        {formatDay(photo.date)}
                      </p>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="print-block mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-slate-300 pt-6 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">{t.signature}</p>
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

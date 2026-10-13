/* eslint-disable @next/next/no-img-element */
"use client";

import { PrinterIcon } from "@/components/ui/icons";
import { TreatmentPlansView } from "./TreatmentPlansView";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { printReportTranslations } from "@/lib/i18n/print-report-translations";
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
  const t = printReportTranslations[lang];
  const statusLabel = status === "active" ? t.active : status === "inactive" ? t.inactive : t.archived;

  return (
    <div className="min-h-screen bg-background p-6 print:p-0 print:static">
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <PrinterIcon className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground text-sm">
            {t.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            {t.backToProfile}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>{t.printSave}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-white p-8 sm:p-12 text-slate-900 shadow-lg print:border-none print:shadow-none print:p-0">
        <div className="flex items-start justify-between border-b-2 border-primary pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {t.clinicName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t.subtitle}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">{t.confidential}</p>
            <p className="mt-0.5">
              {t.reportDate}: {new Date().toLocaleDateString(langToLocale[lang], { dateStyle: "full" })}
            </p>
            <p>{t.recordId}: #{patient.id}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            {t.s1}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-500 font-semibold">{t.fullName}</p>
              <p className="font-bold text-slate-900 text-sm">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">{t.phone}</p>
              <p className="font-medium text-slate-800">{patient.phone}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">{t.email}</p>
              <p className="font-medium text-slate-800">{patient.email}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">{t.dob}</p>
                            <p className="font-medium text-slate-800">{patient.date_of_birth || t.notSpecified}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">{t.gender}</p>
                            <p className="font-medium text-slate-800">{patient.gender || t.notSpecified}</p>
            </div>
            <div>
                            <p className="text-slate-500 font-semibold">{t.careStatus}</p>
                            <p className="font-bold uppercase text-primary">{statusLabel}</p>
            </div>
            <div className="col-span-2 sm:col-span-3">
                            <p className="text-slate-500 font-semibold">{t.address}</p>
                            <p className="font-medium text-slate-800">{patient.address || t.notSpecified}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            {t.s2}
          </h2>
          <TreatmentPlansView plan={treatmentPlan} />
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            {t.s3}
          </h2>
          {followups.length === 0 ? (
            <p className="text-xs text-slate-500 italic">{t.noFollowups}</p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b">{t.scheduledDate}</th>
                  <th className="p-2 border-b">{t.goal}</th>
                  <th className="p-2 border-b">{t.status}</th>
                  <th className="p-2 border-b">{t.notes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followups.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-medium">{item.date}{item.time ? ` ${item.time} (${item.timezone || ""})` : ""}</td>
                    <td className="p-2 font-semibold">{item.title}</td>
                    <td className="p-2 capitalize font-bold text-slate-700">{t[item.status]}</td>
                    <td className="p-2 text-slate-600">{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            {t.s4}
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 mb-1">              {t.symptoms}</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                              {patient.condition_notes || t.noneRecorded}
              </div>
            </div>
            <div>
                            <p className="font-bold text-slate-800 mb-1">{t.history}</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                              {patient.medical_history || t.noneRecorded}
              </div>
            </div>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              {t.s5} ({photos.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <img
                    src={photo.data_url}
                    alt={photo.name}
                    className="h-28 w-full object-cover rounded border border-slate-200 mb-1.5"
                  />
                  <p className="font-bold text-[11px] text-slate-800 truncate">{photo.name}</p>
                  <p className="text-[10px] text-slate-500">{photo.date}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-slate-300 pt-6 flex items-end justify-between text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700">{t.signature}</p>
            <div className="mt-6 border-b border-slate-400 w-48" />
            <p className="mt-1 text-[10px]">{t.authorizedWorker}</p>
          </div>
          <div className="text-right text-[10px] text-slate-400">
            <p>{t.generatedBy}</p>
            <p>{t.strictlyConfidential}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

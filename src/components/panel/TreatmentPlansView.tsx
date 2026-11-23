"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { getTreatmentEntries, sortTreatments, treatmentStatus } from "@/lib/treatments";
import { formatDateKey, localDateKey } from "@/lib/panel-dates";
import type { TreatmentPlan } from "@/lib/types/patient";
import { PatientPhotoGallery } from "./PatientMedia";

export function TreatmentPlansView({
  plan,
  variant = "card",
}: {
  plan?: TreatmentPlan | null;
  variant?: "card" | "paper";
}) {
  const { lang } = useLanguage();
  const t = treatmentTranslations[lang];
  const entries = sortTreatments(getTreatmentEntries(plan));
  const isPaper = variant === "paper";
  if (!entries.length) {
    return (
      <p className={isPaper ? "text-xs text-slate-500" : "text-sm text-[var(--panel-muted,var(--color-muted-foreground))]"}>
        {t.empty}
      </p>
    );
  }
  return <div className={isPaper ? "divide-y divide-slate-200" : "space-y-4"}>
    {entries.map((entry) => <article
      key={entry.id}
      className={
        isPaper
          ? "print-block py-4 text-xs text-slate-900 first:pt-0 last:pb-0"
          : "print-block rounded-xl border border-[var(--panel-line,var(--color-border))] bg-[var(--panel-surface,var(--color-card))] p-4 text-sm text-[var(--panel-ink,var(--color-foreground))]"
      }
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className={isPaper ? "text-sm font-semibold text-slate-900" : "font-semibold"}>{entry.title || t.legacy}</h3>
          <p className={`mt-1 text-xs font-display tabular-nums ${isPaper ? "text-slate-600" : "text-[var(--panel-muted,var(--color-muted-foreground))]"}`}>{entry.start_date ? `${formatDateKey(entry.start_date, langToLocale[lang])} – ${entry.end_date ? formatDateKey(entry.end_date, langToLocale[lang]) : t.undated}` : t.undated}</p>
        </div>
        <span className={`whitespace-nowrap text-xs font-medium ${isPaper ? "text-slate-700" : "text-[var(--panel-muted,var(--color-muted-foreground))]"}`}>{t[treatmentStatus(entry, localDateKey())]}</span>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        {(["diagnosis", "goals", "medications", "care_instructions"] as const).map((field) => entry[field] ? <div key={field}>
          <dt className={`text-xs font-semibold ${isPaper ? "text-slate-500" : "text-[var(--panel-muted,var(--color-muted-foreground))]"}`}>{field === "care_instructions" ? t.instructions : t[field]}</dt>
          <dd className={`mt-1 whitespace-pre-wrap break-words ${isPaper ? "text-slate-800" : ""}`}>{entry[field]}</dd>
        </div> : null)}
      </dl>
      {!!entry.photos?.length && <div className="mt-4">
        <h4 className={`mb-2 text-xs font-semibold ${isPaper ? "text-slate-500" : "text-[var(--panel-muted,var(--color-muted-foreground))]"}`}>{t.photos}</h4>
        <PatientPhotoGallery photos={entry.photos} />
      </div>}
    </article>)}
  </div>;
}

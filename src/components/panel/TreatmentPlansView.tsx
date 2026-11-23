"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { getTreatmentEntries, sortTreatments, treatmentStatus } from "@/lib/treatments";
import { formatDateKey, localDateKey } from "@/lib/panel-dates";
import type { TreatmentPlan } from "@/lib/types/patient";
import { PatientPhotoGallery } from "./PatientMedia";

export function TreatmentPlansView({ plan }: { plan?: TreatmentPlan | null }) {
  const { lang } = useLanguage();
  const t = treatmentTranslations[lang];
  const entries = sortTreatments(getTreatmentEntries(plan));
  if (!entries.length) return <p className="text-sm text-muted-foreground">{t.empty}</p>;
  return <div className="space-y-4">
    {entries.map((entry) => <article key={entry.id} className="print-block rounded-xl border border-[var(--panel-line,var(--color-border))] bg-[var(--panel-surface,var(--color-card))] p-4 text-sm text-[var(--panel-ink,var(--color-foreground))]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold">{entry.title || t.legacy}</h3>
          <p className="mt-1 text-xs font-display tabular-nums text-[var(--panel-muted,var(--color-muted-foreground))]">{entry.start_date ? `${formatDateKey(entry.start_date, langToLocale[lang])} – ${entry.end_date ? formatDateKey(entry.end_date, langToLocale[lang]) : t.undated}` : t.undated}</p>
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-[var(--panel-muted,var(--color-muted-foreground))]">{t[treatmentStatus(entry, localDateKey())]}</span>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        {(["diagnosis", "goals", "medications", "care_instructions"] as const).map((field) => entry[field] ? <div key={field}>
          <dt className="text-xs font-semibold text-[var(--panel-muted,var(--color-muted-foreground))]">{field === "care_instructions" ? t.instructions : t[field]}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words">{entry[field]}</dd>
        </div> : null)}
      </dl>
      {!!entry.photos?.length && <div className="mt-4">
        <h4 className="mb-2 text-xs font-semibold text-[var(--panel-muted,var(--color-muted-foreground))]">{t.photos}</h4>
        <PatientPhotoGallery photos={entry.photos} />
      </div>}
    </article>)}
  </div>;
}

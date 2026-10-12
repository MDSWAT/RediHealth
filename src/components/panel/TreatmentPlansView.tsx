/* eslint-disable @next/next/no-img-element */
"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import { getTreatmentEntries, sortTreatments, treatmentStatus } from "@/lib/treatments";
import { localDateKey } from "@/lib/panel-dates";
import type { TreatmentPlan } from "@/lib/types/patient";

export function TreatmentPlansView({ plan }: { plan?: TreatmentPlan | null }) {
  const { lang } = useLanguage();
  const t = treatmentTranslations[lang];
  const entries = sortTreatments(getTreatmentEntries(plan));
  if (!entries.length) return <p className="text-sm text-muted-foreground">{t.empty}</p>;
  return <div className="space-y-4">
    {entries.map((entry) => <article key={entry.id} className="rounded-lg border border-border bg-card p-4 text-sm">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div><h3 className="font-semibold">{entry.title || t.legacy}</h3><p className="mt-1 text-xs text-muted-foreground">{entry.start_date ? `${entry.start_date} - ${entry.end_date || t.undated}` : t.undated}</p></div>
        <span className="rounded-md bg-muted px-2 py-1 text-xs">{t[treatmentStatus(entry, localDateKey())]}</span>
      </header>
      <dl className="grid gap-4 sm:grid-cols-2">
        {(["diagnosis", "goals", "medications", "care_instructions"] as const).map((field) => entry[field] ? <div key={field}>
          <dt className="text-xs font-semibold text-muted-foreground">{field === "care_instructions" ? t.instructions : t[field]}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words">{entry[field]}</dd>
        </div> : null)}
      </dl>
      {!!entry.photos?.length && <div className="mt-4">
        <h4 className="mb-2 text-xs font-semibold text-muted-foreground">{t.photos}</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {entry.photos.map((photo) => <a key={photo.id} href={photo.data_url} target="_blank" rel="noreferrer" className="min-w-0 rounded-md border border-border p-2">
            <img src={photo.data_url} alt={photo.name} className="h-24 w-full rounded object-contain" />
            <p className="mt-1 break-words text-xs">{photo.name}</p>
          </a>)}
        </div>
      </div>}
    </article>)}
  </div>;
}

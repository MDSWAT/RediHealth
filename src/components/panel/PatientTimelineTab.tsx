/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel } from "@/lib/panel-dates";
import { getTreatmentEntries } from "@/lib/treatments";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import type { FollowupItem, PatientItem, PatientPhoto } from "@/lib/types/patient";

type TimelineEvent = { id: string; date: string; title: string; note?: string; followup?: FollowupItem; photo?: PatientPhoto };
export function PatientTimelineTab({ patient, followups, photos, compact = false, busy = false, onToggleStatus, onSelectFollowup, onCreateMeeting, onDeleteFollowup }: {
  patient: PatientItem; followups: FollowupItem[]; photos: PatientPhoto[]; compact?: boolean; busy?: boolean;
  onToggleStatus?: (id: string, status: FollowupItem["status"]) => void;
  onSelectFollowup?: (item: FollowupItem) => void;
  onCreateMeeting?: (item: FollowupItem) => void;
  onDeleteFollowup?: (item: FollowupItem) => void;
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const treatments = getTreatmentEntries(patient.treatment_plan);
  const events: TimelineEvent[] = [
    { id: "created", date: patient.created_at, title: t.registered, note: patient.condition_notes || undefined },
    ...followups.map((f) => ({ id: `followup-${f.id}`, date: f.completed_at || f.date, title: f.title, note: f.notes, followup: f })),
    ...treatments.filter((entry) => entry.start_date).map((entry) => ({ id: `treatment-${entry.id}`, date: entry.start_date!, title: entry.title || treatmentTranslations[lang].legacy, note: [entry.diagnosis, entry.medications, entry.care_instructions].filter(Boolean).join("\n\n") })),
    ...[...photos, ...treatments.flatMap((entry) => entry.photos || [])].map((p) => ({ id: `photo-${p.id}`, date: p.date, title: p.name, note: p.notes, photo: p })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return <section className="crm-card"><h2>{compact ? t.recentActivity : t.history}</h2><div className="divide-y divide-border">
    {(compact ? events.slice(0, 3) : events).map((event) => <article key={event.id} className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-sm font-medium">{event.title}</h3>{event.followup && <span className="text-xs text-muted-foreground">{t[event.followup.status]}</span>}</div>
      <p className="mt-1 text-xs text-muted-foreground">{event.followup ? followupLabel(event.followup, langToLocale[lang], t.allDay) : new Date(event.date.length === 10 ? `${event.date}T12:00:00` : event.date).toLocaleDateString(langToLocale[lang])}</p>
      {!compact && <>
        {event.note && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{event.note}</p>}
        {event.photo && <a href={event.photo.data_url} target="_blank" rel="noreferrer"><img src={event.photo.data_url} alt={event.photo.name} className="mt-3 max-h-52 max-w-full rounded-md object-contain" /></a>}
        {event.followup && <>
          {event.followup.completion_notes && <div className="mt-3"><h4 className="text-xs font-medium text-muted-foreground">{t.completionNotes}</h4><p className="mt-1 whitespace-pre-wrap text-sm">{event.followup.completion_notes}</p></div>}
          {event.followup.completed_at && <p className="mt-2 text-xs text-muted-foreground">{t.completed}: {new Date(event.followup.completed_at).toLocaleString(langToLocale[lang])}</p>}
          {event.followup.completion_photos?.map((photo) => <a key={photo.id} href={photo.data_url} target="_blank" rel="noreferrer"><img src={photo.data_url} alt={photo.name} className="mt-3 max-h-40 max-w-full rounded-md object-contain" /></a>)}
          {(event.followup.meeting_notes || event.followup.meeting_transcript) && <details className="mt-3"><summary className="cursor-pointer text-sm text-primary">{t.consultationNotes}</summary>{event.followup.meeting_notes && <p className="mt-3 whitespace-pre-wrap text-sm">{event.followup.meeting_notes}</p>}{event.followup.meeting_transcript && <div className="mt-3"><h4 className="text-xs font-medium">{t.transcript}</h4><p className="mt-1 whitespace-pre-wrap text-sm">{event.followup.meeting_transcript}</p></div>}</details>}
          <div className="mt-3 flex flex-wrap gap-2">
            {event.followup.meeting_id && <Link className="crm-button" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${event.followup.meeting_id}`, lang)}>{t.join}</Link>}
            {onSelectFollowup && <button className="crm-button" disabled={busy} onClick={() => onSelectFollowup(event.followup!)}>{event.followup.status === "completed" ? t.reopen : t.markComplete}</button>}
            {!onSelectFollowup && onToggleStatus && <button className="crm-button" disabled={busy} onClick={() => onToggleStatus(event.followup!.id, event.followup!.status === "completed" ? "scheduled" : "completed")}>{event.followup.status === "completed" ? t.reopen : t.markComplete}</button>}
            {onCreateMeeting && !event.followup.meeting_id && <button className="crm-button" disabled={busy} onClick={() => onCreateMeeting(event.followup!)}>{t.createMeeting}</button>}
            {onDeleteFollowup && <details className="crm-menu"><summary className="crm-button flex h-10 w-10 items-center justify-center p-0" aria-label={t.more} title={t.more}><MoreVerticalIcon className="h-5 w-5" /></summary><div><button aria-label={t.delete} title={t.delete} disabled={busy} onClick={() => onDeleteFollowup(event.followup!)}><TrashIcon className="h-4 w-4" /></button></div></details>}
          </div>
        </>}
      </>}
    </article>)}
  </div></section>;
}

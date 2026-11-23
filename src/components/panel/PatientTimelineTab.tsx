"use client";
import { PanelLink as Link } from "./PanelRuntime";
import { ChevronRightIcon, MoreVerticalIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel, followupStatusLabel, formatPanelDate } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import { getTreatmentEntries } from "@/lib/treatments";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import type { FollowupItem, PatientItem, PatientPhoto } from "@/lib/types/patient";
import { PatientPhotoTrigger } from "./PatientMedia";

type TimelineEvent = { id: string; date: string; title: string; note?: string; followup?: FollowupItem; photo?: PatientPhoto };
export function PatientTimelineTab({ patient, followups, photos, compact = false, busy = false, onToggleStatus, onSelectFollowup, onCreateMeeting, onDeleteFollowup, onViewAll }: {
  patient: PatientItem; followups: FollowupItem[]; photos: PatientPhoto[]; compact?: boolean; busy?: boolean;
  onToggleStatus?: (id: string, status: FollowupItem["status"]) => void;
  onSelectFollowup?: (item: FollowupItem) => void;
  onCreateMeeting?: (item: FollowupItem) => void;
  onDeleteFollowup?: (item: FollowupItem) => void;
  onViewAll?: () => void;
}) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const t = crmTranslations[lang];
  const treatments = getTreatmentEntries(patient.treatment_plan);
  const events: TimelineEvent[] = [
    { id: "created", date: patient.created_at, title: t.registered, note: patient.condition_notes || undefined },
    ...followups.map((f) => ({ id: `followup-${f.id}`, date: f.completed_at || f.date, title: f.title, note: f.notes, followup: f })),
    ...treatments.filter((entry) => entry.start_date).map((entry) => ({ id: `treatment-${entry.id}`, date: entry.start_date!, title: entry.title || treatmentTranslations[lang].legacy, note: [entry.diagnosis, entry.medications, entry.care_instructions].filter(Boolean).join("\n\n") })),
    ...[...photos, ...treatments.flatMap((entry) => entry.photos || [])].map((p) => ({ id: `photo-${p.id}`, date: p.date, title: p.name, note: p.notes, photo: p })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const visibleEvents = compact ? events.slice(0, 3) : events;
  return <section className="crm-card">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="!mb-0">{compact ? t.recentActivity : t.history}</h2>
      <span className="text-sm tabular-nums [font-feature-settings:'zero'_0] text-[var(--panel-muted)]">{events.length}</span>
    </div>
    <div className="divide-y divide-[var(--panel-line)]">
      {visibleEvents.map((event) => <article key={event.id} className="py-4 first:pt-1 last:pb-0">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[var(--panel-ink)]">{event.title}</h3>
          {event.followup && <span className={`whitespace-nowrap text-xs ${event.followup.status === "scheduled" ? "font-medium text-[var(--panel-ink)]" : "text-[var(--panel-muted)]"}`}>{followupStatusLabel(event.followup.status, t)}</span>}
        </div>
        <p className="mt-1 text-xs tabular-nums [font-feature-settings:'zero'_0] text-[var(--panel-muted)]">{event.followup ? followupLabel(event.followup, langToLocale[lang], t.allDay, viewerZone) : formatPanelDate(event.date.length === 10 ? `${event.date}T12:00:00` : event.date, langToLocale[lang], "date")}</p>
        {!compact && <>
          {event.note && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--panel-ink)]">{event.note}</p>}
          {event.photo && <PatientPhotoTrigger photo={event.photo} />}
          {event.followup && <>
            {event.followup.completion_notes && <div className="mt-3"><h4 className="text-xs font-medium text-[var(--panel-muted)]">{t.completionNotes}</h4><p className="mt-1 whitespace-pre-wrap text-sm text-[var(--panel-ink)]">{event.followup.completion_notes}</p></div>}
            {event.followup.completed_at && <p className="mt-2 text-xs tabular-nums [font-feature-settings:'zero'_0] text-[var(--panel-muted)]">{t.itemCompleted}: {formatPanelDate(event.followup.completed_at, langToLocale[lang], "dateTime")}</p>}
            {event.followup.completion_photos?.map((photo) => <PatientPhotoTrigger key={photo.id} photo={photo} />)}
            {(event.followup.meeting_notes || event.followup.meeting_transcript) && <details className="mt-3">
              <summary className="inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap text-sm font-medium text-primary hover:underline dark:text-[#bad7fa]">{t.consultationNotes}</summary>
              {event.followup.meeting_notes && <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--panel-ink)]">{event.followup.meeting_notes}</p>}
              {event.followup.meeting_transcript && <div className="mt-3"><h4 className="text-xs font-medium text-[var(--panel-muted)]">{t.transcript}</h4><p className="mt-1 whitespace-pre-wrap text-sm text-[var(--panel-ink)]">{event.followup.meeting_transcript}</p></div>}
            </details>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {event.followup.meeting_id && <Link className="crm-button whitespace-nowrap" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${event.followup.meeting_id}`, lang)}>{t.join}</Link>}
              {onSelectFollowup && <button type="button" className="crm-button whitespace-nowrap" disabled={busy} onClick={() => onSelectFollowup(event.followup!)}>{event.followup.status === "completed" ? t.reopen : t.markComplete}</button>}
              {!onSelectFollowup && onToggleStatus && <button type="button" className="crm-button whitespace-nowrap" disabled={busy} onClick={() => onToggleStatus(event.followup!.id, event.followup!.status === "completed" ? "scheduled" : "completed")}>{event.followup.status === "completed" ? t.reopen : t.markComplete}</button>}
              {onCreateMeeting && !event.followup.meeting_id && <button type="button" className="crm-button whitespace-nowrap" disabled={busy} onClick={() => onCreateMeeting(event.followup!)}>{t.createMeeting}</button>}
              {onDeleteFollowup && <details className="crm-menu">
                <summary className="crm-button flex h-11 w-11 min-h-11 min-w-11 items-center justify-center whitespace-nowrap p-0" aria-label={t.more} title={t.more}><MoreVerticalIcon aria-hidden="true" className="h-5 w-5" /></summary>
                <div>
                  <button type="button" className="!flex min-h-11 items-center gap-2 whitespace-nowrap text-[#b91c1c] dark:text-[#ffb4b4]" disabled={busy} onClick={(clickEvent) => {
                    clickEvent.currentTarget.closest("details")?.removeAttribute("open");
                    onDeleteFollowup(event.followup!);
                  }}><TrashIcon aria-hidden="true" className="h-4 w-4 shrink-0" />{t.delete}</button>
                </div>
              </details>}
            </div>
          </>}
        </>}
      </article>)}
    </div>
    {compact && onViewAll && events.length > 3 && (
      <div className="mt-3 border-t border-[var(--panel-line)] pt-2">
        <button type="button" onClick={onViewAll} className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline dark:text-[#bad7fa]">
          {t.history}
          <ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      </div>
    )}
  </section>;
}

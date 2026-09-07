"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { BellIcon, CalendarIcon, CheckCircleIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { FollowupItem } from "@/lib/types/patient";

interface PatientFollowupsTabProps {
  followups: FollowupItem[];
  showAddFollowup: boolean;
  onToggleShowAddFollowup: () => void;
  newFollowupTitle: string;
  onChangeNewFollowupTitle: (value: string) => void;
  newFollowupDate: string;
  onChangeNewFollowupDate: (value: string) => void;
  newFollowupNotes: string;
  onChangeNewFollowupNotes: (value: string) => void;
  newFollowupReminder: boolean;
  onChangeNewFollowupReminder: (value: boolean) => void;
  newFollowupCreateMeeting: boolean;
  onChangeNewFollowupCreateMeeting: (value: boolean) => void;
  onAddFollowup: (e: FormEvent) => void;
  onToggleFollowupStatus: (id: string, newStatus: FollowupItem["status"]) => void;
  onDeleteFollowup: (followup: FollowupItem) => void;
  onDeleteMeetingHistory: (followup: FollowupItem) => void;
  patientId: string;
}

export function PatientFollowupsTab({
  followups,
  showAddFollowup,
  onToggleShowAddFollowup,
  newFollowupTitle,
  onChangeNewFollowupTitle,
  newFollowupDate,
  onChangeNewFollowupDate,
  newFollowupNotes,
  onChangeNewFollowupNotes,
  newFollowupReminder,
  onChangeNewFollowupReminder,
  newFollowupCreateMeeting,
  onChangeNewFollowupCreateMeeting,
  onAddFollowup,
  onToggleFollowupStatus,
  onDeleteFollowup,
  onDeleteMeetingHistory,
  patientId,
}: PatientFollowupsTabProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      title: "Care Follow-ups & Reminders",
      subtitle: "Schedule check-ins, call reminders, or consultation appointments.",
      newFollowup: "New Follow-up",
      schedule: "Schedule New Follow-Up",
      titleLabel: "Title / Purpose",
      titlePh: "e.g. Call to check symptom progress",
      dateLabel: "Scheduled Date",
      notes: "Staff Notes",
      notesPh: "Special instructions or phone script for worker...",
      reminder: "Set staff notification reminder",
      createMeeting: "Create video meeting",
      cancel: "Cancel",
      add: "Add Follow-up",
      empty: "No follow-ups scheduled yet. Click \"New Follow-up\" to add one.",
      toggleCompletion: "Toggle completion",
      reminderSet: "Reminder Set",
      date: "Date",
      openMeeting: "Open meeting",
      deleteMeeting: "Delete meeting",
      record: "Meeting record",
      recordNotes: "Notes",
      recordTranscript: "Transcript",
      deleteFollowup: "Delete follow-up",
    },
    ro: {
      title: "Follow-up-uri si mementouri",
      subtitle: "Programeaza verificari, apeluri de reamintire sau consultatii.",
      newFollowup: "Follow-up nou",
      schedule: "Programeaza follow-up nou",
      titleLabel: "Titlu / scop",
      titlePh: "ex. Apel pentru verificarea simptomelor",
      dateLabel: "Data programata",
      notes: "Notite personal",
      notesPh: "Instructiuni speciale sau script pentru apel...",
      reminder: "Seteaza memento pentru personal",
      createMeeting: "Creeaza intalnire video",
      cancel: "Anuleaza",
      add: "Adauga follow-up",
      empty: "Nu exista follow-up-uri programate. Apasa \"Follow-up nou\" pentru a adauga.",
      toggleCompletion: "Schimba starea",
      reminderSet: "Memento setat",
      date: "Data",
      openMeeting: "Deschide intalnirea",
      deleteMeeting: "Sterge intalnirea",
      record: "Dosar intalnire",
      recordNotes: "Notite",
      recordTranscript: "Transcriere",
      deleteFollowup: "Sterge follow-up",
    },
    sq: {
      title: "Ndjekje dhe kujtues",
      subtitle: "Planifiko kontrolla, kujtues telefonate ose konsultime.",
      newFollowup: "Ndjekje e re",
      schedule: "Planifiko ndjekje te re",
      titleLabel: "Titulli / qellimi",
      titlePh: "p.sh. Telefonate per kontrollin e simptomave",
      dateLabel: "Data e planifikuar",
      notes: "Shenime stafi",
      notesPh: "Udhezime speciale ose skript telefonate...",
      reminder: "Vendos kujtues per stafin",
      createMeeting: "Krijo takim video",
      cancel: "Anulo",
      add: "Shto ndjekje",
      empty: "Nuk ka ndjekje te planifikuara. Kliko \"Ndjekje e re\" per te shtuar.",
      toggleCompletion: "Ndrysho perfundimin",
      reminderSet: "Kujtues i vendosur",
      date: "Data",
      openMeeting: "Hap takimin",
      deleteMeeting: "Fshi takimin",
      record: "Regjistri i takimit",
      recordNotes: "Shenime",
      recordTranscript: "Transkript",
      deleteFollowup: "Fshi ndjekjen",
    },
    it: {
      title: "Follow-up e promemoria",
      subtitle: "Programma controlli, promemoria chiamate o appuntamenti di consulto.",
      newFollowup: "Nuovo follow-up",
      schedule: "Programma nuovo follow-up",
      titleLabel: "Titolo / scopo",
      titlePh: "es. Chiamata per verificare i sintomi",
      dateLabel: "Data programmata",
      notes: "Note staff",
      notesPh: "Istruzioni speciali o script telefonico...",
      reminder: "Imposta promemoria staff",
      createMeeting: "Crea riunione video",
      cancel: "Annulla",
      add: "Aggiungi follow-up",
      empty: "Nessun follow-up programmato. Clicca \"Nuovo follow-up\" per aggiungerne uno.",
      toggleCompletion: "Cambia completamento",
      reminderSet: "Promemoria impostato",
      date: "Data",
      openMeeting: "Apri riunione",
      deleteMeeting: "Elimina riunione",
      record: "Registro riunione",
      recordNotes: "Note",
      recordTranscript: "Trascrizione",
      deleteFollowup: "Elimina follow-up",
    },
  }[lang];
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleShowAddFollowup}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t.newFollowup}</span>
        </button>
      </div>

      {showAddFollowup ? (
        <form
          onSubmit={onAddFollowup}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            {t.schedule}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.titleLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFollowupTitle}
                onChange={(e) => onChangeNewFollowupTitle(e.target.value)}
                placeholder={t.titlePh}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.dateLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newFollowupDate}
                onChange={(e) => onChangeNewFollowupDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.notes}
            </label>
            <input
              type="text"
              value={newFollowupNotes}
              onChange={(e) => onChangeNewFollowupNotes(e.target.value)}
              placeholder={t.notesPh}
              className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newFollowupReminder}
                onChange={(e) => onChangeNewFollowupReminder(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{t.reminder}</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newFollowupCreateMeeting}
                onChange={(e) => onChangeNewFollowupCreateMeeting(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{t.createMeeting}</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleShowAddFollowup}
                className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                {t.add}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {followups.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
          <CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <span>{t.empty}</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {followups.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onToggleFollowupStatus(
                      item.id,
                      item.status === "completed" ? "scheduled" : "completed",
                    )
                  }
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    item.status === "completed"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border hover:border-primary"
                  }`}
                  title={t.toggleCompletion}
                >
                  {item.status === "completed" ? (
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  ) : null}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        item.status === "completed"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.status === "cancelled"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.reminder_set ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        <BellIcon className="h-3 w-3" />
                        {t.reminderSet}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t.date}: <span className="font-semibold text-foreground">{item.date}</span>
                    {item.notes ? ` &bull; ${item.notes}` : ""}
                  </p>
                  {item.meeting_id ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Link href={withLangPrefix(`/panel/patients/${patientId}/meet/${item.meeting_id}`, lang)} className="text-[11px] font-semibold text-primary hover:underline">{t.openMeeting}</Link>
                      <button type="button" onClick={() => onDeleteMeetingHistory(item)} className="text-[11px] font-semibold text-red-600 hover:underline">{t.deleteMeeting}</button>
                    </div>
                  ) : null}
                  {item.meeting_notes || item.meeting_transcript ? (
                    <details className="mt-2 text-[11px] text-muted-foreground">
                      <summary className="cursor-pointer font-semibold text-primary">{t.record}</summary>
                      {item.meeting_notes ? <p className="mt-1 whitespace-pre-wrap"><span className="font-semibold text-foreground">{t.recordNotes}:</span> {item.meeting_notes}</p> : null}
                      {item.meeting_transcript ? <p className="mt-1 whitespace-pre-wrap"><span className="font-semibold text-foreground">{t.recordTranscript}:</span> {item.meeting_transcript}</p> : null}
                    </details>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteFollowup(item)}
                className="self-end sm:self-auto rounded p-1 text-red-600 hover:bg-red-500/10"
                title={t.deleteFollowup}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

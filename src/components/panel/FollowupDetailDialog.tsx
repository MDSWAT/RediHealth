"use client";
import Link from "next/link";
import { TrashIcon } from "@/components/ui/icons";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel } from "@/lib/panel-dates";
import type { PatientItem, FollowupItem } from "@/lib/types/patient";

export function FollowupDetailDialog({ patient, followup, busy, error, onClose, onToggle, onDelete, onCreateMeeting }: {
  patient: PatientItem; followup: FollowupItem; busy: boolean; error?: string; onClose: () => void; onToggle: (completionNotes?: string) => void; onDelete: () => void; onCreateMeeting: () => void;
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const [completionNotes, setCompletionNotes] = useState(followup.completion_notes || "");
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="crm-dialog care-panel" style={{ width: "min(760px, calc(100vw - 24px))" }} aria-labelledby="followup-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="flex items-start justify-between gap-3"><h2 id="followup-title" className="text-xl font-semibold">{followup.title}</h2><button className="crm-button" onClick={onClose} disabled={busy}>{t.back}</button></div>
    {error && <p role="alert" className="crm-error mt-3">{error}</p>}
    <p className="mt-3 text-sm text-muted-foreground">{followupLabel(followup, langToLocale[lang], t.allDay)} · {t[followup.status]}</p>
    <Link className="mt-5 inline-block text-primary" href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}>{patient.full_name}</Link>
    <div className="mt-2 flex flex-wrap gap-4 text-sm"><a href={`tel:${patient.phone}`}>{patient.phone}</a><a className="break-all" href={`mailto:${patient.email}`}>{patient.email}</a></div>
    {followup.notes && <p className="mt-5 whitespace-pre-wrap text-sm">{followup.notes}</p>}
    {followup.status === "completed" && followup.completion_notes && <section className="mt-5"><h3 className="text-sm font-medium">{t.completionNotes}</h3><p className="mt-2 whitespace-pre-wrap text-sm">{followup.completion_notes}</p></section>}
    {followup.status !== "completed" && <label className="mt-5 block text-sm font-medium">{t.completionNotes}<textarea className="crm-input mt-2" rows={4} maxLength={5000} value={completionNotes} onChange={(event) => setCompletionNotes(event.target.value)} disabled={busy} /></label>}
    {(followup.meeting_notes || followup.meeting_transcript) && <details className="mt-5 text-sm"><summary>{t.consultationNotes}</summary>{followup.meeting_notes && <p className="mt-3 whitespace-pre-wrap">{followup.meeting_notes}</p>}{followup.meeting_transcript && <p className="mt-3 whitespace-pre-wrap">{followup.meeting_transcript}</p>}</details>}
    <div className="mt-6 flex flex-wrap gap-2">{followup.meeting_id && <Link className="crm-button crm-primary" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${followup.meeting_id}`, lang)}>{t.join}</Link>}<Link className="crm-button" href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}>{t.openPatient}</Link><button className="crm-button" disabled={busy} onClick={() => onToggle(completionNotes)}>{followup.status === "completed" ? t.reopen : t.markComplete}</button>{!followup.meeting_id && <button className="crm-button" disabled={busy} onClick={onCreateMeeting}>{t.createMeeting}</button>}<button className="crm-button flex h-10 w-10 items-center justify-center p-0 text-red-700" aria-label={t.delete} title={t.delete} disabled={busy} onClick={onDelete}><TrashIcon className="h-4 w-4" /></button></div>
  </dialog>;
}

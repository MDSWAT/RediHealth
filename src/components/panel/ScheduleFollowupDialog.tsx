"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import { localDateKey } from "@/lib/panel-dates";
import type { FollowupItem } from "@/lib/types/patient";
import { useUnsavedChanges } from "./useUnsavedChanges";

type PatientChoice = { id: string; full_name: string };
export function ScheduleFollowupDialog({ patients, patientId = "", date = localDateKey(), onClose, onSaved }: {
  patients: PatientChoice[]; patientId?: string; date?: string; onClose: () => void;
  onSaved: (patientId: string, followup: FollowupItem, emailSent?: boolean) => void;
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef<string>("");
  const [selected, setSelected] = useState(patientId);
  const [title, setTitle] = useState("");
  const [scheduledDate, setDate] = useState(date);
  const [time, setTime] = useState("");
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Bucharest");
  const [notes, setNotes] = useState("");
  const [addVideo, setVideo] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = Boolean(title || time || notes || selected !== patientId || scheduledDate !== date || addVideo);
  useUnsavedChanges(dirty && !saving, t.unsaved);
  useEffect(() => { dialog.current?.showModal(); requestId.current = crypto.randomUUID(); }, []);
  function close() { if (!saving && (!dirty || window.confirm(t.unsaved))) onClose(); }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/patients/${encodeURIComponent(selected)}/followups`, { method: "POST", headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang }, body: JSON.stringify({ id: requestId.current, title, date: scheduledDate, time, timezone, notes, video: addVideo, reminder_set: reminder }) });
      const data = await response.json() as { followup?: FollowupItem; email_sent?: boolean; error?: string };
      if (!response.ok || !data.followup) { setError(data.error || t.error); return; }
      onSaved(selected, data.followup, data.email_sent);
      onClose();
    } catch { setError(t.error); } finally { setSaving(false); }
  }
  return <dialog ref={dialog} className="crm-dialog care-panel" aria-labelledby="schedule-title" onCancel={(event) => { event.preventDefault(); close(); }}>
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center justify-between gap-4"><h2 id="schedule-title" className="text-xl font-semibold">{t.schedule}</h2><button type="button" onClick={close} disabled={saving} className="crm-button">{t.cancel}</button></div>
      {error && <p role="alert" className="crm-error">{error}</p>}
      {!patients.length ? <p>{t.noPatients}</p> : <>
        <label className="crm-label">{t.patient}<select required className="crm-input" value={selected} onChange={(e) => setSelected(e.target.value)} disabled={Boolean(patientId) || saving}><option value="">{t.choosePatient}</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}</select></label>
        <label className="crm-label">{t.purpose}<input autoFocus required maxLength={200} className="crm-input" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} /></label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="crm-label">{t.date}<input required type="date" className="crm-input" value={scheduledDate} onChange={(e) => setDate(e.target.value)} disabled={saving} /></label><label className="crm-label">{t.time}<input type="time" className="crm-input" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} /></label></div>
        {time && <p className="text-sm text-muted-foreground">{t.timezone}: {timezone}</p>}
        <label className="crm-label">{t.optionalNotes}<textarea className="crm-input" rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} /></label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={addVideo} onChange={(e) => setVideo(e.target.checked)} disabled={saving} />{t.video}</label>
        <details className="text-sm"><summary>{t.additional}</summary><label className="mt-3 flex items-center gap-2"><input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} disabled={saving} />{t.reminder}</label></details>
        <div className="flex justify-end border-t border-border pt-4"><button disabled={saving} className="crm-button crm-primary" type="submit">{saving ? t.saving : t.scheduleSave}</button></div>
      </>}
    </form>
  </dialog>;
}

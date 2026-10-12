/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel, sortFollowups } from "@/lib/panel-dates";
import { getTreatmentEntries, sortTreatments } from "@/lib/treatments";
import { validateTreatmentPlanInput } from "@/lib/validation";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import type { FollowupItem, PatientItem, PatientPhoto, TreatmentPlan } from "@/lib/types/patient";
import { CreatePatientModal } from "./CreatePatientModal";
import { PatientTreatmentTab } from "./PatientTreatmentTab";
import { PatientPhotosTab } from "./PatientPhotosTab";
import { PatientTimelineTab } from "./PatientTimelineTab";
import { PatientPrintReport } from "./PatientPrintReport";
import { ScheduleFollowupDialog } from "./ScheduleFollowupDialog";
import { FollowupDetailDialog } from "./FollowupDetailDialog";
import { useUnsavedChanges } from "./useUnsavedChanges";

export function PatientProfileView({ initialPatient, isAdmin = false }: { initialPatient: PatientItem; isAdmin?: boolean }) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const fields = createPatientModalTranslations[lang];
  const router = useRouter();
  const [patient, setPatient] = useState(initialPatient);
  const [tab, setTab] = useState<"summary" | "carePlan" | "history">("summary");
  const [editing, setEditing] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<FollowupItem | null>(null);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [treatment, setTreatment] = useState<TreatmentPlan>(initialPatient.treatment_plan || {});
  const [treatmentSaved, setTreatmentSaved] = useState(false);
  const [pendingTreatmentPhoto, setPendingTreatmentPhoto] = useState(false);
  const handlePendingTreatmentPhoto = useCallback((pending: boolean) => {
    setPendingTreatmentPhoto(pending);
    if (pending) setTreatmentSaved(false);
  }, []);
  const [photoName, setPhotoName] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const followups = patient.followups || [];
  const photos = patient.photos || [];
  const upcoming = sortFollowups(followups.filter((item) => item.status === "scheduled"));
  const next = upcoming[0];
  const treatmentEntries = sortTreatments(getTreatmentEntries(treatment));
  const dirty = pendingTreatmentPhoto || JSON.stringify(treatment) !== JSON.stringify(patient.treatment_plan || {});
  useUnsavedChanges(dirty, t.unsaved);
  useEffect(() => {
    if (sessionStorage.getItem(`patient-portal-warning:${initialPatient.id}`)) {
      sessionStorage.removeItem(`patient-portal-warning:${initialPatient.id}`);
      Promise.resolve().then(() => setNotice(t.portalWarning));
    }
  }, [initialPatient.id, t.portalWarning]);
  async function save(updates: Partial<PatientItem>): Promise<boolean> {
    setError(""); setSaving(true);
    try {
      const response = await fetch("/api/patients", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: patient.id, ...updates }) });
      if (!response.ok) { const data = await response.json(); setError(data.error || t.error); return false; }
      setPatient((current) => ({ ...current, ...updates })); return true;
    } catch { setError(t.error); return false; } finally { setSaving(false); }
  }
  async function toggleFollowup(id: string, status: FollowupItem["status"], completionNotes?: string) {
    if (saving) return;
    const updated = await save({ followups: followups.map((f) => f.id === id ? {
      ...f,
      status,
      completed_at: status === "completed" ? new Date().toISOString() : undefined,
      completion_notes: status === "completed" ? completionNotes?.trim() || undefined : f.completion_notes,
    } : f) });
    if (updated) setSelectedFollowup(null);
  }
  async function createFollowupMeeting(item: FollowupItem) {
    if (saving || item.meeting_id) return;
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({ title: item.title, patientId: patient.id, followupId: item.id }),
      });
      const data = await response.json() as {
        error?: string;
        id?: string;
        meetingUrl?: string;
        email_sent?: boolean;
        followup?: FollowupItem;
      };
      if (!response.ok || !data.id || !data.meetingUrl || !data.followup) {
        setError(data.error || t.error);
        return;
      }
      setPatient((current) => ({
        ...current,
        followups: (current.followups || []).map((followup) =>
          followup.id === item.id ? data.followup! : followup,
        ),
      }));
      setSelectedFollowup(data.followup);
      if (data.email_sent === false) setNotice(t.invitationWarning);
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }
  async function deleteFollowup(item: FollowupItem) {
    if (saving || !window.confirm(t.deleteConfirm)) return;
    try {
      if (item.meeting_id) {
        const response = await fetch(`/api/meetings?id=${encodeURIComponent(item.meeting_id)}`, { method: "DELETE" });
        if (!response.ok) { setError(t.error); return; }
      }
      if (await save({ followups: followups.filter((f) => f.id !== item.id) })) setSelectedFollowup(null);
    } catch { setError(t.error); }
  }
  async function deletePatient() {
    if (!window.confirm(t.deleteConfirm) || (dirty && !window.confirm(t.unsaved))) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/patients?id=${encodeURIComponent(patient.id)}`, { method: "DELETE" });
      if (!response.ok) { setError(t.error); return; }
      router.push(withLangPrefix("/panel/patients", lang));
    } catch { setError(t.error); } finally { setSaving(false); }
  }
  async function sendPortal() {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/patients/send-portal-link", { method: "POST", headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang }, body: JSON.stringify({ id: patient.id }) });
      const data = await response.json();
      if (!response.ok) setError(data.error || t.error); else setNotice(data.email_sent === false ? t.portalWarning : t.saved);
    } catch { setError(t.error); } finally { setSaving(false); }
  }
  function readPhoto(event: ChangeEvent<HTMLInputElement>, update: (value: string | null) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError(t.imageError); event.target.value = ""; return; }
    const reader = new FileReader(); reader.onload = () => update(String(reader.result)); reader.onerror = () => setError(t.error); reader.readAsDataURL(file);
  }
  function readProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/) || file.size > 5 * 1024 * 1024) {
      setError(t.imageError);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") void save({ profile_photo: reader.result });
      else setError(t.error);
    };
    reader.onerror = () => setError(t.error);
    reader.readAsDataURL(file);
  }
  async function addPhoto(event: FormEvent) {
    event.preventDefault(); if (!photoData || saving) return;
    const photo: PatientPhoto = { id: crypto.randomUUID(), name: photoName.trim() || t.attachments, data_url: photoData, date: new Date().toISOString(), notes: photoNote.trim() || undefined };
    if (await save({ photos: [photo, ...photos] })) { setPhotoData(null); setPhotoName(""); setPhotoNote(""); }
  }
  async function saveTreatments() {
    const validated = validateTreatmentPlanInput(treatment);
    if (!validated.ok) { setError(treatmentTranslations[lang].invalid); return; }
    const nextTreatment = validated.value || {};
    if (await save({ treatment_plan: nextTreatment })) {
      setTreatment(nextTreatment);
      setTreatmentSaved(true);
    }
  }
  if (printing) return <PatientPrintReport patient={patient} status={patient.status} treatmentPlan={treatment} followups={followups} photos={photos} onClose={() => setPrinting(false)} />;
  const statusLabel = patient.status === "active" ? fields.activeCare : patient.status === "inactive" ? fields.inactive : fields.archived;
  const priorityLabel = patient.priority === "critical" ? fields.pCritical : patient.priority === "high" ? fields.pHigh : patient.priority === "low" ? fields.pLow : fields.pModerate;
  return <div className="space-y-5">
    <header><Link className="mb-4 inline-block text-sm text-primary" href={withLangPrefix("/panel/patients", lang)}>← {t.back}</Link><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div className="flex items-center gap-4"><div className="flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-full bg-primary-soft text-xl font-semibold text-primary">{patient.profile_photo ? <img src={patient.profile_photo} alt={t.profilePhoto} className="h-full w-full object-cover" /> : patient.full_name.trim().charAt(0).toUpperCase()}</div><div><h1 className="text-2xl font-semibold">{patient.full_name}</h1><p className="mt-2 text-sm text-muted-foreground">#{patient.id} · {statusLabel} · {priorityLabel}</p><div className="mt-2 flex flex-wrap gap-3 text-xs"><label className="cursor-pointer font-medium text-primary">{patient.profile_photo ? t.changeProfilePhoto : t.addProfilePhoto}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={saving} onChange={readProfilePhoto} /></label>{patient.profile_photo && <button className="text-red-700" disabled={saving} onClick={() => void save({ profile_photo: null })}>{t.removeProfilePhoto}</button>}</div></div></div><div className="flex flex-wrap gap-2"><button className="crm-button crm-primary" onClick={() => setScheduling(true)}>{t.schedule}</button><button className="crm-button" onClick={() => setEditing(true)}>{t.edit}</button><details className="crm-menu"><summary className="crm-button">{t.more}</summary><div><button onClick={() => setPrinting(true)}>{t.print}</button>{patient.has_portal_access && <button disabled={saving} onClick={sendPortal}>{t.sendPortal}</button>}<button className="text-red-700" disabled={saving} onClick={deletePatient}>{t.delete}</button></div></details></div></div></header>
    {error && <p className="crm-error" role="alert">{error}</p>}{notice && <p className="crm-notice" role="status">{notice}</p>}
    <div className="crm-tabs" role="tablist" aria-label={patient.full_name}>{(["summary", "carePlan", "history"] as const).map((id) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`content-${id}`} onClick={() => {
      if (pendingTreatmentPhoto && id !== "carePlan" && !window.confirm(treatmentTranslations[lang].discardPhoto)) return;
      setTab(id);
    }}>{t[id]}</button>)}</div>
    <section id={`content-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-5">
      {tab === "summary" && <>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="space-y-5"><section className="crm-card"><h2>{t.contact}</h2><div className="space-y-3 text-sm"><a className="block text-primary" href={`tel:${patient.phone}`}>{patient.phone}</a><a className="block break-all text-primary" href={`mailto:${patient.email}`}>{patient.email}</a>{patient.date_of_birth && <p>{fields.dob}: {patient.date_of_birth}</p>}{patient.address && <p>{patient.address}</p>}</div><h2 className="mt-6">{t.careTeam}</h2><p className="text-sm text-muted-foreground">{patient.assigned_worker_names?.join(", ") || patient.assigned_worker_name || fields.unassigned}</p></section><section className="crm-card"><h2>{t.nextFollowup}</h2>{next ? <><p className="font-medium">{next.title}</p><p className="mt-2 text-sm text-muted-foreground">{followupLabel(next, langToLocale[lang], t.allDay)}</p>{next.notes && <p className="mt-3 text-sm">{next.notes}</p>}{next.meeting_id && <Link className="crm-button mt-4" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${next.meeting_id}`, lang)}>{t.join}</Link>}<button className="crm-button mt-4" disabled={saving} onClick={() => setSelectedFollowup(next)}>{t.markComplete}</button></> : <p className="text-sm text-muted-foreground">{t.noFollowup}</p>}</section></div>
          <div className="space-y-5"><section className="crm-card"><h2>{t.condition}</h2><p className="whitespace-pre-wrap text-sm leading-relaxed">{patient.condition_notes || "—"}</p><div className="mt-5 border-t border-border pt-4"><h2>{treatmentTranslations[lang].title} ({treatmentEntries.length})</h2>{treatmentEntries.slice(0, 3).map((entry) => <div key={entry.id} className="mt-3 text-sm"><p className="font-medium">{entry.title || treatmentTranslations[lang].legacy}</p><p className="text-xs text-muted-foreground">{entry.start_date ? `${entry.start_date} - ${entry.end_date}` : treatmentTranslations[lang].undated}</p><p className="line-clamp-2 text-muted-foreground">{entry.diagnosis || entry.care_instructions}</p></div>)}<button className="mt-3 text-sm font-medium text-primary" onClick={() => setTab("carePlan")}>{t.carePlan} →</button></div></section><PatientTimelineTab patient={patient} followups={followups} photos={photos} compact /></div>
        </div>
        <section className="crm-card"><div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2>{t.upcoming}</h2><button className="crm-button" onClick={() => setScheduling(true)}>{t.schedule}</button></div>{upcoming.length ? upcoming.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4"><div><p className="font-medium text-sm">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{followupLabel(item, langToLocale[lang], t.allDay)}</p></div><div className="flex gap-2">{item.meeting_id && <Link className="crm-button" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${item.meeting_id}`, lang)}>{t.join}</Link>}<button className="crm-button" disabled={saving} onClick={() => setSelectedFollowup(item)}>{t.markComplete}</button></div></div>) : <p className="text-sm text-muted-foreground">{t.noFollowup}</p>}</section>
      </>}
      {tab === "carePlan" && <>
        <section className="crm-card"><div className="flex items-center justify-between gap-3"><h2>{t.medicalHistory}</h2><button className="crm-button" onClick={() => setEditing(true)}>{t.edit}</button></div><p className="whitespace-pre-wrap text-sm leading-relaxed">{patient.medical_history || "—"}</p></section>
        <PatientTreatmentTab treatmentPlan={treatment} onChangeTreatmentPlan={(plan) => { setTreatment(plan); setTreatmentSaved(false); }} treatmentSavedMsg={treatmentSaved} isSavingTreatment={saving} onSaveTreatmentPlan={saveTreatments} onPendingPhotoChange={handlePendingTreatmentPhoto} />
        <details className="crm-card"><summary className="cursor-pointer text-sm font-medium">{t.attachments} ({photos.length})</summary><div className="mt-4"><PatientPhotosTab photos={photos} newPhotoName={photoName} onChangeNewPhotoName={setPhotoName} newPhotoNote={photoNote} onChangeNewPhotoNote={setPhotoNote} newPhotoData={photoData} onImageUpload={(e) => readPhoto(e, setPhotoData)} onAddPhoto={addPhoto} onDeletePhoto={async (id) => { if (!saving && window.confirm(t.deleteConfirm)) await save({ photos: photos.filter((p) => p.id !== id) }); }} /></div></details>
      </>}
      {tab === "history" && <PatientTimelineTab patient={patient} followups={followups} photos={photos} onSelectFollowup={setSelectedFollowup} onCreateMeeting={createFollowupMeeting} onDeleteFollowup={deleteFollowup} busy={saving} />}
    </section>
    {scheduling && <ScheduleFollowupDialog patients={[patient]} patientId={patient.id} onClose={() => setScheduling(false)} onSaved={(_, item, emailSent) => { setPatient((current) => ({ ...current, followups: [item, ...(current.followups || []).filter((f) => f.id !== item.id)] })); setNotice(emailSent === false ? t.invitationWarning : ""); }} />}
    {selectedFollowup && followups.some((item) => item.id === selectedFollowup.id) && <FollowupDetailDialog patient={patient} followup={followups.find((item) => item.id === selectedFollowup.id)!} busy={saving} error={error} onClose={() => setSelectedFollowup(null)} onToggle={(notes) => toggleFollowup(selectedFollowup.id, selectedFollowup.status === "completed" ? "scheduled" : "completed", notes)} onCreateMeeting={() => createFollowupMeeting(selectedFollowup)} onDelete={() => deleteFollowup(selectedFollowup)} />}
    {editing && <CreatePatientModal patient={patient} isAdmin={isAdmin} onClose={() => setEditing(false)} onSuccess={(updated) => { setPatient((current) => ({ ...current, ...updated })); setEditing(false); }} />}
  </div>;
}

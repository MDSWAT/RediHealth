"use client";
import { PanelLink as Link, usePanelRouter as useRouter, usePanelRuntime } from "./PanelRuntime";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { toAvatarDataUrl } from "@/lib/image";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel, formatPanelDate, sortFollowups } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
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
import { PatientIntakeSummary } from "./PatientIntakeSummary";
import { PatientAvatar, PatientImageViewer, PatientPhotoGallery } from "./PatientMedia";
import { patientDesignTranslations } from "@/lib/i18n/patient-design-translations";
import "./patient-workspace.css";

export function PatientProfileView({ initialPatient, isAdmin = false, isRomania }: { initialPatient: PatientItem; isAdmin?: boolean; isRomania: boolean }) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const design = patientDesignTranslations[lang];
  const fields = createPatientModalTranslations[lang];
  const router = useRouter();
  const [patient, setPatient] = useState(initialPatient);
  const [tab, setTab] = useState<"summary" | "carePlan" | "photos" | "history">("summary");
  const [profilePreview, setProfilePreview] = useState(false);
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
  const treatmentPhotos = treatmentEntries.flatMap((entry) => entry.photos || []);
  const dirty = Boolean(photoData) || pendingTreatmentPhoto || JSON.stringify(treatment) !== JSON.stringify(patient.treatment_plan || {});
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
    event.target.value = "";
    if (!file) return;
    update(null);
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
    toAvatarDataUrl(file)
      .then((dataUrl) => save({ profile_photo: dataUrl }))
      .catch(() => setError(t.error));
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
  const formatDay = (iso?: string | null) => {
    if (!iso) return "";
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);
    return Number.isNaN(date.getTime()) ? iso : formatPanelDate(date, langToLocale[lang], "date");
  };
  const careTeam = (patient.assigned_worker_names?.length ? patient.assigned_worker_names : [patient.assigned_worker_name || ""])
    .map((name) => name.trim()).filter(Boolean);
  const intakeDocCount = patient.intake?.has_documents ? patient.intake.documents.length : 0;
  const totalMediaCount = photos.length + treatmentPhotos.length + intakeDocCount;
  const hasOtherMedia = treatmentPhotos.length > 0 || intakeDocCount > 0;
  return <div className="patient-record space-y-5">
    <header>
      <Link className="mb-3 inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline dark:text-[#bad7fa]" href={withLangPrefix("/panel/patients", lang)}><ChevronLeftIcon aria-hidden="true" className="h-4 w-4 shrink-0" />{t.back}</Link>
      <div className="patient-record-header">
        <div className="patient-record-identity">
          <div className="patient-portrait"><PatientAvatar name={patient.full_name} src={patient.profile_photo} large onPreview={() => setProfilePreview(true)} />
            <label className={`patient-photo-upload${saving ? " is-disabled" : ""}`}>{patient.profile_photo ? t.changeProfilePhoto : t.addProfilePhoto}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={saving} onChange={readProfilePhoto} /></label>
            {patient.profile_photo && <button type="button" className="patient-photo-remove whitespace-nowrap dark:text-[#ffb4b4]" disabled={saving} onClick={() => { if (window.confirm(t.deleteConfirm)) void save({ profile_photo: null }); }}>{t.removeProfilePhoto}</button>}
          </div>
          <div className="patient-record-details">
            <h1 className="break-words text-2xl font-bold text-[var(--panel-ink)]">{patient.full_name}</h1>
            <div aria-label={t.contact} className="mt-2 space-y-1 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <a className="font-display tabular-nums text-primary dark:text-[#bad7fa]" href={`tel:${patient.phone}`}>{patient.phone}</a>
                <a className="min-w-0 break-all text-primary dark:text-[#bad7fa]" href={`mailto:${patient.email}`}>{patient.email}</a>
              </div>
              {patient.date_of_birth && <p className="font-display tabular-nums">{fields.dob}: {formatDay(patient.date_of_birth)}</p>}
              {patient.address && <p className="break-words">{patient.address}</p>}
            </div>
            <div className="patient-record-meta">
              <span data-patient-status={patient.status}>{statusLabel}</span>
              <span data-patient-priority={patient.priority} className={patient.priority === "critical" || patient.priority === "high" ? "font-medium" : undefined}>{priorityLabel}</span>
              <span className="font-display tabular-nums">#{patient.id}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 min-[1200px]:shrink-0 min-[1200px]:justify-end">
          <button type="button" className="crm-button crm-primary whitespace-nowrap" onClick={() => setScheduling(true)}>{t.schedule}</button>
          <button type="button" className="crm-button whitespace-nowrap" onClick={() => setEditing(true)}>{t.edit}</button>
          <details className="crm-menu">
            <summary className="crm-button whitespace-nowrap">{t.more}</summary>
            <div>
              <button type="button" className="min-h-11 whitespace-nowrap" onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); setPrinting(true); }}>{t.print}</button>
              {patient.has_portal_access && <button type="button" className="min-h-11 whitespace-nowrap" disabled={saving} onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); void sendPortal(); }}>{t.sendPortal}</button>}
              <button type="button" className="min-h-11 whitespace-nowrap text-[#b91c1c] dark:text-[#ffb4b4]" disabled={saving} onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); void deletePatient(); }}>{t.delete}</button>
            </div>
          </details>
        </div>
      </div>
    </header>
    {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-[#b91c1c] dark:text-[#ffb4b4]" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold underline underline-offset-2 hover:no-underline">{t.close}</button></div>}
    {notice && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-4 py-2 text-sm text-[var(--panel-ink)]" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold text-primary underline underline-offset-2 hover:no-underline dark:text-[#bad7fa]">{t.close}</button></div>}
    <div className="crm-tabs" role="tablist" aria-label={patient.full_name} onKeyDown={(event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const current = tabs.indexOf(event.target as HTMLButtonElement);
      if (current < 0) return;
      event.preventDefault();
      const nextTab = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[nextTab].focus(); tabs[nextTab].click();
    }}>{(["summary", "carePlan", "photos", "history"] as const).map((id) => <button key={id} type="button" id={`tab-${id}`} role="tab" tabIndex={tab === id ? 0 : -1} aria-selected={tab === id} aria-controls={`content-${id}`} className="whitespace-nowrap" onClick={() => {
      if (pendingTreatmentPhoto && id !== "carePlan" && !window.confirm(treatmentTranslations[lang].discardPhoto)) return;
      if (photoData && id !== "photos") { if (!window.confirm(t.unsaved)) return; setPhotoData(null); }
      setTab(id);
    }}>{id === "photos" ? <>{design.photos}<span className="patient-tab-count font-display tabular-nums">{totalMediaCount}</span></> : t[id]}</button>)}</div>
    <section id={`content-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-5">
      {tab === "summary" && <>
        <div className="patient-summary-grid">
          <div className="patient-summary-main space-y-5">
            <section className="crm-card">
              <h2>{t.condition}</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--panel-ink)]">{patient.condition_notes || "—"}</p>
              <div className="mt-5 border-t border-[var(--panel-line)] pt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-[var(--panel-ink)]">{treatmentTranslations[lang].title}</h3>
                  <span className="text-sm font-display tabular-nums text-[var(--panel-muted)]">{treatmentEntries.length}</span>
                </div>
                {treatmentEntries.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {treatmentEntries.slice(0, 3).map((entry) => <div key={entry.id} className="text-sm">
                      <p className="font-medium text-[var(--panel-ink)]">{entry.title || treatmentTranslations[lang].legacy}</p>
                      <p className="mt-0.5 text-xs font-display tabular-nums text-[var(--panel-muted)]">{entry.start_date ? `${formatDay(entry.start_date)} – ${formatDay(entry.end_date)}` : treatmentTranslations[lang].undated}</p>
                      {(entry.diagnosis || entry.care_instructions) && <p className="mt-1 line-clamp-2 text-[var(--panel-muted)]">{entry.diagnosis || entry.care_instructions}</p>}
                    </div>)}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[var(--panel-muted)]">{treatmentTranslations[lang].empty}</p>
                )}
                <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline dark:text-[#bad7fa]" onClick={() => setTab("carePlan")}>{t.carePlan}<ChevronRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" /></button>
              </div>
            </section>
            <PatientTimelineTab patient={patient} followups={followups} photos={photos} compact onViewAll={() => setTab("history")} />
          </div>
          <div className="patient-summary-aside space-y-5">
            <section className="crm-card">
              <h2>{t.nextFollowup}</h2>
              {next ? <>
                <p className="font-medium text-[var(--panel-ink)]">{next.title}</p>
                <p className="mt-2 text-sm font-display tabular-nums text-[var(--panel-muted)]">{followupLabel(next, langToLocale[lang], t.allDay, viewerZone)}</p>
                {next.notes && <p className="mt-3 text-sm text-[var(--panel-ink)]">{next.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {next.meeting_id && <Link className="crm-button whitespace-nowrap" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${next.meeting_id}`, lang)}>{t.join}</Link>}
                  <button type="button" className="crm-button whitespace-nowrap" disabled={saving} onClick={() => setSelectedFollowup(next)}>{t.markComplete}</button>
                </div>
              </> : <p className="text-sm text-[var(--panel-muted)]">{t.noFollowup}</p>}
            </section>
            <section className="crm-card">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="!mb-0">{t.careTeam}</h2>
                <span className="text-sm font-display tabular-nums text-[var(--panel-muted)]">{careTeam.length}</span>
              </div>
              {careTeam.length ? <ul aria-label={t.careTeam} className="divide-y divide-[var(--panel-line)]">
                {careTeam.map((name, index) => <li key={`${name}:${index}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--panel-selection)] text-xs font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]">
                    {name.split(/\s+/).filter((part) => !/^(dr\.?|doctor)$/i.test(part)).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || name.charAt(0).toUpperCase()}
                  </span>
                  <p className="min-w-0 break-words text-sm font-medium text-[var(--panel-ink)]">{name}</p>
                </li>)}
              </ul> : <p className="text-sm text-[var(--panel-muted)]">{fields.unassigned}</p>}
            </section>

          </div>
        </div>
        {/* The next follow-up already has its own card; this list only shows the ones after it. */}
        {upcoming.length > 1 && <section className="crm-card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="!mb-0">{t.upcoming}</h2>
            <span className="text-sm font-display tabular-nums text-[var(--panel-muted)]">{upcoming.length - 1}</span>
          </div>
          {upcoming.slice(1).map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--panel-line)] py-4">
            <div>
              <p className="text-sm font-medium text-[var(--panel-ink)]">{item.title}</p>
              <p className="mt-1 text-sm font-display tabular-nums text-[var(--panel-muted)]">{followupLabel(item, langToLocale[lang], t.allDay, viewerZone)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.meeting_id && <Link className="crm-button whitespace-nowrap" href={withLangPrefix(`/panel/patients/${patient.id}/meet/${item.meeting_id}`, lang)}>{t.join}</Link>}
              <button type="button" className="crm-button whitespace-nowrap" disabled={saving} onClick={() => setSelectedFollowup(item)}>{t.markComplete}</button>
            </div>
          </div>)}
        </section>}
      </>}
      {tab === "carePlan" && <>
        <section className="crm-card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="!mb-0">{t.medicalHistory}</h2>
            <button type="button" className="crm-button whitespace-nowrap" onClick={() => setEditing(true)}>{t.edit}</button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--panel-ink)]">{patient.medical_history || "—"}</p>
        </section>
        <PatientTreatmentTab treatmentPlan={treatment} onChangeTreatmentPlan={(plan) => { setTreatment(plan); setTreatmentSaved(false); }} treatmentSavedMsg={treatmentSaved} isSavingTreatment={saving} onSaveTreatmentPlan={saveTreatments} onPendingPhotoChange={handlePendingTreatmentPhoto} />

      </>}
      {tab === "photos" && <>
        <PatientIntakeSummary intake={patient.intake} />
        {treatmentPhotos.length > 0 && <section className="crm-card"><h2>{treatmentTranslations[lang].title}</h2><PatientPhotoGallery photos={treatmentPhotos} /></section>}
        <PatientPhotosTab busy={saving} hasOtherMedia={hasOtherMedia} photos={photos} newPhotoName={photoName} onChangeNewPhotoName={setPhotoName} newPhotoNote={photoNote} onChangeNewPhotoNote={setPhotoNote} newPhotoData={photoData} onImageUpload={(e) => readPhoto(e, setPhotoData)} onAddPhoto={addPhoto} onDeletePhoto={async (id) => { if (!saving && window.confirm(t.deleteConfirm)) await save({ photos: photos.filter((p) => p.id !== id) }); }} />
      </>}
      {tab === "history" && <PatientTimelineTab patient={patient} followups={followups} photos={photos} onSelectFollowup={setSelectedFollowup} onCreateMeeting={createFollowupMeeting} onDeleteFollowup={deleteFollowup} busy={saving} />}
    </section>
    {profilePreview && patient.profile_photo && <PatientImageViewer images={[{ id: patient.id, name: patient.full_name, data_url: patient.profile_photo, date: "" }]} index={0} onClose={() => setProfilePreview(false)} />}
    {scheduling && <ScheduleFollowupDialog patients={[patient]} patientId={patient.id} onClose={() => setScheduling(false)} onSaved={(_, item, emailSent) => { setPatient((current) => ({ ...current, followups: [item, ...(current.followups || []).filter((f) => f.id !== item.id)] })); setNotice(emailSent === false ? t.invitationWarning : ""); }} />}
    {selectedFollowup && followups.some((item) => item.id === selectedFollowup.id) && <FollowupDetailDialog patient={patient} followup={followups.find((item) => item.id === selectedFollowup.id)!} busy={saving} error={error} onClose={() => setSelectedFollowup(null)} onToggle={(notes) => toggleFollowup(selectedFollowup.id, selectedFollowup.status === "completed" ? "scheduled" : "completed", notes)} onCreateMeeting={() => createFollowupMeeting(selectedFollowup)} onDelete={() => deleteFollowup(selectedFollowup)} />}
    {editing && <CreatePatientModal patient={patient} isAdmin={isAdmin} isRomania={isRomania} onClose={() => setEditing(false)} onSuccess={(updated) => { setPatient((current) => ({ ...current, ...updated })); setEditing(false); }} />}
  </div>;
}

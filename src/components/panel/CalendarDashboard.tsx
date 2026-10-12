"use client";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { ScheduleFollowupDialog } from "./ScheduleFollowupDialog";
import { FollowupDetailDialog } from "./FollowupDetailDialog";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { panelTranslations, langToLocale } from "@/lib/i18n/panel-translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { dayLabel, localDateKey } from "@/lib/panel-dates";
import { normalizePatientsFromApi } from "@/lib/api-normalizers";
import type { PatientItem, FollowupItem } from "@/lib/types/patient";

type CalendarEvent = { patient: PatientItem; followup: FollowupItem };
type View = "agenda" | "day" | "week" | "month";
export function CalendarDashboard({ initialPatients, userEmail, userRole, isAdmin, databaseAvailable, pendingRequestsCount = 0 }: {
  initialPatients: PatientItem[]; userEmail: string; userRole?: string; isAdmin?: boolean; databaseAvailable: boolean; pendingRequestsCount?: number;
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const locale = langToLocale[lang];
  const [patients, setPatients] = useState(initialPatients);
  const [view, setView] = useState<View>("agenda");
  const [currentDate, setCurrentDate] = useState(localDateKey());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"scheduled" | "completed" | "all">("scheduled");
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const today = localDateKey();
  const events = patients.flatMap((patient) => (patient.followups || []).map((followup) => ({ patient, followup })))
    .filter((event) => (status === "all" || event.followup.status === status) && `${event.patient.full_name} ${event.followup.title}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => `${a.followup.date} ${a.followup.time || "00:00"}`.localeCompare(`${b.followup.date} ${b.followup.time || "00:00"}`));
  const anchor = new Date(`${currentDate}T12:00:00`);
  const start = new Date(anchor);
  if (view === "week") start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  if (view === "month") { start.setDate(1); start.setDate(start.getDate() - (start.getDay() + 6) % 7); }
  const days = Array.from({ length: view === "month" ? 42 : view === "week" ? 7 : 1 }, (_, index) => { const date = new Date(start); date.setDate(date.getDate() + index); return localDateKey(date); });
  function navigate(direction: number) {
    const date = new Date(anchor);
    if (view === "month") { date.setDate(1); date.setMonth(date.getMonth() + direction); }
    else date.setDate(date.getDate() + direction * (view === "week" ? 7 : 1));
    setCurrentDate(localDateKey(date));
  }
  async function refresh() {
    setBusy(true); setError("");
    try {
      const collected: PatientItem[] = [];
      let page = 1; let more = true;
      while (more) {
        const response = await fetch(`/api/patients?limit=100&page=${page}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        const batch = normalizePatientsFromApi(data.patients); collected.push(...batch);
        more = batch.length === 100; page++;
      }
      setPatients(collected);
    } catch { setError(t.loadError); } finally { setBusy(false); }
  }
  async function updateEvent(event: CalendarEvent, remove = false, completionNotes?: string) {
    if (busy || (remove && !window.confirm(t.deleteConfirm))) return;
    setBusy(true); setError("");
    try {
      if (remove && event.followup.meeting_id) {
        const response = await fetch(`/api/meetings?id=${encodeURIComponent(event.followup.meeting_id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error();
      }
      const next = remove ? (event.patient.followups || []).filter((f) => f.id !== event.followup.id) : (event.patient.followups || []).map((f) => f.id === event.followup.id ? { ...f, status: f.status === "completed" ? "scheduled" as const : "completed" as const, completed_at: f.status === "completed" ? undefined : new Date().toISOString(), completion_notes: f.status === "completed" ? f.completion_notes : completionNotes?.trim() || undefined } : f);
      const response = await fetch("/api/patients", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: event.patient.id, followups: next }) });
      if (!response.ok) throw new Error();
      setPatients((current) => current.map((p) => p.id === event.patient.id ? { ...p, followups: next } : p)); setSelected(null);
    } catch { setError(t.error); } finally { setBusy(false); }
  }
  async function createFollowupMeeting(event: CalendarEvent) {
    if (busy || event.followup.meeting_id) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({ title: event.followup.title, patientId: event.patient.id, followupId: event.followup.id }),
      });
      const data = await response.json() as { error?: string; followup?: FollowupItem; email_sent?: boolean };
      if (!response.ok || !data.followup) throw new Error(data.error || t.error);
      const followups = (event.patient.followups || []).map((item) =>
        item.id === event.followup.id ? data.followup! : item,
      );
      setPatients((current) => current.map((patient) =>
        patient.id === event.patient.id ? { ...patient, followups } : patient,
      ));
      setSelected({ patient: { ...event.patient, followups }, followup: data.followup });
      if (data.email_sent === false) setNotice(t.invitationWarning);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setBusy(false);
    }
  }
  function row(event: CalendarEvent) {
    return <div key={`${event.patient.id}-${event.followup.id}`} className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4"><button className="min-w-0 text-left" onClick={() => setSelected(event)}><p className="text-sm font-medium">{event.followup.title}</p><p className="mt-1 text-sm text-muted-foreground">{event.patient.full_name} · {event.followup.time ? `${event.followup.time} (${event.followup.timezone || ""})` : t.allDay}</p></button><div className="flex gap-2">{event.followup.meeting_id && <Link className="crm-button" href={withLangPrefix(`/panel/patients/${event.patient.id}/meet/${event.followup.meeting_id}`, lang)}>{t.join}</Link>}<button className="crm-button" onClick={() => setSelected(event)}>{t.more}</button></div></div>;
  }
  const dateGroups = [...new Set(events.map((event) => event.followup.date.slice(0, 10)))];
  return <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin} pendingCount={pendingRequestsCount}><main id="main-content" className="crm-page space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">{panelTranslations[lang].adminShell.calendar}</h1><button className="crm-button crm-primary" disabled={!patients.length} onClick={() => setScheduleDate(currentDate)}>{t.schedule}</button></header>
    {!databaseAvailable ? <p className="crm-error">{t.loadError}</p> : <>
      {error && <p role="alert" className="crm-error">{error}</p>}{notice && <p role="status" className="crm-notice">{notice}</p>}
      <div className="flex flex-wrap items-center gap-2"><input className="crm-input max-w-xs" type="search" placeholder={t.searchPatients} aria-label={t.searchPatients} value={search} onChange={(e) => setSearch(e.target.value)} /><select className="crm-input w-auto" aria-label={t.status} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="scheduled">{t.upcoming}</option><option value="completed">{t.completed}</option><option value="all">{t.history}</option></select><div className="ml-auto flex flex-wrap gap-1" aria-label={t.agenda}>{(["agenda", "day", "week", "month"] as const).map((id) => <button key={id} className={`crm-button ${view === id ? "crm-primary" : ""}`} aria-pressed={view === id} onClick={() => setView(id)}>{t[id]}</button>)}</div><button className="crm-button" disabled={busy} onClick={refresh}>{busy ? t.loading : t.refresh}</button></div>
      {view !== "agenda" && <div className="flex flex-wrap items-center gap-2"><button className="crm-button" aria-label={t.previous} onClick={() => navigate(-1)}>←</button><button className="crm-button" onClick={() => setCurrentDate(today)}>{t.today}</button><button className="crm-button" aria-label={t.next} onClick={() => navigate(1)}>→</button><input type="date" aria-label={t.date} className="crm-input w-auto" value={currentDate} onChange={(e) => { if (e.target.value) setCurrentDate(e.target.value); }} /><h2 className="ml-auto text-lg font-medium">{anchor.toLocaleDateString(locale, { month: "long", year: "numeric" })}</h2></div>}
      {view === "agenda" ? <div className="space-y-4">{!events.length && <p className="crm-card text-center text-muted-foreground">{t.empty}</p>}{dateGroups.map((date, index) => <section className="overflow-hidden rounded-lg border border-border bg-white" key={date}>{date < today && (index === 0 || dateGroups[index - 1] >= today) && <p className="px-4 pt-4 text-sm font-semibold text-red-700">{t.overdue}</p>}<h2 className="crm-day-heading">{dayLabel(date, locale, t.today, t.yesterday)}</h2>{events.filter((event) => event.followup.date.slice(0, 10) === date).map(row)}</section>)}</div> : view === "day" ? <section className="rounded-lg border border-border bg-white"><h2 className="crm-day-heading">{dayLabel(currentDate, locale, t.today, t.yesterday)}</h2>{events.filter((event) => event.followup.date.slice(0, 10) === currentDate).map(row)}<button className="crm-button m-4" onClick={() => setScheduleDate(currentDate)}>+ {t.schedule}</button></section> : <div className="overflow-x-auto"><div className="crm-calendar-grid">{days.map((date) => <section className="crm-calendar-cell" key={date}><button className={`crm-button w-full ${date === today ? "crm-primary" : ""}`} onClick={() => setScheduleDate(date)} title={t.schedule}>{new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday: "short", day: "numeric" })}</button>{events.filter((event) => event.followup.date.slice(0, 10) === date).map((event) => <button key={`${event.patient.id}-${event.followup.id}`} className="crm-calendar-event" onClick={() => setSelected(event)}><span className="block truncate font-medium">{event.patient.full_name}</span><span className="block truncate">{event.followup.time || t.allDay} · {event.followup.title}</span></button>)}</section>)}</div></div>}
    </>}
    {scheduleDate && <ScheduleFollowupDialog patients={patients} date={scheduleDate} onClose={() => setScheduleDate(null)} onSaved={(id, followup, emailSent) => { setPatients((current) => current.map((p) => p.id === id ? { ...p, followups: [followup, ...(p.followups || []).filter((f) => f.id !== followup.id)] } : p)); setNotice(emailSent === false ? t.invitationWarning : ""); }} />}
    {selected && <FollowupDetailDialog patient={selected.patient} followup={selected.followup} busy={busy} error={error} onClose={() => setSelected(null)} onToggle={(notes) => updateEvent(selected, false, notes)} onCreateMeeting={() => createFollowupMeeting(selected)} onDelete={() => updateEvent(selected, true)} />}
  </main></AdminShell>;
}

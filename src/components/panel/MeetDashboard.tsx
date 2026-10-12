"use client";
import Link from "next/link";
import { useState } from "react";
import { AdminShell } from "./AdminShell";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel } from "@/lib/panel-dates";
import type { PatientItem } from "@/lib/types/patient";
export type MeetItem = { id: string; title: string; meeting_url: string; transcript: string | null; notes: string | null; patient_id: string | null; followup_id?: string | null; patient_name: string | null; created_at: string };
export function MeetDashboard({ userEmail, userRole, isAdmin, pendingRequestsCount, databaseAvailable, assignedPatients, initialMeetings }: {
  userEmail: string; userRole: string; isAdmin: boolean; pendingRequestsCount: number; databaseAvailable: boolean; assignedPatients: PatientItem[]; initialMeetings: MeetItem[];
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const [patients, setPatients] = useState(assignedPatients);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  function followup(meeting: MeetItem) { return patients.find((p) => p.id === meeting.patient_id)?.followups?.find((f) => f.id === meeting.followup_id || f.meeting_id === meeting.id); }
  const visible = meetings.filter((meeting) => (tab === "upcoming" ? followup(meeting)?.status === "scheduled" : followup(meeting)?.status !== "scheduled") && `${meeting.title} ${meeting.patient_name || ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => tab === "upcoming" ? `${followup(a)?.date || ""} ${followup(a)?.time || ""}`.localeCompare(`${followup(b)?.date || ""} ${followup(b)?.time || ""}`) : b.created_at.localeCompare(a.created_at));
  async function copy(meeting: MeetItem) {
    try { await navigator.clipboard.writeText(meeting.meeting_url); setCopied(meeting.id); }
    catch { setError(t.error); }
  }
  async function remove(meeting: MeetItem) {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const response = await fetch(`/api/meetings?id=${encodeURIComponent(meeting.id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setMeetings((current) => current.filter((m) => m.id !== meeting.id));
      setPatients((current) => current.map((p) => ({ ...p, followups: p.followups?.map((f) => { if (f.meeting_id !== meeting.id) return f; const updated = { ...f }; delete updated.meeting_id; delete updated.meeting_url; delete updated.meeting_notes; delete updated.meeting_transcript; return updated; }) })));
    } catch { setError(t.error); }
  }
  return <AdminShell userEmail={userEmail} userRole={userRole} isAdmin={isAdmin} pendingCount={pendingRequestsCount}><main id="main-content" className="crm-page space-y-5">
    <header><h1 className="text-2xl font-semibold">{t.meetings}</h1></header>
    {!databaseAvailable ? <p role="alert" className="crm-error">{t.loadError}</p> : <>
      {error && <p role="alert" className="crm-error">{error}</p>}
      <input type="search" className="crm-input max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPatients} aria-label={t.searchPatients} />
      <div className="crm-tabs" role="tablist" aria-label={t.meetings}>{(["upcoming", "history"] as const).map((id) => <button key={id} id={`meetings-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls="meeting-list" onClick={() => setTab(id)}>{t[id]}</button>)}</div>
      <section id="meeting-list" role="tabpanel" aria-labelledby={`meetings-tab-${tab}`} className="overflow-hidden rounded-lg border border-border bg-white">
        {!visible.length && <p className="p-8 text-center text-muted-foreground">{t.empty}</p>}
        {visible.map((meeting) => { const appointment = followup(meeting); return <article key={meeting.id} className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center"><div className="min-w-0"><h2 className="text-base font-medium">{meeting.title}</h2><p className="mt-1 text-sm text-muted-foreground">{meeting.patient_name || t.unnamed}</p><p className="mt-2 text-xs text-muted-foreground">{appointment ? followupLabel(appointment, langToLocale[lang], t.allDay) : new Date(meeting.created_at).toLocaleDateString(langToLocale[lang])}</p></div><div className="flex flex-wrap gap-2">{meeting.patient_id ? <Link className="crm-button crm-primary" href={withLangPrefix(`/panel/patients/${meeting.patient_id}/meet/${meeting.id}`, lang)}>{t.join}</Link> : <a className="crm-button crm-primary" href={meeting.meeting_url} target="_blank" rel="noreferrer">{t.join}</a>}<button className="crm-button" onClick={() => copy(meeting)}>{copied === meeting.id ? t.copied : t.copyLink}</button><details className="crm-menu"><summary className="crm-button">{t.more}</summary><div>{meeting.patient_id && <Link href={withLangPrefix(`/panel/patients/${meeting.patient_id}`, lang)}>{t.openPatient}</Link>}<button onClick={() => remove(meeting)}>{t.delete}</button></div></details></div></article>; })}
      </section>
    </>}
  </main></AdminShell>;
}

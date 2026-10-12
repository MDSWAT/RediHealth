"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { dayLabel, requestDay } from "@/lib/panel-dates";
import { requestFolders, type InboxPage, type RequestFolder } from "@/lib/request-inbox";
import type { MedicalHelpRequestItem, RequestPriority, RequestStatus } from "@/lib/types/medical-request";
import { CreatePatientModal } from "./CreatePatientModal";
import { QuickTemplatesModal } from "./QuickTemplatesModal";
import { useUnsavedChanges } from "./useUnsavedChanges";

export function RequestsInbox({ initialInbox, onPendingChange, isAdmin = false }: { isAdmin?: boolean; initialInbox: InboxPage; onPendingChange: (count: number) => void }) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const locale = langToLocale[lang];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const folder = requestFolders.includes(searchParams.get("folder") as RequestFolder) ? searchParams.get("folder") as RequestFolder : "attention";
  const requestId = searchParams.get("request") || "";
  const [inbox, setInbox] = useState(initialInbox);
  const [detached, setDetached] = useState<MedicalHelpRequestItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [draftVersion, setDraftVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState(false);
  const [creating, setCreating] = useState<MedicalHelpRequestItem | null>(null);
  const [replying, setReplying] = useState<MedicalHelpRequestItem | null>(null);
  const fetchVersion = useRef(0);
  const query = new URLSearchParams(searchParams.toString());
  query.delete("request"); query.set("folder", folder); query.set("limit", "50"); query.delete("page");
  const queryString = query.toString();
  const selected = inbox.requests.find((r) => r.id === requestId) || (detached?.id === requestId ? detached : null);
  useUnsavedChanges(dirty, t.unsaved);
  function updateUrl(changes: Record<string, string>, replace = false, confirmed = false) {
    if (!confirmed && dirty && !window.confirm(t.unsaved)) return;
    if (selected) setDetached(selected);
    if ("request" in changes && changes.request !== requestId) setDirty(false);
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) { if (value) params.set(key, value); else params.delete(key); }
    const url = `${pathname}${params.size ? `?${params}` : ""}`;
    if (replace) window.history.replaceState(null, "", url); else window.history.pushState(null, "", url);
  }
  useEffect(() => {
    const controller = new AbortController();
    const version = ++fetchVersion.current;
    const timeout = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const response = await fetch(`/api/medical-help-requests?${queryString}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json() as InboxPage;
        if (fetchVersion.current === version) { setInbox(data); onPendingChange(data.counts.pending); }
      } catch { if (!controller.signal.aborted) setError(t.loadError); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [queryString, refreshKey, onPendingChange, t.loadError]);
  useEffect(() => {
    if (!requestId || selected) return;
    const controller = new AbortController();
    void fetch(`/api/medical-help-requests?id=${encodeURIComponent(requestId)}&folder=all`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<InboxPage>; })
      .then((data) => { if (!controller.signal.aborted) { setDetached(data.requests[0] || null); if (!data.requests[0]) setError(t.loadError); } })
      .catch(() => { if (!controller.signal.aborted) setError(t.loadError); });
    return () => controller.abort();
  }, [requestId, selected, t.loadError]);
  async function loadMore() {
    if (loading) return;
    const version = fetchVersion.current;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/medical-help-requests?${queryString}&page=${inbox.page + 1}`);
      if (!response.ok) throw new Error();
      const data = await response.json() as InboxPage;
      if (fetchVersion.current === version) setInbox((current) => ({ ...data, requests: [...current.requests, ...data.requests.filter((r) => !current.requests.some((existing) => existing.id === r.id))] }));
    } catch { if (fetchVersion.current === version) setError(t.loadError); }
    finally { if (fetchVersion.current === version) setLoading(false); }
  }
  function exportCsv() {
    const quote = (value: string) => `"${(/^[=+@-]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
    const csv = ["Name,Phone,Email,Description,Status,Received", ...inbox.requests.map((r) => [r.full_name || "", r.phone, r.email, r.description, r.status, r.created_at].map(quote).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "redihealth-requests.csv"; link.click(); URL.revokeObjectURL(url);
  }
  function updateRequest(updated: MedicalHelpRequestItem) {
    setDirty(false); setDetached(updated);
    setInbox((current) => ({ ...current, requests: current.requests.map((r) => r.id === updated.id ? updated : r) }));
    setRefreshKey((key) => key + 1);
  }
  return <>
    <header className="crm-inbox-toolbar"><h1 className="text-xl font-semibold">{t.requests}</h1><input type="search" className="crm-input max-w-md" aria-label={t.search} placeholder={t.search} value={searchParams.get("q") || ""} onChange={(e) => updateUrl({ q: e.target.value }, true)} /><button className="crm-button" onClick={() => setFilters(!filters)} aria-expanded={filters}>{t.filters}</button><details className="crm-menu"><summary className="crm-button">{t.more}</summary><div><button onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}>{t.refresh}</button><button onClick={exportCsv} disabled={!inbox.requests.length}>{t.export}</button></div></details></header>
    {filters && <div className="crm-filter-row"><label>{t.priority}<select className="crm-input" value={searchParams.get("priority") || ""} onChange={(e) => updateUrl({ priority: e.target.value })}><option value="">{t.all}</option><option value="urgent">{t.urgent}</option></select></label><label>{t.from}<input type="date" className="crm-input" value={searchParams.get("from") || ""} onChange={(e) => updateUrl({ from: e.target.value })} /></label><label>{t.to}<input type="date" className="crm-input" value={searchParams.get("to") || ""} onChange={(e) => updateUrl({ to: e.target.value })} /></label><button className="crm-button" onClick={() => updateUrl({ q: "", priority: "", from: "", to: "" })}>{t.clear}</button></div>}
    {error && <p className="crm-error mx-4" role="alert">{error}</p>}
    <div className="crm-inbox-grid">
      <nav className="crm-folders" aria-label={t.requests}>{requestFolders.map((id) => <button key={id} className={folder === id ? "active" : ""} aria-current={folder === id ? "page" : undefined} onClick={() => updateUrl({ folder: id, request: "" })}><span>{t[id]}</span><span>{inbox.counts[id]}</span></button>)}</nav>
      <section className="crm-request-list" aria-label={t.requests} aria-busy={loading}>
        {!inbox.requests.length && <p className="p-8 text-center text-muted-foreground">{loading ? t.loading : t.empty}</p>}
        {inbox.requests.map((r, index) => {
          const key = requestDay(r.created_at);
          const heading = index === 0 || key !== requestDay(inbox.requests[index - 1].created_at);
          return <div key={r.id}>{heading && <h2 className="crm-day-heading">{dayLabel(key, locale, t.today, t.yesterday)}</h2>}<button className={`crm-request-row ${requestId === r.id ? "selected" : ""}`} onClick={() => updateUrl({ request: r.id })} aria-pressed={requestId === r.id}><div className="flex justify-between gap-3"><span className="truncate font-semibold">{r.full_name || t.unnamed}</span><time className="shrink-0 text-xs text-muted-foreground" dateTime={r.created_at}>{new Date(r.created_at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</time></div><p className="mt-1 truncate text-sm text-muted-foreground">{r.description}</p><div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><span>{t[r.status]}</span>{r.priority === "urgent" && <span className="crm-urgent">{t.urgent}</span>}</div></button></div>;
        })}
        {inbox.hasMore && <div className="p-4 text-center"><button className="crm-button" disabled={loading} onClick={loadMore}>{loading ? t.loading : t.loadMore}</button></div>}
      </section>
      <section className={`crm-reading-pane ${requestId ? "is-open" : ""}`} aria-label={t.selectRequest}>
        {selected ? <RequestReader key={`${selected.id}-${draftVersion}`} request={selected} onDirtyChange={setDirty} onUpdate={updateRequest} onBack={() => updateUrl({ request: "" })} onCreate={() => { if (!dirty || window.confirm(t.unsaved)) { setDirty(false); setDraftVersion((version) => version + 1); setCreating(selected); } }} onReply={() => setReplying(selected)} onDelete={async () => {
          const response = await fetch(`/api/medical-help-requests?id=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
          if (!response.ok) throw new Error();
          setDirty(false); updateUrl({ request: "" }, false, true); setRefreshKey((key) => key + 1);
        }} /> : <p className="m-auto p-10 text-center text-muted-foreground">{requestId ? t.loading : t.selectRequest}</p>}
      </section>
    </div>
    {creating && <CreatePatientModal isAdmin={isAdmin} request={creating} onClose={() => setCreating(null)} />}
    {replying && <QuickTemplatesModal request={replying} onClose={() => setReplying(null)} />}
  </>;
}

function RequestReader({ request, onDirtyChange, onUpdate, onBack, onCreate, onReply, onDelete }: {
  request: MedicalHelpRequestItem; onDirtyChange: (value: boolean) => void; onUpdate: (request: MedicalHelpRequestItem) => void; onBack: () => void; onCreate: () => void; onReply: () => void; onDelete: () => Promise<void>;
}) {
  const { lang } = useLanguage();
  const t = crmTranslations[lang];
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [priority, setPriority] = useState<RequestPriority>(request.priority);
  const [notes, setNotes] = useState(request.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = status !== request.status || priority !== request.priority || notes !== (request.internal_notes || "");
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  async function save() {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/medical-help-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: request.id, status, priority, internal_notes: notes.trim() || null }) });
      const data = await response.json() as { request?: Partial<MedicalHelpRequestItem>; error?: string };
      if (!response.ok) { setError(data.error || t.error); return; }
      setNotes(notes.trim()); onUpdate({ ...request, ...data.request, status, priority, internal_notes: notes.trim() || null });
    } catch { setError(t.error); } finally { setSaving(false); }
  }
  return <div className="crm-reader-content">
    <div className="flex items-center justify-between"><button className="crm-button crm-reader-back" onClick={onBack}>{t.back}</button><span className="text-xs text-muted-foreground">#{request.id} · {new Date(request.created_at).toLocaleString(langToLocale[lang])}</span><details className="crm-menu"><summary className="crm-button">{t.more}</summary><div><button disabled={saving} onClick={async () => { if (!window.confirm(t.deleteConfirm)) return; setSaving(true); try { await onDelete(); } catch { setError(t.error); setSaving(false); } }}>{t.delete}</button></div></details></div>
    <h2 className="mt-6 text-2xl font-semibold">{request.full_name || t.unnamed}</h2>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><a className="text-primary" href={`tel:${request.phone}`}>{request.phone}</a>{request.email && <a className="break-all text-primary" href={`mailto:${request.email}`}>{request.email}</a>}</div>
    <p className="my-7 whitespace-pre-wrap text-base leading-relaxed">{request.description}</p>
    <div className="mb-6 flex flex-wrap gap-2">{request.patient_id ? <Link className="crm-button crm-primary" href={withLangPrefix(`/panel/patients/${request.patient_id}`, lang)}>{t.openPatient}</Link> : <button className="crm-button crm-primary" onClick={onCreate}>{t.createPatient}</button>}<button className="crm-button" disabled={!request.email} onClick={onReply}>{t.reply}</button></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="crm-label">{t.status}<select className="crm-input" value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} disabled={saving}>{(["pending", "in_progress", "resolved", "archived"] as const).map((id) => <option value={id} key={id}>{t[id]}</option>)}</select></label><label className="crm-label">{t.priority}<select className="crm-input" value={priority} onChange={(e) => setPriority(e.target.value as RequestPriority)} disabled={saving}><option value="normal">{t.normal}</option><option value="urgent">{t.urgent}</option></select></label></div>
    <label className="crm-label mt-5">{t.notes}<textarea rows={5} maxLength={4000} className="crm-input" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} /></label>
    {error && <p className="crm-error mt-3" role="alert">{error}</p>}
    <div className="mt-5 flex items-center gap-3"><button className="crm-button crm-primary" disabled={!dirty || saving} onClick={save}>{saving ? t.saving : t.save}</button>{!dirty && <span className="text-sm text-muted-foreground" role="status">{t.saved}</span>}</div>
  </div>;
}

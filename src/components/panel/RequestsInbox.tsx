"use client";
import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { panelWorkspaceTranslations } from "@/lib/i18n/panel-workspace-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { dayLabel } from "@/lib/panel-dates";
import { inboxDay, inboxTimestamp } from "@/lib/request-inbox-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import { requestFolders, type InboxPage, type RequestFolder } from "@/lib/request-inbox";
import type { MedicalHelpRequestItem, RequestPriority, RequestStatus } from "@/lib/types/medical-request";
import { CreatePatientModal } from "./CreatePatientModal";
import { QuickTemplatesModal } from "./QuickTemplatesModal";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { csvTimestamp, downloadCsv } from "./panel-csv";
import { ChevronLeftIcon, FileTextIcon, SearchIcon, FilterIcon, RefreshIcon } from "@/components/ui/icons";

export function RequestsInbox({ initialInbox, onPendingChange, isAdmin = false, isRomania }: { isAdmin?: boolean; isRomania: boolean; initialInbox: InboxPage; onPendingChange: (count: number) => void }) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const copy = panelWorkspaceTranslations[lang];
  const locale = langToLocale[lang];
  const localizedDates = useViewerTimeZone() !== null;
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
  const hasFilters = ["q", "priority", "from", "to"].some((key) => Boolean(searchParams.get(key)));
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
        if (fetchVersion.current === version) { setInbox(data); onPendingChange(data.counts.attention); }
      } catch { if (!controller.signal.aborted) setError(t.loadError); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [queryString, refreshKey, onPendingChange, t.loadError, fetch]);
  useEffect(() => {
    if (!requestId || selected) return;
    const controller = new AbortController();
    void fetch(`/api/medical-help-requests?id=${encodeURIComponent(requestId)}&folder=all`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json() as Promise<InboxPage>; })
      .then((data) => { if (!controller.signal.aborted) { setDetached(data.requests[0] || null); if (!data.requests[0]) setError(t.loadError); } })
      .catch(() => { if (!controller.signal.aborted) setError(t.loadError); });
    return () => controller.abort();
  }, [requestId, selected, t.loadError, fetch]);
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
    const header = [t.csvName, t.csvPhone, t.csvEmail, t.csvCounty, t.csvRequest, t.status, t.csvReceived];
    downloadCsv("redihealth-requests.csv", header, inbox.requests.map((r) => [r.full_name || "", r.phone, r.email, r.county || "", r.description, t[r.status], csvTimestamp(r.created_at)]));
  }
  function updateRequest(updated: MedicalHelpRequestItem) {
    setDirty(false); setDetached(updated);
    setInbox((current) => ({ ...current, requests: current.requests.map((r) => r.id === updated.id ? updated : r) }));
    setRefreshKey((key) => key + 1);
  }
  return <section className="panel-inbox" aria-labelledby="panel-inbox-title">
    <header className="crm-inbox-toolbar">
      <div className="panel-inbox-title"><h2 id="panel-inbox-title">{t.requests}<span>{inbox.counts.all.toLocaleString(locale)}</span></h2><p>{copy.inboxHint}</p></div>
      <div className="panel-inbox-controls">
        <label className="panel-request-search"><SearchIcon className="h-4 w-4" aria-hidden="true" /><input type="search" className="crm-input" aria-label={t.search} placeholder={t.search} value={searchParams.get("q") || ""} onChange={(e) => updateUrl({ q: e.target.value }, true)} /></label>
        <button className="crm-button" onClick={() => setFilters(!filters)} aria-expanded={filters} aria-controls="panel-request-filters"><FilterIcon className="h-4 w-4" aria-hidden="true" /><span>{t.filters}</span>{hasFilters && <span className="panel-filter-indicator" />}</button>
        <button className="crm-button panel-refresh" onClick={() => setRefreshKey((key) => key + 1)} disabled={loading} aria-label={t.refresh} title={t.refresh}><RefreshIcon className="h-4 w-4" aria-hidden="true" /></button>
        <details className="crm-menu"><summary className="crm-button">{t.more}</summary><div><button onClick={exportCsv} disabled={!inbox.requests.length}>{t.export}</button></div></details>
      </div>
    </header>
    {filters && <div id="panel-request-filters" className="crm-filter-row"><label>{t.priority}<select className="crm-input" value={searchParams.get("priority") || ""} onChange={(e) => updateUrl({ priority: e.target.value })}><option value="">{t.all}</option><option value="urgent">{t.urgent}</option></select></label><label>{t.from}<input type="date" className="crm-input" value={searchParams.get("from") || ""} onChange={(e) => updateUrl({ from: e.target.value })} /></label><label>{t.to}<input type="date" className="crm-input" value={searchParams.get("to") || ""} onChange={(e) => updateUrl({ to: e.target.value })} /></label><button className="crm-button" onClick={() => updateUrl({ q: "", priority: "", from: "", to: "" })}>{t.clear}</button></div>}
    {error && <p className="crm-error mx-4" role="alert">{error}</p>}
    <nav className="crm-folders" aria-label={t.requests}>{requestFolders.map((id) => <button key={id} className={folder === id ? "active" : ""} aria-current={folder === id ? "page" : undefined} onClick={() => updateUrl({ folder: id, request: "" })}><span>{t[id]}</span><span>{inbox.counts[id].toLocaleString(locale)}</span></button>)}</nav>
    <div className="crm-inbox-grid">
      <section className="crm-request-list" aria-label={t.requests} aria-busy={loading}>
        {!inbox.requests.length && <div className="panel-list-empty" role="status"><SearchIcon className="h-6 w-6" aria-hidden="true" /><h3>{loading ? t.loading : t.empty}</h3>{!loading && <><p>{copy.emptyHint}</p>{hasFilters && <button className="crm-button" onClick={() => updateUrl({ q: "", priority: "", from: "", to: "" })}>{t.clear}</button>}</>}</div>}
        {inbox.requests.map((r, index) => {
          const key = inboxDay(r.created_at, localizedDates);
          const heading = index === 0 || key !== inboxDay(inbox.requests[index - 1].created_at, localizedDates);
          return <div key={r.id}>{heading && <h3 className="crm-day-heading">{(localizedDates ? dayLabel(key, locale, t.today, t.yesterday) : key || "—")}</h3>}<button className={`crm-request-row ${requestId === r.id ? "selected" : ""}`} onClick={() => updateUrl({ request: r.id })} aria-pressed={requestId === r.id}><div className="panel-request-identity"><span className="panel-request-avatar" aria-hidden="true">{(r.full_name || t.unnamed).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><span className="truncate font-semibold">{r.full_name || t.unnamed}</span><time className="shrink-0 text-xs text-muted-foreground" dateTime={r.created_at}>{inboxTimestamp(r.created_at, locale, "time", localizedDates)}</time></div><p className="panel-request-description">{r.description}</p><div className="panel-request-meta"><span className="panel-request-status" data-status={r.status}>{t[r.status]}</span>{r.priority === "urgent" && <span className="crm-urgent">{t.urgent}</span>}</div></div></div></button></div>;
        })}
        {inbox.hasMore && <div className="p-4 text-center"><button className="crm-button" disabled={loading} onClick={loadMore}>{loading ? t.loading : t.loadMore}</button></div>}
      </section>
      <section className={`crm-reading-pane ${requestId ? "is-open" : ""}`} aria-label={t.selectRequest}>
        {selected ? <RequestReader key={`${selected.id}-${draftVersion}`} request={selected} onDirtyChange={setDirty} onUpdate={updateRequest} onBack={() => updateUrl({ request: "" })} onCreate={() => { if (!dirty || window.confirm(t.unsaved)) { setDirty(false); setDraftVersion((version) => version + 1); setCreating(selected); } }} onReply={() => setReplying(selected)} onDelete={async () => {
          const response = await fetch(`/api/medical-help-requests?id=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
          if (!response.ok) throw new Error();
          setDirty(false); updateUrl({ request: "" }, false, true); setRefreshKey((key) => key + 1);
        }} /> : <div className="panel-reader-empty"><FileTextIcon className="panel-reader-empty-icon" aria-hidden="true" /><h3>{requestId ? t.loading : t.selectRequest}</h3><p>{copy.selectionHint}</p></div>}
      </section>
    </div>
    {creating && <CreatePatientModal isAdmin={isAdmin} isRomania={isRomania} request={creating} onClose={() => setCreating(null)} />}
    {replying && <QuickTemplatesModal request={replying} onClose={() => setReplying(null)} />}
  </section>;
}

function RequestReader({ request, onDirtyChange, onUpdate, onBack, onCreate, onReply, onDelete }: {
  request: MedicalHelpRequestItem; onDirtyChange: (value: boolean) => void; onUpdate: (request: MedicalHelpRequestItem) => void; onBack: () => void; onCreate: () => void; onReply: () => void; onDelete: () => Promise<void>;
}) {
  const { lang } = useLanguage();
  const localizedDates = useViewerTimeZone() !== null;
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [priority, setPriority] = useState<RequestPriority>(request.priority);
  const [notes, setNotes] = useState(request.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = status !== request.status || priority !== request.priority || notes !== (request.internal_notes || "");
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  async function save(nextStatus = status) {
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/medical-help-requests", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: request.id, status: nextStatus, priority, internal_notes: notes.trim() || null }) });
      const data = await response.json() as { request?: Partial<MedicalHelpRequestItem>; error?: string };
      if (!response.ok) { setError(data.error || t.error); return; }
      setStatus(nextStatus); setNotes(notes.trim()); onUpdate({ ...request, ...data.request, status: nextStatus, priority, internal_notes: notes.trim() || null });
    } catch { setError(t.error); } finally { setSaving(false); }
  }
  return <div className="crm-reader-content">
    <div className="flex items-center justify-between"><button className="crm-reader-back inline-flex min-h-10 items-center gap-1 rounded-lg pr-2 text-sm font-medium text-primary" onClick={onBack}><ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />{t.back}</button><span className="text-xs text-muted-foreground">#{request.id} · {inboxTimestamp(request.created_at, langToLocale[lang], "dateTime", localizedDates)}</span><details className="crm-menu"><summary className="crm-button">{t.more}</summary><div><button disabled={saving} onClick={async () => { if (!window.confirm(t.deleteConfirm)) return; setSaving(true); try { await onDelete(); } catch { setError(t.error); setSaving(false); } }}>{t.delete}</button></div></details></div>
    <h2 className="mt-6 text-2xl font-semibold">{request.full_name || t.unnamed}</h2>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm"><a className="text-primary" href={`tel:${request.phone}`}>{request.phone}</a>{request.email && <a className="break-all text-primary" href={`mailto:${request.email}`}>{request.email}</a>}{request.county && <span className="text-muted-foreground">{request.county}</span>}</div>
    <p className="my-7 whitespace-pre-wrap text-base leading-relaxed">{request.description}</p>
    <div className="mb-6 flex flex-wrap gap-2">{request.patient_id ? <Link className="crm-button crm-primary" href={withLangPrefix(`/panel/patients/${request.patient_id}`, lang)}>{t.openPatient}</Link> : <button className="crm-button crm-primary" onClick={onCreate}>{t.createPatient}</button>}<button className="crm-button" disabled={!request.email} onClick={onReply}>{t.reply}</button></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="crm-label">{t.status}<select className="crm-input" value={status} onChange={(e) => setStatus(e.target.value as RequestStatus)} disabled={saving}>{(["pending", "in_progress", "resolved", "archived"] as const).map((id) => <option value={id} key={id}>{t[id]}</option>)}</select></label><label className="crm-label">{t.priority}<select className="crm-input" value={priority} onChange={(e) => setPriority(e.target.value as RequestPriority)} disabled={saving}><option value="normal">{t.normal}</option><option value="urgent">{t.urgent}</option></select></label></div>
    <label className="crm-label mt-5">{t.notes}<textarea rows={5} maxLength={4000} className="crm-input" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} /></label>
    {error && <p className="crm-error mt-3" role="alert">{error}</p>}
    <div className="mt-5 flex flex-wrap items-center gap-3"><button className="crm-button crm-primary" disabled={!dirty || saving} onClick={() => void save()}>{saving ? t.saving : t.save}</button>{status !== "resolved" && status !== "archived" && <button className="crm-button" disabled={saving} onClick={() => { if (window.confirm(t.closeRequestConfirm)) void save("resolved"); }}>{t.closeRequest}</button>}{!dirty && <span className="text-sm text-muted-foreground" role="status">{t.saved}</span>}</div>
  </div>;
}

"use client";
import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/translations";
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
import { ChevronLeftIcon, SearchIcon, FilterIcon, RefreshIcon } from "@/components/ui/icons";

const STATUS_TONE: Record<RequestStatus, string> = {
  pending: "font-medium text-[#9a4d0b] dark:text-[#f5c58e]",
  in_progress: "font-medium text-primary dark:text-[#bad7fa]",
  resolved: "font-normal text-[var(--panel-muted)]",
  archived: "font-normal text-[var(--panel-muted)]",
};

type InboxEmptyCopy = {
  noRequestsTitle: string;
  noRequestsHint: string;
  noPendingTitle: string;
  emptyFolderTitle: string;
  otherFolderHint: string;
};

const INBOX_EMPTY_COPY: Record<Lang, InboxEmptyCopy> = {
  en: {
    noRequestsTitle: "No requests yet",
    noRequestsHint: "New medical help requests will appear here as soon as they arrive.",
    noPendingTitle: "No pending requests",
    emptyFolderTitle: "Nothing in this folder",
    otherFolderHint: "Switch to another folder to review existing requests.",
  },
  ro: {
    noRequestsTitle: "Nicio solicitare încă",
    noRequestsHint: "Solicitările noi de ajutor medical vor apărea aici imediat ce sosesc.",
    noPendingTitle: "Nicio solicitare în așteptare",
    emptyFolderTitle: "Nimic în acest dosar",
    otherFolderHint: "Deschide alt dosar pentru a vedea solicitările existente.",
  },
  sq: {
    noRequestsTitle: "Ende asnjë kërkesë",
    noRequestsHint: "Kërkesat e reja për ndihmë mjekësore do të shfaqen këtu sapo të mbërrijnë.",
    noPendingTitle: "Asnjë kërkesë në pritje",
    emptyFolderTitle: "Asgjë në këtë dosje",
    otherFolderHint: "Zgjidh një dosje tjetër për të parë kërkesat ekzistuese.",
  },
  it: {
    noRequestsTitle: "Nessuna richiesta al momento",
    noRequestsHint: "Le nuove richieste di assistenza medica appariranno qui appena arrivano.",
    noPendingTitle: "Nessuna richiesta in attesa",
    emptyFolderTitle: "Nessuna richiesta in questa cartella",
    otherFolderHint: "Passa a un'altra cartella per consultare le richieste esistenti.",
  },
  hr: {
    noRequestsTitle: "Još nema zahtjeva",
    noRequestsHint: "Novi zahtjevi za medicinsku pomoć pojavit će se ovdje čim stignu.",
    noPendingTitle: "Nema zahtjeva na čekanju",
    emptyFolderTitle: "Nema zahtjeva u ovoj mapi",
    otherFolderHint: "Odaberi drugu mapu za pregled postojećih zahtjeva.",
  },
  rom: {
    noRequestsTitle: "Inke naj mangimata",
    noRequestsHint: "Neve mangimata vash sastipnasko zhutimos ka sikadyon kathe kana aven.",
    noPendingTitle: "Naj mangimata so uzharen",
    emptyFolderTitle: "Khanchi and-akava dosaro",
    otherFolderHint: "Alosar aver dosaro te dikhes le mangimata so isi.",
  },
  ru: {
    noRequestsTitle: "Запросов пока нет",
    noRequestsHint: "Новые запросы на медицинскую помощь появятся здесь сразу после поступления.",
    noPendingTitle: "Нет ожидающих запросов",
    emptyFolderTitle: "В этой папке пусто",
    otherFolderHint: "Откройте другую папку, чтобы просмотреть существующие запросы.",
  },
};

function requestInitials(name: string | null | undefined, fallback: string): string {
  return (name || fallback)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0] || "")
    .join("")
    .toUpperCase();
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable || Boolean(target.closest('[contenteditable="true"]'));
}

function ActionMenu({ label, children }: { label: string; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (detailsRef.current?.open && event.target instanceof Node && !detailsRef.current.contains(event.target)) {
        detailsRef.current.open = false;
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && detailsRef.current?.open) {
        event.preventDefault();
        event.stopPropagation();
        detailsRef.current.open = false;
        detailsRef.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  return (
    <details ref={detailsRef} className="crm-menu">
      <summary className="crm-button whitespace-nowrap">{label}</summary>
      <div
        onClick={(event) => {
          if (event.target instanceof HTMLElement && event.target.closest("button, a") && detailsRef.current) {
            detailsRef.current.open = false;
          }
        }}
      >
        {children}
      </div>
    </details>
  );
}

export function RequestsInbox({ initialInbox, onPendingChange, isAdmin = false, isRomania, actions }: {
  isAdmin?: boolean; isRomania: boolean; initialInbox: InboxPage; onPendingChange: (count: number) => void; actions?: ReactNode;
}) {
  const { lang } = useLanguage();
  const { request: fetch, demo, offline } = usePanelRuntime();
  const t = crmTranslations[lang];
  const copy = panelWorkspaceTranslations[lang];
  const emptyCopy = INBOX_EMPTY_COPY[lang];
  const locale = langToLocale[lang];
  const localizedDates = useViewerTimeZone() !== null;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const folder = requestFolders.includes(searchParams.get("folder") as RequestFolder)
    ? (searchParams.get("folder") as RequestFolder)
    : "attention";
  const requestId = searchParams.get("request") || "";
  const [inbox, setInbox] = useState(initialInbox);
  const [detached, setDetached] = useState<MedicalHelpRequestItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [draftVersion, setDraftVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState(() => Boolean(searchParams.get("priority") || searchParams.get("from") || searchParams.get("to")));
  const [creating, setCreating] = useState<MedicalHelpRequestItem | null>(null);
  const [replying, setReplying] = useState<MedicalHelpRequestItem | null>(null);
  const fetchVersion = useRef(0);
  const didMountLive = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const query = new URLSearchParams(searchParams.toString());
  query.delete("request");
  query.set("folder", folder);
  query.set("limit", "50");
  query.delete("page");
  const queryString = query.toString();

  const selected = inbox.requests.find((r) => r.id === requestId) || (detached?.id === requestId ? detached : null);
  const activePanelFilterCount = ["priority", "from", "to"].filter((key) => Boolean(searchParams.get(key))).length;
  const hasFilters = Boolean(searchParams.get("q")) || activePanelFilterCount > 0;

  useUnsavedChanges(dirty, t.unsaved);

  const updateUrl = useCallback((changes: Record<string, string>, replace = false, confirmed = false) => {
    const leavesSelectedRequest = "request" in changes && changes.request !== requestId;
    if (!confirmed && dirty && leavesSelectedRequest && !window.confirm(t.unsaved)) return;
    if (selected) setDetached(selected);
    if (leavesSelectedRequest) setDirty(false);
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const url = `${pathname}${params.size ? `?${params}` : ""}`;
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  }, [dirty, pathname, requestId, searchParams, selected, setDetached, setDirty, t.unsaved]);

  const clearFilters = useCallback(() => {
    updateUrl({ q: "", priority: "", from: "", to: "" });
  }, [updateUrl]);

  useEffect(() => {
    if (!demo && !offline && !didMountLive.current) {
      didMountLive.current = true;
      return;
    }
    didMountLive.current = true;
    const controller = new AbortController();
    const version = ++fetchVersion.current;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/medical-help-requests?${queryString}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = (await response.json()) as InboxPage;
        if (fetchVersion.current === version) {
          setInbox(data);
          onPendingChange(data.counts.attention);
        }
      } catch {
        if (!controller.signal.aborted) setError(t.loadError);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [queryString, refreshKey, onPendingChange, t.loadError, fetch, demo, offline]);

  useEffect(() => {
    if (!requestId || selected) return;
    const controller = new AbortController();
    void fetch(`/api/medical-help-requests?id=${encodeURIComponent(requestId)}&folder=all`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<InboxPage>;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetached(data.requests[0] || null);
          if (!data.requests[0]) setError(t.loadError);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(t.loadError);
      });
    return () => controller.abort();
  }, [requestId, selected, t.loadError, fetch]);

  // Keyboard triage: / focuses search, j/k moves across requests, Escape closes reader.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (creating || replying || event.metaKey || event.ctrlKey || event.altKey) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (isEditableTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "Escape" && requestId) {
        event.preventDefault();
        updateUrl({ request: "" });
        return;
      }

      if ((event.key === "j" || event.key === "k") && inbox.requests.length > 0) {
        event.preventDefault();
        const currentIndex = inbox.requests.findIndex((item) => item.id === requestId);
        const nextIndex =
          event.key === "j"
            ? currentIndex < 0
              ? 0
              : Math.min(currentIndex + 1, inbox.requests.length - 1)
            : currentIndex <= 0
              ? 0
              : currentIndex - 1;
        const target = inbox.requests[nextIndex];
        if (target && target.id !== requestId) updateUrl({ request: target.id });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [creating, replying, requestId, inbox.requests, updateUrl]);

  async function loadMore() {
    if (loading) return;
    const version = fetchVersion.current;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/medical-help-requests?${queryString}&page=${inbox.page + 1}`);
      if (!response.ok) throw new Error();
      const data = (await response.json()) as InboxPage;
      if (fetchVersion.current === version) {
        setInbox((current) => ({
          ...data,
          requests: [...current.requests, ...data.requests.filter((r) => !current.requests.some((existing) => existing.id === r.id))],
        }));
      }
    } catch {
      if (fetchVersion.current === version) setError(t.loadError);
    } finally {
      if (fetchVersion.current === version) setLoading(false);
    }
  }

  function exportCsv() {
    const header = [t.csvName, t.csvPhone, t.csvEmail, t.csvCounty, t.csvRequest, t.status, t.csvReceived];
    downloadCsv(
      "redihealth-requests.csv",
      header,
      inbox.requests.map((r) => [r.full_name || "", r.phone, r.email, r.county || "", r.description, t[r.status], csvTimestamp(r.created_at)]),
    );
  }

  function updateRequest(updated: MedicalHelpRequestItem) {
    setDirty(false);
    setDetached(updated);
    setInbox((current) => ({ ...current, requests: current.requests.map((r) => (r.id === updated.id ? updated : r)) }));
    setRefreshKey((key) => key + 1);
  }

  return (
    <section className={`panel-inbox ${requestId ? "has-selection" : ""}`} aria-label={t.requests}>
      <header className="crm-inbox-toolbar">
        <div className="panel-inbox-controls">
          <label className="panel-request-search">
            <SearchIcon className="h-4 w-4" aria-hidden="true" />
            <input
              ref={searchInputRef}
              type="search"
              className="crm-input"
              aria-label={t.search}
              placeholder={t.search}
              value={searchParams.get("q") || ""}
              onChange={(e) => updateUrl({ q: e.target.value }, true)}
            />
          </label>
          <button
            type="button"
            className="crm-button whitespace-nowrap"
            onClick={() => setFilters(!filters)}
            aria-expanded={filters}
            aria-controls="panel-request-filters"
          >
            <FilterIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t.filters}</span>
            {activePanelFilterCount > 0 && (
              <span className="font-display font-semibold tabular-nums text-primary dark:text-[#bad7fa]">
                {activePanelFilterCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="crm-button panel-refresh min-w-11 whitespace-nowrap"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            aria-label={t.refresh}
            title={t.refresh}
          >
            <RefreshIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          </button>
          <ActionMenu label={t.more}>
            <button
              type="button"
              className="min-h-11 whitespace-nowrap"
              onClick={exportCsv}
              disabled={!inbox.requests.length}
            >
              {t.export}
            </button>
          </ActionMenu>
        </div>
        {actions && (
          <div className="flex shrink-0 items-center [&_.panel-create-patient]:!ml-0">
            {actions}
          </div>
        )}
      </header>

      {filters && (
        <div id="panel-request-filters" className="crm-filter-row">
          <label className="crm-label">
            {t.priority}
            <select
              className="crm-input whitespace-nowrap dark:!border-[var(--panel-line)]"
              value={searchParams.get("priority") || ""}
              onChange={(e) => updateUrl({ priority: e.target.value })}
            >
              <option value="">{t.all}</option>
              <option value="urgent">{t.urgent}</option>
            </select>
          </label>
          <label className="crm-label">
            {t.from}
            <input
              type="date"
              className="crm-input dark:!border-[var(--panel-line)]"
              value={searchParams.get("from") || ""}
              onChange={(e) => updateUrl({ from: e.target.value })}
            />
          </label>
          <label className="crm-label">
            {t.to}
            <input
              type="date"
              className="crm-input dark:!border-[var(--panel-line)]"
              value={searchParams.get("to") || ""}
              onChange={(e) => updateUrl({ to: e.target.value })}
            />
          </label>
          <button
            type="button"
            className="crm-button whitespace-nowrap"
            disabled={!hasFilters}
            onClick={clearFilters}
          >
            {t.clear}
          </button>
        </div>
      )}

      {error && (
        <div
          className="crm-error my-3 flex flex-wrap items-center justify-between gap-3 dark:!border-[#ffb4b4]/30 dark:!bg-[#b91c1c]/15 dark:!text-[#ffb4b4]"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="crm-button whitespace-nowrap"
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            {t.refresh}
          </button>
        </div>
      )}

      <nav className="crm-folders" aria-label={t.requests}>
        {requestFolders.map((id) => (
          <button
            key={id}
            type="button"
            className={`whitespace-nowrap ${folder === id ? "active" : ""}`}
            aria-current={folder === id ? "page" : undefined}
            onClick={() => updateUrl({ folder: id, request: "" })}
          >
            <span>{t[id]}</span>
            <span className="font-display tabular-nums">{inbox.counts[id].toLocaleString(locale)}</span>
          </button>
        ))}
      </nav>

      <div className="crm-inbox-grid">
        <section className="crm-request-list relative" aria-label={t.requests} aria-busy={loading}>
          {loading && inbox.requests.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden" aria-hidden="true">
              <div className="panel-indeterminate-bar h-full bg-primary dark:bg-[#bad7fa]" />
            </div>
          )}

          {!inbox.requests.length && (
            loading ? (
              <div className="panel-skeleton divide-y divide-[var(--panel-line)]" role="status" aria-label={t.loading}>
                <span className="sr-only">{t.loading}</span>
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex items-start gap-3 p-4" aria-hidden="true">
                    <div className="panel-request-avatar !bg-[var(--panel-subtle)]" />
                    <div className="min-w-0 flex-1 space-y-2.5 pt-1">
                      <div className="h-3.5 w-36 rounded bg-[var(--panel-subtle)]" />
                      <div className="h-3 w-4/5 rounded bg-[var(--panel-subtle)]" />
                      <div className="h-2.5 w-24 rounded bg-[var(--panel-subtle)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="panel-list-empty" role="status">
                {hasFilters ? (
                  <>
                    <h3>{t.noMatches}</h3>
                    <p>{copy.emptyHint}</p>
                    <button type="button" className="crm-button whitespace-nowrap" onClick={clearFilters}>
                      {t.clear}
                    </button>
                  </>
                ) : inbox.counts.all === 0 ? (
                  <>
                    <h3>{emptyCopy.noRequestsTitle}</h3>
                    <p>{emptyCopy.noRequestsHint}</p>
                  </>
                ) : (
                  <>
                    <h3>
                      {folder === "attention" || folder === "pending"
                        ? emptyCopy.noPendingTitle
                        : emptyCopy.emptyFolderTitle}
                    </h3>
                    <p>{emptyCopy.otherFolderHint}</p>
                    {folder !== "all" && (
                      <button
                        type="button"
                        className="crm-button whitespace-nowrap"
                        onClick={() => updateUrl({ folder: "all", request: "" })}
                      >
                        {t.all}
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          )}

          {inbox.requests.map((r, index) => {
            const key = inboxDay(r.created_at, localizedDates);
            const heading = index === 0 || key !== inboxDay(inbox.requests[index - 1].created_at, localizedDates);
            return (
              <div key={r.id}>
                {heading && (
                  <h3 className="crm-day-heading !font-display tabular-nums">
                    {localizedDates ? dayLabel(key, locale, t.today, t.yesterday) : key || "—"}
                  </h3>
                )}
                <button
                  type="button"
                  className={`crm-request-row ${requestId === r.id ? "selected" : ""}`}
                  onClick={() => updateUrl({ request: r.id })}
                  aria-pressed={requestId === r.id}
                >
                  <div className="panel-request-identity">
                    <span className="panel-request-avatar" aria-hidden="true">
                      {requestInitials(r.full_name, t.unnamed)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-semibold">{r.full_name || t.unnamed}</span>
                        <time
                          className="shrink-0 font-display text-xs font-normal tabular-nums text-[var(--panel-muted)]"
                          dateTime={r.created_at}
                        >
                          {inboxTimestamp(r.created_at, locale, "time", localizedDates)}
                        </time>
                      </div>
                      <p className="panel-request-description">{r.description}</p>
                      <div className="panel-request-meta">
                        <span className={STATUS_TONE[r.status]} data-status={r.status}>
                          {t[r.status]}
                        </span>
                        {r.priority === "urgent" && (
                          <span className="font-semibold text-[#b91c1c] dark:text-[#ffb4b4]">
                            {t.urgent}
                          </span>
                        )}
                        {r.county && <span className="truncate text-[var(--panel-muted)]">{r.county}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

          {inbox.hasMore && (
            <div className="p-4 text-center">
              <button type="button" className="crm-button whitespace-nowrap" disabled={loading} onClick={loadMore}>
                {loading ? t.loading : t.loadMore}
              </button>
            </div>
          )}
        </section>

        <section className={`crm-reading-pane ${requestId ? "is-open" : ""}`} aria-label={t.selectRequest}>
          {selected ? (
            <RequestReader
              key={`${selected.id}-${draftVersion}`}
              request={selected}
              onDirtyChange={setDirty}
              onUpdate={updateRequest}
              onBack={() => updateUrl({ request: "" })}
              onCreate={() => {
                if (!dirty || window.confirm(t.unsaved)) {
                  setDirty(false);
                  setDraftVersion((version) => version + 1);
                  setCreating(selected);
                }
              }}
              onReply={() => setReplying(selected)}
              onDelete={async () => {
                const response = await fetch(`/api/medical-help-requests?id=${encodeURIComponent(selected.id)}`, { method: "DELETE" });
                if (!response.ok) throw new Error();
                setDirty(false);
                updateUrl({ request: "" }, false, true);
                setRefreshKey((key) => key + 1);
              }}
            />
          ) : requestId ? (
            <div className="crm-reader-content panel-skeleton" role="status" aria-label={t.loading}>
              <span className="sr-only">{t.loading}</span>
              <div className="space-y-4" aria-hidden="true">
                <div className="h-7 w-48 rounded bg-[var(--panel-subtle)]" />
                <div className="h-4 w-64 rounded bg-[var(--panel-subtle)]" />
                <div className="h-24 w-full max-w-[65ch] rounded bg-[var(--panel-subtle)]" />
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {creating && (
        <CreatePatientModal
          isAdmin={isAdmin}
          isRomania={isRomania}
          request={creating}
          onClose={() => setCreating(null)}
        />
      )}
      {replying && <QuickTemplatesModal request={replying} onClose={() => setReplying(null)} />}
    </section>
  );
}

function RequestReader({ request, onDirtyChange, onUpdate, onBack, onCreate, onReply, onDelete }: {
  request: MedicalHelpRequestItem;
  onDirtyChange: (value: boolean) => void;
  onUpdate: (request: MedicalHelpRequestItem) => void;
  onBack: () => void;
  onCreate: () => void;
  onReply: () => void;
  onDelete: () => Promise<void>;
}) {
  const { lang } = useLanguage();
  const localizedDates = useViewerTimeZone() !== null;
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [priority, setPriority] = useState<RequestPriority>(request.priority);
  const [notes, setNotes] = useState(request.internal_notes || "");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = status !== request.status || priority !== request.priority || notes !== (request.internal_notes || "");

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const save = useCallback(async (nextStatus = status) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/medical-help-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, status: nextStatus, priority, internal_notes: notes.trim() || null }),
      });
      const data = (await response.json()) as { request?: Partial<MedicalHelpRequestItem>; error?: string };
      if (!response.ok) {
        setError(data.error || t.error);
        return;
      }
      const trimmedNotes = notes.trim();
      setStatus(nextStatus);
      setNotes(trimmedNotes);
      setJustSaved(true);
      onUpdate({ ...request, ...data.request, status: nextStatus, priority, internal_notes: trimmedNotes || null });
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }, [fetch, notes, onUpdate, priority, request, status, t.error]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (document.querySelector('[role="dialog"]')) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !saving) void save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dirty, saving, save]);

  return (
    <div className="crm-reader-content">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--panel-line)] pb-4">
        <button
          type="button"
          className="crm-reader-back inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-lg pr-2 text-sm font-medium text-primary underline-offset-3 hover:underline dark:text-[#bad7fa]"
          onClick={onBack}
        >
          <ChevronLeftIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span>{t.back}</span>
        </button>
        <ActionMenu label={t.more}>
          <button
            type="button"
            disabled={saving}
            className="min-h-11 whitespace-nowrap !text-[#b91c1c] hover:!bg-[#fef2f2] dark:!text-[#ffb4b4] dark:hover:!bg-[#b91c1c]/20"
            onClick={async () => {
              if (!window.confirm(t.deleteConfirm)) return;
              setSaving(true);
              try {
                await onDelete();
              } catch {
                setError(t.error);
                setSaving(false);
              }
            }}
          >
            {t.delete}
          </button>
        </ActionMenu>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--panel-ink)] [overflow-wrap:break-word]">
          {request.full_name || t.unnamed}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--panel-muted)]">
          <span className="font-display tabular-nums">#{request.id}</span>
          <time className="font-display tabular-nums" dateTime={request.created_at}>
            {inboxTimestamp(request.created_at, langToLocale[lang], "dateTime", localizedDates)}
          </time>
          {request.county && <span>{request.county}</span>}
        </div>
        {(request.phone || request.email) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
            {request.phone && (
              <a
                className="inline-flex min-h-11 items-center font-display tabular-nums text-primary dark:text-[#bad7fa] dark:decoration-[#bad7fa]/50"
                href={`tel:${request.phone}`}
              >
                {request.phone}
              </a>
            )}
            {request.email && (
              <a
                className="inline-flex min-h-11 items-center break-all text-primary dark:text-[#bad7fa] dark:decoration-[#bad7fa]/50"
                href={`mailto:${request.email}`}
              >
                {request.email}
              </a>
            )}
          </div>
        )}
      </div>

      <p className="my-6 max-w-[70ch] whitespace-pre-wrap text-[0.9375rem] leading-[1.65] text-[var(--panel-ink)] [overflow-wrap:break-word]">
        {request.description}
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {request.patient_id ? (
          <Link
            className={`crm-button whitespace-nowrap ${dirty ? "" : "crm-primary"}`}
            href={withLangPrefix(`/panel/patients/${request.patient_id}`, lang)}
          >
            {t.openPatient}
          </Link>
        ) : (
          <button
            type="button"
            className={`crm-button whitespace-nowrap ${dirty ? "" : "crm-primary"}`}
            onClick={onCreate}
          >
            {t.createPatient}
          </button>
        )}
        <button
          type="button"
          className="crm-button whitespace-nowrap"
          disabled={!request.email}
          onClick={onReply}
        >
          {t.reply}
        </button>
      </div>

      <div className="mt-7 border-t border-[var(--panel-line)] pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="crm-label">
            {t.status}
            <select
              className="crm-input whitespace-nowrap dark:!border-[var(--panel-line)]"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as RequestStatus);
                setJustSaved(false);
              }}
              disabled={saving}
            >
              {(["pending", "in_progress", "resolved", "archived"] as const).map((id) => (
                <option value={id} key={id}>
                  {t[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="crm-label">
            {t.priority}
            <select
              className="crm-input whitespace-nowrap dark:!border-[var(--panel-line)]"
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as RequestPriority);
                setJustSaved(false);
              }}
              disabled={saving}
            >
              <option value="normal">{t.normal}</option>
              <option value="urgent">{t.urgent}</option>
            </select>
          </label>
        </div>

        <label className="crm-label mt-5">
          {t.notes}
          <textarea
            rows={5}
            maxLength={4000}
            className="crm-input dark:!border-[var(--panel-line)]"
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setJustSaved(false);
            }}
            disabled={saving}
          />
        </label>

        {error && (
          <p
            className="crm-error mt-3 dark:!border-[#ffb4b4]/30 dark:!bg-[#b91c1c]/15 dark:!text-[#ffb4b4]"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="crm-button crm-primary whitespace-nowrap disabled:!border-[#9aa9bc] disabled:!bg-[var(--panel-subtle)] disabled:!text-[#4b5c70] dark:disabled:!border-[#566b85] dark:disabled:!bg-[var(--panel-subtle)] dark:disabled:!text-[#b8c6d6]"
            disabled={!dirty || saving}
            onClick={() => void save()}
          >
            {saving ? t.saving : t.save}
          </button>
          {status !== "resolved" && status !== "archived" && (
            <button
              type="button"
              className="crm-button whitespace-nowrap"
              disabled={saving}
              onClick={() => {
                if (window.confirm(t.closeRequestConfirm)) void save("resolved");
              }}
            >
              {t.closeRequest}
            </button>
          )}
          {!dirty && justSaved && (
            <span className="text-sm font-medium text-primary dark:text-[#bad7fa]" role="status">
              {t.saved}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

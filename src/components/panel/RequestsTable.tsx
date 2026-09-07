"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  MailIcon,
  PinIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale, panelTranslations } from "@/lib/i18n/panel-translations";
import type { MedicalHelpRequestItem, RequestPriority, RequestStatus } from "@/lib/types/medical-request";
import type { PatientItem } from "@/lib/types/patient";
import { RequestDetailModal } from "./RequestDetailModal";
import { QuickTemplatesModal } from "./QuickTemplatesModal";
import { CreatePatientModal } from "./CreatePatientModal";

interface RequestsTableProps {
  requests: MedicalHelpRequestItem[];
  setRequests: React.Dispatch<React.SetStateAction<MedicalHelpRequestItem[]>>;
  activeStatusFilter: RequestStatus | "all";
  onSelectStatusFilter: (status: RequestStatus | "all") => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

type StatusPatchResponse = {
  error?: string;
  request?: {
    status?: RequestStatus;
    status_updated_by_name?: string | null;
    status_updated_by_email?: string | null;
    status_updated_at?: string;
  } | null;
};

function toIsoDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

export function RequestsTable({
  requests,
  setRequests,
  activeStatusFilter,
  onSelectStatusFilter,
  onRefresh,
  isRefreshing = false,
}: RequestsTableProps) {
  const { lang } = useLanguage();
  const t = panelTranslations[lang].requestsTable;
  const locale = langToLocale[lang];
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | "all">("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<MedicalHelpRequestItem | null>(null);
  const [createPatientRequest, setCreatePatientRequest] = useState<MedicalHelpRequestItem | null>(null);
  const [templateRequest, setTemplateRequest] = useState<MedicalHelpRequestItem | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [pinnedRequestIds, setPinnedRequestIds] = useState<string[]>([]);
  const hasLoadedPreferencesRef = useRef(false);

  useEffect(() => {
    if (!hasLoadedPreferencesRef.current) {
      return;
    }
    window.localStorage.setItem("redihealth-requests-view", viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!hasLoadedPreferencesRef.current) {
      return;
    }
    window.localStorage.setItem("redihealth-requests-pins", JSON.stringify(pinnedRequestIds));
  }, [pinnedRequestIds]);

  useEffect(() => {
    const storedView = window.localStorage.getItem("redihealth-requests-view");
    if (storedView === "grid") {
      setViewMode("grid");
    }

    try {
      const raw = window.localStorage.getItem("redihealth-requests-pins");
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) {
        setPinnedRequestIds(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      setPinnedRequestIds([]);
    }

    hasLoadedPreferencesRef.current = true;
  }, []);

  const pinnedSet = useMemo(() => new Set(pinnedRequestIds), [pinnedRequestIds]);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        if (activeStatusFilter !== "all" && req.status !== activeStatusFilter) {
          return false;
        }

        if (priorityFilter !== "all" && req.priority !== priorityFilter) {
          return false;
        }

        const createdDate = toIsoDate(req.created_at);
        if (createdFrom && createdDate && createdDate < createdFrom) {
          return false;
        }
        if (createdTo && createdDate && createdDate > createdTo) {
          return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const nameMatch = req.full_name?.toLowerCase().includes(query);
          const emailMatch = req.email.toLowerCase().includes(query);
          const phoneMatch = req.phone.includes(query);
          const descMatch = req.description.toLowerCase().includes(query);
          return nameMatch || emailMatch || phoneMatch || descMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const aPinned = pinnedSet.has(a.id);
        const bPinned = pinnedSet.has(b.id);
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }

        if (sortBy === "priority") {
          if (a.priority === "urgent" && b.priority !== "urgent") return -1;
          if (a.priority !== "urgent" && b.priority === "urgent") return 1;
        }
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
      });
  }, [requests, activeStatusFilter, priorityFilter, createdFrom, createdTo, searchQuery, sortBy, pinnedSet]);

  function togglePinned(requestId: string) {
    setPinnedRequestIds((current) =>
      current.includes(requestId)
        ? current.filter((id) => id !== requestId)
        : [...current, requestId],
    );
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/medical-help-requests?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setErrorMessage(data.error || t.errorDelete);
        return;
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage(t.errorDeleteUnexpected);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleQuickStatusChange(id: string, newStatus: RequestStatus) {
    try {
      const response = await fetch("/api/medical-help-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = (await response.json()) as StatusPatchResponse;

      if (!response.ok) {
        setErrorMessage(data.error || t.errorUpdateStatus);
        return;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: data.request?.status || newStatus,
                status_updated_by_name: data.request?.status_updated_by_name ?? req.status_updated_by_name,
                status_updated_by_email: data.request?.status_updated_by_email ?? req.status_updated_by_email,
                status_updated_at: data.request?.status_updated_at || req.status_updated_at,
              }
            : req,
        ),
      );
    } catch {
      setErrorMessage(t.errorUpdateStatus);
    }
  }

  function handleExportCSV() {
    if (filteredRequests.length === 0) return;

    const headers = [
      "ID",
      "Created At",
      "Full Name",
      "Phone",
      "Email",
      "Status",
      "Priority",
      "Description",
      "Internal Notes",
    ];

    const rows = filteredRequests.map((req) => [
      req.id,
      new Date(req.created_at).toISOString(),
      `"${(req.full_name || "").replace(/"/g, '""')}"`,
      `"${req.phone.replace(/"/g, '""')}"`,
      `"${req.email.replace(/"/g, '""')}"`,
      req.status,
      req.priority,
      `"${req.description.replace(/"/g, '""')}"`,
      `"${(req.internal_notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `redihealth-requests-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <div className="col-span-3 inline-flex items-center rounded-xl border border-border bg-background p-1 sm:col-auto">
              <span className="px-2 text-[11px] font-semibold text-muted-foreground">{t.view}</span>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "list" ? "bg-primary text-white" : "text-foreground hover:bg-muted"
                }`}
              >
                {t.viewList}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "grid" ? "bg-primary text-white" : "text-foreground hover:bg-muted"
                }`}
              >
                {t.viewGrid}
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "priority")}
              className="col-span-3 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-auto"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="priority">{t.sortPriority}</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRequests.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              <DownloadIcon className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">{t.exportCsv}</span>
            </button>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                title={t.refreshTitle}
              >
                <RefreshIcon
                  className={`h-4 w-4 text-primary transition-transform ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden md:inline">
                  {isRefreshing ? t.refreshing : t.refresh}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <FilterIcon className="h-3.5 w-3.5" /> {t.filter}:
          </span>

          {(
            [
              { id: "all", label: t.allRequests },
              { id: "pending", label: t.pending },
              { id: "in_progress", label: t.inProgress },
              { id: "resolved", label: t.resolved },
              { id: "archived", label: t.archived },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStatusFilter(item.id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                activeStatusFilter === item.id
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-2 text-xs">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <AlertCircleIcon className="h-3.5 w-3.5" /> {t.urgency}
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as RequestPriority | "all")}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">{t.urgencyAll}</option>
              <option value="urgent">{t.urgencyUrgent}</option>
              <option value="normal">{t.urgencyNormal}</option>
            </select>
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> {t.createdFrom}
            </label>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-1 flex items-center gap-1 font-semibold text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> {t.createdTo}
            </label>
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {(createdFrom || createdTo) && (
            <button
              type="button"
              onClick={() => {
                setCreatedFrom("");
                setCreatedTo("");
              }}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {t.clearDates}
            </button>
          )}
        </div>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400 flex items-center justify-between"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold underline hover:no-underline ml-4"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t.showing(filteredRequests.length, requests.length)}
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileTextIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">{t.noRequests}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.noRequestsHint}
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3" : "space-y-3"}>
          {filteredRequests.map((request) => {
            const isDeleting = deletingId === request.id;
            const isConfirmingDelete = confirmingDeleteId === request.id;
            const isPinned = pinnedSet.has(request.id);
            const statusUpdatedBy = request.status_updated_by_name || request.status_updated_by_email;
            return (
              <article key={request.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelectedRequest(request)} className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors">{request.full_name || t.notProvided}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(request.created_at))}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePinned(request.id)}
                      aria-label={isPinned ? t.unpin : t.pin}
                      title={isPinned ? t.unpin : t.pin}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                        isPinned
                          ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <PinIcon className="h-3.5 w-3.5" />
                    </button>

                    <div className="relative shrink-0">
                      <select
                        value={request.status}
                        onChange={(event) => handleQuickStatusChange(request.id, event.target.value as RequestStatus)}
                        className={`min-w-[7.75rem] appearance-none rounded-xl border px-3 py-1.5 pr-8 text-[0.72rem] font-semibold capitalize shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          request.status === "pending"
                            ? "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                            : request.status === "in_progress"
                            ? "border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100"
                            : request.status === "resolved"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <option value="pending">{t.pending}</option>
                        <option value="in_progress">{t.inProgress}</option>
                        <option value="resolved">{t.resolved}</option>
                        <option value="archived">{t.archived}</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-current opacity-70" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{request.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1 font-semibold text-primary">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {request.phone}
                  </a>
                  <a href={`mailto:${request.email}`} className="max-w-full truncate text-muted-foreground">
                    {request.email}
                  </a>
                  {request.priority === "urgent" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                      <AlertCircleIcon className="h-3.5 w-3.5" /> {t.urgent}
                    </span>
                  ) : null}
                  {request.internal_notes ? (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-semibold text-foreground">{t.noteAttached}</span>
                  ) : null}
                  {isPinned ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
                      {t.pinned}
                    </span>
                  ) : null}
                  {statusUpdatedBy ? (
                    <span className="text-muted-foreground">
                      {t.statusUpdatedBy(statusUpdatedBy)}
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={isDeleting} onClick={() => handleDelete(request.id)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                        {isDeleting ? t.deleting : t.delete}
                      </button>
                      <button type="button" onClick={() => setConfirmingDeleteId(null)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted">
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmingDeleteId(request.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10 dark:text-red-400" aria-label={t.deleteRequest}>
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTemplateRequest(request)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={t.openEmailTemplates}>
                      <MailIcon className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setSelectedRequest(request)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover">
                      {t.details}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedRequest ? (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={(updated) => {
            setRequests((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r)),
            );
            setSelectedRequest(updated);
          }}
          onDelete={handleDelete}
          onOpenTemplates={() => {
            const req = selectedRequest;
            setSelectedRequest(null);
            setTemplateRequest(req);
          }}
          onCreatePatient={(req) => {
            setSelectedRequest(null);
            setCreatePatientRequest(req);
          }}
        />
      ) : null}

      {createPatientRequest ? (
        <CreatePatientModal
          request={createPatientRequest}
          onClose={() => setCreatePatientRequest(null)}
          onSuccess={(_saved: PatientItem) => {
            setCreatePatientRequest(null);
          }}
        />
      ) : null}

      {templateRequest ? (
        <QuickTemplatesModal
          request={templateRequest}
          onClose={() => setTemplateRequest(null)}
        />
      ) : null}
    </div>
  );
}

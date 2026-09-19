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
import { panelDesignTranslations } from "@/lib/i18n/panel-design-translations";
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
  const copy = panelDesignTranslations[lang];
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
  const [showFilters, setShowFilters] = useState(false);
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

  const hasFiltersApplied = Boolean(
    priorityFilter !== "all" || createdFrom || createdTo,
  );
  const hasAnyFilterActive = Boolean(
    searchQuery ||
      activeStatusFilter !== "all" ||
      priorityFilter !== "all" ||
      createdFrom ||
      createdTo,
  );

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 mb-6 shadow-xs">
        {/* Top search & quick actions bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
              className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              aria-expanded={showFilters}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                showFilters || hasFiltersApplied
                  ? "border-primary/40 bg-primary-soft text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <FilterIcon className="h-3.5 w-3.5" />
              <span>{copy.filters}</span>
              {hasFiltersApplied ? (
                <span className="h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </button>

            <div className="inline-flex items-center rounded-xl border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                aria-label={t.viewList}
                title={t.viewList}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.viewList}
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                aria-label={t.viewGrid}
                title={t.viewGrid}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.viewGrid}
              </button>
            </div>

            <select
              aria-label={copy.sort}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "priority")}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="priority">{t.sortPriority}</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRequests.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              <DownloadIcon className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">{t.exportCsv}</span>
            </button>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                title={t.refreshTitle}
              >
                <RefreshIcon
                  className={`h-4 w-4 text-primary ${isRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            ) : null}
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
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
              aria-pressed={activeStatusFilter === item.id}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                activeStatusFilter === item.id
                  ? "bg-primary text-white shadow-2xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Collapsible secondary filters */}
        {showFilters ? (
          <div className="border-t border-border pt-4">
            <div className="flex flex-wrap items-end gap-3 text-xs">
              <div className="min-w-[170px] flex-1">
                <label className="mb-1.5 flex items-center gap-1 font-semibold text-muted-foreground">
                  <AlertCircleIcon className="h-3.5 w-3.5" /> {t.urgency}
                </label>
                <select
                  aria-label={t.urgency}
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
                <label className="mb-1.5 flex items-center gap-1 font-semibold text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" /> {t.createdFrom}
                </label>
                <input
                  type="date"
                  aria-label={t.createdFrom}
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="min-w-[150px] flex-1">
                <label className="mb-1.5 flex items-center gap-1 font-semibold text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" /> {t.createdTo}
                </label>
                <input
                  type="date"
                  aria-label={t.createdTo}
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
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {t.clearDates}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {hasAnyFilterActive ? (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2 text-xs">
          <span className="text-muted-foreground">{copy.activeFilters}</span>
          <button
            type="button"
            className="font-bold text-primary hover:underline"
            onClick={() => {
              setSearchQuery("");
              onSelectStatusFilter("all");
              setPriorityFilter("all");
              setCreatedFrom("");
              setCreatedTo("");
            }}
          >
            {copy.reset}
          </button>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-4 font-bold underline hover:no-underline"
          >
            {t.dismiss}
          </button>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground">
          {t.showing(filteredRequests.length, requests.length)}
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
          <FileTextIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">{t.noRequests}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{t.noRequestsHint}</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
              : "space-y-3"
          }
        >
          {filteredRequests.map((request) => {
            const isDeleting = deletingId === request.id;
            const isConfirmingDelete = confirmingDeleteId === request.id;
            const isPinned = pinnedSet.has(request.id);
            const statusUpdatedBy =
              request.status_updated_by_name || request.status_updated_by_email;
            return (
              <article
                key={request.id}
                className={`rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-border hover:shadow-sm ${
                  isPinned ? "border-amber-200 bg-amber-50/20" : ""
                }`}
              >
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(request)}
                    className="min-w-0 text-left group"
                  >
                    <span className="block truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {request.full_name || t.notProvided}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(request.created_at))}
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
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <PinIcon className="h-3.5 w-3.5" />
                    </button>

                    <div className="relative shrink-0">
                      <select
                        aria-label={`${request.full_name || t.notProvided}: ${t.filter}`}
                        value={request.status}
                        onChange={(event) =>
                          handleQuickStatusChange(
                            request.id,
                            event.target.value as RequestStatus,
                          )
                        }
                        className={`min-w-[7.5rem] appearance-none rounded-xl border px-3 py-1.5 pr-7 text-xs font-bold capitalize transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          request.status === "pending"
                            ? "border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100/80"
                            : request.status === "in_progress"
                            ? "border-sky-200 bg-sky-50/80 text-sky-800 hover:bg-sky-100/80"
                            : request.status === "resolved"
                            ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/80"
                            : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <option value="pending">{t.pending}</option>
                        <option value="in_progress">{t.inProgress}</option>
                        <option value="resolved">{t.resolved}</option>
                        <option value="archived">{t.archived}</option>
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-current opacity-60" />
                    </div>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {request.description}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                  <a
                    href={`tel:${request.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 font-semibold text-primary hover:border-primary/40 hover:bg-primary-soft transition-colors"
                  >
                    <PhoneIcon className="h-3.5 w-3.5" />
                    <span>{request.phone}</span>
                  </a>
                  <a
                    href={`mailto:${request.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 text-muted-foreground hover:text-foreground transition-colors max-w-full truncate"
                  >
                    <MailIcon className="h-3.5 w-3.5" />
                    <span className="truncate">{request.email}</span>
                  </a>
                  {request.priority === "urgent" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200/80 bg-red-50 px-2.5 py-0.5 font-bold text-red-700">
                      <AlertCircleIcon className="h-3.5 w-3.5" /> {t.urgent}
                    </span>
                  ) : null}
                  {request.internal_notes ? (
                    <span className="inline-flex items-center rounded-full border border-border/80 bg-muted px-2.5 py-0.5 font-semibold text-foreground">
                      {t.noteAttached}
                    </span>
                  ) : null}
                  {isPinned ? (
                    <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700">
                      {t.pinned}
                    </span>
                  ) : null}
                  {statusUpdatedBy ? (
                    <span className="text-muted-foreground text-[11px]">
                      {t.statusUpdatedBy(statusUpdatedBy)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(request.id)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isDeleting ? t.deleting : t.delete}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(null)}
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(request.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={t.deleteRequest}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTemplateRequest(request)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label={t.openEmailTemplates}
                    >
                      <MailIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center justify-center min-h-10 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-2xs transition-colors"
                    >
                      {copy.openRequest}
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

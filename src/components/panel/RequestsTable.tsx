"use client";

import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  MailIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type { MedicalHelpRequestItem, RequestStatus } from "@/lib/types/medical-request";
import { RequestDetailModal } from "./RequestDetailModal";
import { QuickTemplatesModal } from "./QuickTemplatesModal";

interface RequestsTableProps {
  requests: MedicalHelpRequestItem[];
  setRequests: React.Dispatch<React.SetStateAction<MedicalHelpRequestItem[]>>;
  activeStatusFilter: RequestStatus | "all";
  onSelectStatusFilter: (status: RequestStatus | "all") => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function RequestsTable({
  requests,
  setRequests,
  activeStatusFilter,
  onSelectStatusFilter,
  onRefresh,
  isRefreshing = false,
}: RequestsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");
  const [selectedRequest, setSelectedRequest] = useState<MedicalHelpRequestItem | null>(null);
  const [templateRequest, setTemplateRequest] = useState<MedicalHelpRequestItem | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    return requests
      .filter((req) => {
        if (activeStatusFilter !== "all" && req.status !== activeStatusFilter) {
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
        if (sortBy === "priority") {
          if (a.priority === "urgent" && b.priority !== "urgent") return -1;
          if (a.priority !== "urgent" && b.priority === "urgent") return 1;
        }
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortBy === "oldest" ? timeA - timeB : timeB - timeA;
      });
  }, [requests, activeStatusFilter, searchQuery, sortBy]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/medical-help-requests?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to delete request.");
        return;
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
      setConfirmingDeleteId(null);
    } catch {
      setErrorMessage("An error occurred while deleting the request.");
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

      if (response.ok) {
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
        );
      }
    } catch {
      setErrorMessage("Failed to update request status.");
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
              placeholder="Search by name, phone, email or description..."
              className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "priority")}
              className="col-span-3 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-auto"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="priority">Sort: Priority First</option>
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredRequests.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
            >
              <DownloadIcon className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            {onRefresh ? (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                title="Refresh medical help requests"
              >
                <RefreshIcon
                  className={`h-4 w-4 text-primary transition-transform ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                <span className="hidden md:inline">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <FilterIcon className="h-3.5 w-3.5" /> Filter:
          </span>

          {(
            [
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
              { id: "archived", label: "Archived" },
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
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </p>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileTextIcon className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold text-foreground">No requests found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search criteria or status filter.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-sm lg:block">
          <table className="w-full min-w-[800px] text-left">
            <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-5 py-3.5">Status & Priority</th>
                <th scope="col" className="px-5 py-3.5">Received</th>
                <th scope="col" className="px-5 py-3.5">Person</th>
                <th scope="col" className="px-5 py-3.5">Contact</th>
                <th scope="col" className="px-5 py-3.5">Enquiry</th>
                <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRequests.map((request) => {
                const isDeleting = deletingId === request.id;
                const isConfirmingDelete = confirmingDeleteId === request.id;

                return (
                  <tr
                    key={request.id}
                    className="align-top hover:bg-muted/30 transition-colors"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex flex-col gap-1.5 items-start">
                        <select
                          value={request.status}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              request.id,
                              e.target.value as RequestStatus,
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize border-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                            request.status === "pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : request.status === "in_progress"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              : request.status === "resolved"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>

                        {request.priority === "urgent" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400">
                            <AlertCircleIcon className="h-3 w-3" /> Urgent
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted-foreground font-medium">
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(request.created_at))}
                    </td>

                    <td className="px-5 py-4 text-sm font-semibold text-foreground">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(request)}
                        className="text-left hover:text-primary transition-colors focus-visible:underline"
                      >
                        {request.full_name || "Not provided"}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <a
                        href={`tel:${request.phone}`}
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <PhoneIcon className="h-3.5 w-3.5" />
                        {request.phone}
                      </a>
                      <a
                        href={`mailto:${request.email}`}
                        className="mt-1 block hover:text-foreground truncate max-w-[180px]"
                        title={request.email}
                      >
                        {request.email}
                      </a>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-xs leading-relaxed text-muted-foreground">
                      <p className="line-clamp-2">{request.description}</p>
                      {request.internal_notes ? (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                          Note attached
                        </span>
                      ) : null}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-xs">
                      {isConfirmingDelete ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-red-600 dark:text-red-400 font-semibold">
                            Delete?
                          </span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(request.id)}
                            className="rounded-md bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Yes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(null)}
                            className="rounded-md border border-border bg-card px-2 py-1 font-semibold text-foreground hover:bg-muted"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(request)}
                            className="rounded-lg bg-primary/10 px-3 py-1.5 font-semibold text-primary hover:bg-primary/20 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateRequest(request)}
                            className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Quick Email Templates"
                          >
                            <MailIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(request.id)}
                            className="rounded-lg p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            title="Delete Request"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="space-y-3 lg:hidden">
          {filteredRequests.map((request) => {
            const isDeleting = deletingId === request.id;
            const isConfirmingDelete = confirmingDeleteId === request.id;
            return (
              <article key={request.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => setSelectedRequest(request)} className="min-w-0 text-left">
                    <span className="block truncate text-sm font-semibold text-foreground">{request.full_name || "Not provided"}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(request.created_at))}</span>
                  </button>
                  <select value={request.status} onChange={(event) => handleQuickStatusChange(request.id, event.target.value as RequestStatus)} className="shrink-0 rounded-lg border border-border bg-background px-2 py-1.5 text-xs font-semibold text-foreground">
                    <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="archived">Archived</option>
                  </select>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{request.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <a href={`tel:${request.phone}`} className="inline-flex items-center gap-1 font-semibold text-primary"><PhoneIcon className="h-3.5 w-3.5" />{request.phone}</a>
                  <a href={`mailto:${request.email}`} className="max-w-full truncate text-muted-foreground">{request.email}</a>
                  {request.priority === "urgent" ? <span className="inline-flex items-center gap-1 font-semibold text-red-600"><AlertCircleIcon className="h-3.5 w-3.5" />Urgent</span> : null}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-2"><button type="button" disabled={isDeleting} onClick={() => handleDelete(request.id)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">{isDeleting ? "Deleting..." : "Delete"}</button><button type="button" onClick={() => setConfirmingDeleteId(null)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground">Cancel</button></div>
                  ) : (
                    <button type="button" onClick={() => setConfirmingDeleteId(request.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-500/10" aria-label="Delete request"><TrashIcon className="h-4 w-4" /></button>
                  )}
                  <div className="flex items-center gap-2"><button type="button" onClick={() => setTemplateRequest(request)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted" aria-label="Open email templates"><MailIcon className="h-4 w-4" /></button><button type="button" onClick={() => setSelectedRequest(request)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover">Details</button></div>
                </div>
              </article>
            );
          })}
          </div>
        </>
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

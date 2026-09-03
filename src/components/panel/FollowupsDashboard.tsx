"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircleIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  FilterIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import type {
  FollowupItem,
  PatientItem,
  PatientPriority,
} from "@/lib/types/patient";
import {
  getFollowupState,
  getPriorityMeta,
  getRecommendedFollowupDate,
} from "@/lib/patient-helpers";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";

interface FollowupsDashboardProps {
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

type FollowupStateFilter =
  | "all"
  | "overdue"
  | "today"
  | "upcoming"
  | "completed"
  | "none";

export function FollowupsDashboard({
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
}: FollowupsDashboardProps) {
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<FollowupStateFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PatientPriority | "all">(
    "all",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [schedulingPatient, setSchedulingPatient] = useState<PatientItem | null>(
    null,
  );
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newReminder, setNewReminder] = useState(true);
  const [isSavingFollowup, setIsSavingFollowup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completingFollowup, setCompletingFollowup] = useState<{
    patient: PatientItem;
    followupId: string;
  } | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = (await response.json()) as { patients?: Record<string, unknown>[] };
        if (Array.isArray(data.patients)) {
          const formatted: PatientItem[] = data.patients.map((p) => ({
            id: String(p.id),
            request_id: p.request_id ? String(p.request_id) : null,
            full_name: String(p.full_name || ""),
            phone: String(p.phone || ""),
            email: String(p.email || ""),
            date_of_birth: typeof p.date_of_birth === "string" ? p.date_of_birth : null,
            gender: typeof p.gender === "string" ? p.gender : null,
            address: typeof p.address === "string" ? p.address : null,
            condition_notes: typeof p.condition_notes === "string" ? p.condition_notes : null,
            medical_history: typeof p.medical_history === "string" ? p.medical_history : null,
            treatment_plan: typeof p.treatment_plan === "object" ? (p.treatment_plan as PatientItem["treatment_plan"]) : null,
            followups: Array.isArray(p.followups) ? (p.followups as FollowupItem[]) : [],
            photos: Array.isArray(p.photos) ? (p.photos as PatientItem["photos"]) : [],
            status: (p.status as PatientItem["status"]) || "active",
            priority: (p.priority as PatientPriority) || "moderate",
            created_at: typeof p.created_at === "string" ? p.created_at : new Date().toISOString(),
          }));
          setPatients(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to refresh patients", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  const metrics = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let upcoming = 0;
    let criticalCount = 0;

    for (const p of patients) {
      if (p.priority === "critical") criticalCount++;

      const fInfo = getFollowupState(p.followups);
      if (fInfo.state === "overdue") overdue++;
      else if (fInfo.state === "today") dueToday++;
      else if (fInfo.state === "upcoming") upcoming++;
    }

    return {
      totalPatients: patients.length,
      overdue,
      dueToday,
      upcoming,
      criticalCount,
    };
  }, [patients]);

  const filteredClients = useMemo(() => {
    return patients
      .map((patient) => {
        const followupInfo = getFollowupState(patient.followups);
        return {
          patient,
          followupInfo,
        };
      })
      .filter(({ patient, followupInfo }) => {
        if (stateFilter !== "all" && followupInfo.state !== stateFilter) {
          return false;
        }

        if (priorityFilter !== "all" && patient.priority !== priorityFilter) {
          return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const nameMatch = patient.full_name.toLowerCase().includes(query);
          const emailMatch = patient.email.toLowerCase().includes(query);
          const phoneMatch = patient.phone.includes(query);
          const titleMatch = followupInfo.latest?.title.toLowerCase().includes(query);
          const notesMatch = followupInfo.latest?.notes?.toLowerCase().includes(query);

          return nameMatch || emailMatch || phoneMatch || titleMatch || notesMatch;
        }

        return true;
      })
      .sort((a, b) => {
        const pOrder: Record<PatientPriority, number> = {
          critical: 1,
          high: 2,
          moderate: 3,
          low: 4,
        };
        const pDiff = pOrder[a.patient.priority] - pOrder[b.patient.priority];
        if (pDiff !== 0) return pDiff;

        const stateOrder = { overdue: 1, today: 2, upcoming: 3, none: 4, completed: 5 };
        return stateOrder[a.followupInfo.state] - stateOrder[b.followupInfo.state];
      });
  }, [patients, stateFilter, priorityFilter, searchQuery]);

  async function handleMarkComplete(
    patient: PatientItem,
    followupId: string,
    notes: string,
  ) {
    const updatedFollowups = (patient.followups || []).map((f) =>
      f.id === followupId
        ? {
            ...f,
            status: "completed" as const,
            completion_notes: notes.trim() || undefined,
            completed_at: new Date().toISOString(),
          }
        : f,
    );

    setIsCompleting(true);
    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: patient.id,
          followups: updatedFollowups,
        }),
      });

      if (response.ok) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === patient.id ? { ...p, followups: updatedFollowups } : p,
          ),
        );
        setCompletingFollowup(null);
        setCompletionNotes("");
      } else {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || "Failed to update follow-up status.");
      }
    } catch {
      setErrorMessage("Failed to update follow-up status.");
    } finally {
      setIsCompleting(false);
    }
  }

  function handleOpenScheduleModal(p: PatientItem) {
    setSchedulingPatient(p);
    setNewTitle(`Follow-up Check-in (${p.priority.toUpperCase()} priority)`);
    setNewDate(getRecommendedFollowupDate(p.priority));
    setNewNotes("");
    setNewReminder(true);
  }

  async function handleSaveNewFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!schedulingPatient || !newTitle.trim() || !newDate.trim()) return;

    setIsSavingFollowup(true);
    setErrorMessage(null);

    const newFollowup: FollowupItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      date: newDate,
      notes: newNotes.trim() || undefined,
      status: "scheduled",
      reminder_set: newReminder,
    };

    const nextFollowups = [newFollowup, ...(schedulingPatient.followups || [])];

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: schedulingPatient.id,
          followups: nextFollowups,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || "Failed to schedule follow-up.");
        return;
      }

      setPatients((prev) =>
        prev.map((p) =>
          p.id === schedulingPatient.id ? { ...p, followups: nextFollowups } : p,
        ),
      );

      setSchedulingPatient(null);
    } catch {
      setErrorMessage("An error occurred while saving follow-up.");
    } finally {
      setIsSavingFollowup(false);
    }
  }

  function handleExportCSV() {
    if (filteredClients.length === 0) return;

    const headers = [
      "Patient ID",
      "Full Name",
      "Priority",
      "Care Status",
      "Phone",
      "Email",
      "Latest Follow-up Date",
      "Follow-up Title",
      "Follow-up Status",
      "Follow-up State",
      "Notes",
    ];

    const rows = filteredClients.map(({ patient, followupInfo }) => [
      patient.id,
      `"${patient.full_name.replace(/"/g, '""')}"`,
      patient.priority,
      patient.status,
      `"${patient.phone.replace(/"/g, '""')}"`,
      `"${patient.email.replace(/"/g, '""')}"`,
      followupInfo.latest?.date || "",
      `"${(followupInfo.latest?.title || "").replace(/"/g, '""')}"`,
      followupInfo.latest?.status || "none",
      followupInfo.label,
      `"${(followupInfo.latest?.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `redihealth-followups-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
      overdueCount={metrics.overdue}
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Follow-ups Queue
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Patient Follow-ups & Reminders
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Track scheduled consultations, overdue care reminders, and patient check-ins.
              </p>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              Connect MySQL to manage patient follow-ups and care schedules.
            </p>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => {
                    setStateFilter("all");
                    setPriorityFilter("all");
                  }}
                  className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                    stateFilter === "all" && priorityFilter === "all"
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border"
                  } hover:border-primary cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <UserIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.totalPatients}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Total Clients / Patients
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStateFilter("overdue")}
                  className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                    stateFilter === "overdue"
                      ? "border-red-600 ring-2 ring-red-600/20"
                      : "border-border"
                  } hover:border-red-600 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
                      <AlertCircleIcon className="h-5 w-5 animate-pulse" />
                    </span>
                    {metrics.overdue > 0 ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Attention
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 sm:text-3xl">
                      {metrics.overdue}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Overdue Follow-ups
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStateFilter("today")}
                  className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                    stateFilter === "today"
                      ? "border-amber-500 ring-2 ring-amber-500/20"
                      : "border-border"
                  } hover:border-amber-500 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <ClockIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.dueToday}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Due Today
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStateFilter("upcoming")}
                  className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                    stateFilter === "upcoming"
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-border"
                  } hover:border-blue-500 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <CalendarIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.upcoming}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Upcoming Scheduled
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPriorityFilter("critical")}
                  className={`flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition-all ${
                    priorityFilter === "critical"
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-border"
                  } hover:border-red-500 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                      <BellIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      {metrics.criticalCount}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Critical Patients
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clients by name, phone, title, notes..."
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      disabled={filteredClients.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      <DownloadIcon className="h-4 w-4 text-primary" />
                      <span className="hidden sm:inline">Export CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                      title="Refresh follow-up records"
                    >
                      <RefreshIcon
                        className={`h-4 w-4 text-primary transition-transform ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1 border-t border-border">
                  <div className="flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1 mr-1">
                      <FilterIcon className="h-3.5 w-3.5" /> Follow-up State:
                    </span>
                    {(
                      [
                        { id: "all", label: "All States" },
                        { id: "overdue", label: "OVERDUE" },
                        { id: "today", label: "Due Today" },
                        { id: "upcoming", label: "Upcoming" },
                        { id: "completed", label: "Completed" },
                        { id: "none", label: "No Follow-up" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStateFilter(item.id)}
                        className={`rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                          stateFilter === item.id
                            ? "bg-primary text-white"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto text-xs">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1 mr-1">
                      <BellIcon className="h-3.5 w-3.5" /> Patient Priority:
                    </span>
                    {(
                      [
                        { id: "all", label: "All Priorities" },
                        { id: "critical", label: "Critical" },
                        { id: "high", label: "High" },
                        { id: "moderate", label: "Moderate" },
                        { id: "low", label: "Low" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPriorityFilter(item.id)}
                        className={`rounded-lg px-3 py-1.5 font-semibold transition-colors whitespace-nowrap ${
                          priorityFilter === item.id
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              ) : null}

              {filteredClients.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    No follow-ups match criteria
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try clearing search query or adjusting filter options.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map(({ patient, followupInfo }) => {
                    const pMeta = getPriorityMeta(patient.priority);
                    const latestF = followupInfo.latest;

                    return (
                      <article key={patient.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/panel/patients/${patient.id}`}
                              className="block truncate text-sm font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {patient.full_name}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground">Record ID #{patient.id}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${pMeta.badgeClass}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${pMeta.dotClass}`} />
                              {pMeta.label}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${followupInfo.badgeClass}`}>
                              {followupInfo.label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs leading-relaxed text-foreground">
                          {latestF ? (
                            <div>
                              <p className="font-semibold text-foreground">{latestF.title}</p>
                              <p className="mt-0.5 text-muted-foreground">
                                Date: <span className="font-semibold">{latestF.date}</span>
                              </p>
                              {latestF.notes ? (
                                <p className="mt-1 line-clamp-2 text-muted-foreground">{latestF.notes}</p>
                              ) : null}
                              {latestF.completion_notes ? (
                                <p className="mt-1 line-clamp-2 text-emerald-700 dark:text-emerald-400">
                                  Outcome: {latestF.completion_notes}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground">No follow-up logged</span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <a href={`tel:${patient.phone}`} className="inline-flex items-center gap-1 font-semibold text-primary">
                            <PhoneIcon className="h-3.5 w-3.5" />
                            {patient.phone}
                          </a>
                          <a href={`mailto:${patient.email}`} className="max-w-full truncate">{patient.email}</a>
                          <span className="capitalize">{patient.status} care</span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3 text-xs">
                          {latestF && latestF.status === "scheduled" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCompletingFollowup({ patient, followupId: latestF.id });
                                setCompletionNotes("");
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 font-semibold text-white hover:bg-emerald-700 transition-colors"
                              title="Mark latest follow-up as completed"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              <span>Complete</span>
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(patient)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 font-semibold text-foreground hover:bg-muted transition-colors"
                            title="Schedule new follow-up"
                          >
                            <PlusIcon className="h-3.5 w-3.5 text-primary" />
                            <span>Schedule</span>
                          </button>

                          <Link
                            href={`/panel/patients/${patient.id}`}
                            className="rounded-lg bg-primary px-2.5 py-1.5 font-semibold text-white hover:bg-primary-hover transition-colors"
                          >
                            Profile
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Container>
      </main>

      {schedulingPatient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  Schedule Follow-Up
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingPatient(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">
              <p className="font-bold text-foreground">
                Client: {schedulingPatient.full_name}
              </p>
              <p className="text-muted-foreground mt-0.5">
                Priority:{" "}
                <span className="font-bold uppercase text-primary">
                  {schedulingPatient.priority}
                </span>{" "}
                &bull; Suggested follow-up interval:{" "}
                {getPriorityMeta(schedulingPatient.priority).recommendedDays} days
              </p>
            </div>

            <form onSubmit={handleSaveNewFollowup} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Follow-Up Title / Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Call to check medication progress"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Staff Instructions / Notes
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notes for staff member performing the follow-up..."
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <label className="inline-flex items-center gap-2 font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newReminder}
                  onChange={(e) => setNewReminder(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Set active notification reminder</span>
              </label>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setSchedulingPatient(null)}
                  className="rounded-lg border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFollowup}
                  className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSavingFollowup ? "Scheduling..." : "Save Follow-Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {completingFollowup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-border bg-card p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Complete follow-up</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add an outcome note for {completingFollowup.patient.full_name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCompletingFollowup(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Close completion form"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-foreground">
              Follow-up notes
              <textarea
                value={completionNotes}
                onChange={(event) => setCompletionNotes(event.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="Record contact made, outcome, next steps, or concerns."
                className="mt-2 block w-full rounded-lg border border-border bg-background p-3 text-sm font-normal text-foreground"
              />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={isCompleting} onClick={() => setCompletingFollowup(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                Cancel
              </button>
              <button type="button" disabled={isCompleting} onClick={() => void handleMarkComplete(completingFollowup.patient, completingFollowup.followupId, completionNotes)} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                {isCompleting ? "Saving..." : "Complete follow-up"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

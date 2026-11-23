"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useEffect, useState } from "react";
import { AdminShell } from "./AdminShell";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel, formatPanelDate } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import type { PatientItem } from "@/lib/types/patient";

export type MeetItem = {
  id: string;
  title: string;
  meeting_url: string;
  transcript: string | null;
  notes: string | null;
  patient_id: string | null;
  followup_id?: string | null;
  patient_name: string | null;
  created_at: string;
};

const outlineBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[var(--panel-selection)] active:bg-[var(--panel-selection)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[#28476f] active:bg-[#101a33] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

export function MeetDashboard({
  userEmail,
  userRole,
  isAdmin,
  pendingRequestsCount,
  databaseAvailable,
  assignedPatients,
  initialMeetings,
}: {
  userEmail: string;
  userRole: string;
  isAdmin: boolean;
  pendingRequestsCount: number;
  databaseAvailable: boolean;
  assignedPatients: PatientItem[];
  initialMeetings: MeetItem[];
}) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const [patients, setPatients] = useState(assignedPatients);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(""), 2500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  function followup(meeting: MeetItem) {
    return patients
      .find((p) => p.id === meeting.patient_id)
      ?.followups?.find((f) => f.id === meeting.followup_id || f.meeting_id === meeting.id);
  }

  const query = search.trim().toLowerCase();
  const matchesSearch = (meeting: MeetItem) =>
    !query || `${meeting.title} ${meeting.patient_name || ""}`.toLowerCase().includes(query);

  const upcomingMeetings = meetings.filter(
    (meeting) => followup(meeting)?.status === "scheduled" && matchesSearch(meeting),
  );
  const historyMeetings = meetings.filter(
    (meeting) => followup(meeting)?.status !== "scheduled" && matchesSearch(meeting),
  );

  const visible = (tab === "upcoming" ? upcomingMeetings : historyMeetings).sort((a, b) =>
    tab === "upcoming"
      ? `${followup(a)?.date || ""} ${followup(a)?.time || ""}`.localeCompare(
          `${followup(b)?.date || ""} ${followup(b)?.time || ""}`,
        )
      : b.created_at.localeCompare(a.created_at),
  );

  async function copy(meeting: MeetItem) {
    try {
      await navigator.clipboard.writeText(meeting.meeting_url);
      setCopied(meeting.id);
    } catch {
      setError(t.error);
    }
  }

  async function remove(meeting: MeetItem) {
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      const response = await fetch(`/api/meetings?id=${encodeURIComponent(meeting.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      setMeetings((current) => current.filter((m) => m.id !== meeting.id));
      setPatients((current) =>
        current.map((p) => ({
          ...p,
          followups: p.followups?.map((f) => {
            if (f.meeting_id !== meeting.id) return f;
            const updated = { ...f };
            delete updated.meeting_id;
            delete updated.meeting_url;
            delete updated.meeting_notes;
            delete updated.meeting_transcript;
            return updated;
          }),
        })),
      );
    } catch {
      setError(t.error);
    }
  }

  const tabs: Array<{ id: "upcoming" | "history"; label: string; count: number }> = [
    { id: "upcoming", label: t.upcoming, count: upcomingMeetings.length },
    { id: "history", label: t.history, count: historyMeetings.length },
  ];

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
    >
      <main
        id="main-content"
        className="min-h-dvh bg-[var(--panel-surface)] px-4 py-5 pb-24 text-[var(--panel-ink)] sm:px-6 sm:py-6"
      >
        <div className="mx-auto max-w-[1240px] space-y-5">
          {/* Open-canvas header */}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-2xl font-bold tracking-[-0.025em] text-[var(--panel-ink)] sm:text-[1.875rem] sm:leading-[1.2]">
              {t.meetings}
            </h1>
            <Link href={withLangPrefix("/panel/calendar", lang)} className={outlineBtn}>
              {t.schedule}
            </Link>
          </header>

          {!databaseAvailable ? (
            <p
              role="alert"
              className="rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-4 py-3 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
            >
              {t.loadError}
            </p>
          ) : (
            <>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-4 py-3 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
                >
                  {error}
                </p>
              )}

              {/* Unified toolbar above tabs (matches Calendar & RequestsInbox) */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="search"
                  className="min-h-11 w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire sm:w-72 dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPatients}
                  aria-label={t.searchPatients}
                />
              </div>

              {/* Horizontal underline tabs flowing seamlessly into meeting list */}
              <div>
                <div
                  className="flex flex-nowrap gap-6 overflow-x-auto border-b border-[var(--panel-line)]"
                  role="tablist"
                  aria-label={t.meetings}
                >
                  {tabs.map((item) => {
                    const active = tab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        id={`meetings-tab-${item.id}`}
                        role="tab"
                        aria-selected={active}
                        aria-controls="meeting-list"
                        onClick={() => setTab(item.id)}
                        className={`-mb-px inline-flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 py-3 text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                          active
                            ? "border-sapphire font-semibold text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                            : "border-transparent font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className="font-normal tabular-nums text-[var(--panel-muted)]">
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <section
                  id="meeting-list"
                  role="tabpanel"
                  aria-labelledby={`meetings-tab-${tab}`}
                >
                  {!visible.length ? (
                    <div className="py-8">
                      <p className="text-base font-semibold text-[var(--panel-ink)]">{t.empty}</p>
                      <div className="mt-4">
                        <Link href={withLangPrefix("/panel/calendar", lang)} className={primaryBtn}>
                          {t.schedule}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--panel-line)]">
                      {visible.map((meeting) => {
                        const appointment = followup(meeting);
                        return (
                          <article
                            key={meeting.id}
                            className="flex flex-col justify-between gap-4 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-[var(--panel-subtle)] sm:flex-row sm:items-center sm:px-2"
                          >
                            <div className="min-w-0">
                              <h2 className="text-base font-semibold text-[var(--panel-ink)]">
                                {meeting.title}
                              </h2>
                              <p className="mt-0.5 text-sm text-[var(--panel-muted)]">
                                {meeting.patient_name || t.unnamed}
                              </p>
                              <p className="mt-1 text-xs tabular-nums text-[var(--panel-muted)]">
                                {appointment
                                  ? followupLabel(appointment, langToLocale[lang], t.allDay, viewerZone)
                                  : formatPanelDate(meeting.created_at, langToLocale[lang], "date")}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {meeting.patient_id ? (
                                <Link
                                  className={primaryBtn}
                                  href={withLangPrefix(
                                    `/panel/patients/${meeting.patient_id}/meet/${meeting.id}`,
                                    lang,
                                  )}
                                >
                                  {t.join}
                                </Link>
                              ) : (
                                <a
                                  className={primaryBtn}
                                  href={meeting.meeting_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t.join}
                                </a>
                              )}
                              <button
                                type="button"
                                className={outlineBtn}
                                onClick={() => void copy(meeting)}
                              >
                                {copied === meeting.id ? t.copied : t.copyLink}
                              </button>
                              <details className="crm-menu">
                                <summary className={`${outlineBtn} cursor-pointer`}>
                                  {t.more}
                                </summary>
                                <div className="!border-[var(--panel-line)] !bg-[var(--panel-surface)] !text-[var(--panel-ink)]">
                                  {meeting.patient_id && (
                                    <Link
                                      href={withLangPrefix(`/panel/patients/${meeting.patient_id}`, lang)}
                                      className="inline-flex min-h-11 w-full items-center whitespace-nowrap text-[var(--panel-ink)] hover:!bg-[var(--panel-selection)]"
                                    >
                                      {t.openPatient}
                                    </Link>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.currentTarget.closest("details")?.removeAttribute("open");
                                      void remove(meeting);
                                    }}
                                    className="inline-flex min-h-11 w-full items-center whitespace-nowrap text-[#b91c1c] hover:!bg-[var(--panel-selection)] dark:text-[#ffb4b4]"
                                  >
                                    {t.delete}
                                  </button>
                                </div>
                              </details>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
              <p className="sr-only" role="status" aria-live="polite">
                {copied ? t.copied : ""}
              </p>
            </>
          )}
        </div>
      </main>
    </AdminShell>
  );
}

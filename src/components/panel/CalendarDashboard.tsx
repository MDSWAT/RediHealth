"use client";

import { PanelLink as Link, usePanelRuntime } from "./PanelRuntime";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { AdminShell } from "./AdminShell";
import { ScheduleFollowupDialog } from "./ScheduleFollowupDialog";
import { FollowupDetailDialog } from "./FollowupDetailDialog";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { panelTranslations, langToLocale } from "@/lib/i18n/panel-translations";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { dayLabel, followupTime, formatPanelDate, localDateKey } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import { normalizePatientsFromApi } from "@/lib/api-normalizers";
import type { PatientItem, FollowupItem } from "@/lib/types/patient";

type CalendarEvent = { patient: PatientItem; followup: FollowupItem };
type View = "agenda" | "day" | "week" | "month";

const outlineBtn =
  "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[var(--panel-selection)] active:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:bg-[#28476f] active:bg-[#101a33] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

const fieldInput =
  "min-h-11 rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

export function CalendarDashboard({
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
}: {
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const shellCopy = panelTranslations[lang].adminShell;
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
  const events = patients
    .flatMap((patient) => (patient.followups || []).map((followup) => ({ patient, followup })))
    .filter(
      (event) =>
        (status === "all" || event.followup.status === status) &&
        `${event.patient.full_name} ${event.followup.title}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      `${a.followup.date} ${a.followup.time || "00:00"}`.localeCompare(
        `${b.followup.date} ${b.followup.time || "00:00"}`,
      ),
    );

  const anchor = new Date(`${currentDate}T12:00:00`);
  const start = new Date(anchor);
  if (view === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  if (view === "month") {
    start.setDate(1);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  }
  const days = Array.from(
    { length: view === "month" ? 42 : view === "week" ? 7 : 1 },
    (_, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      return localDateKey(date);
    },
  );

  function navigate(direction: number) {
    const date = new Date(anchor);
    if (view === "month") {
      date.setDate(1);
      date.setMonth(date.getMonth() + direction);
    } else {
      date.setDate(date.getDate() + direction * (view === "week" ? 7 : 1));
    }
    setCurrentDate(localDateKey(date));
  }

  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const collected: PatientItem[] = [];
      let page = 1;
      let more = true;
      while (more) {
        const response = await fetch(`/api/patients?limit=100&page=${page}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        const batch = normalizePatientsFromApi(data.patients);
        collected.push(...batch);
        more = batch.length === 100;
        page++;
      }
      setPatients(collected);
    } catch {
      setError(t.loadError);
    } finally {
      setBusy(false);
    }
  }

  async function updateEvent(event: CalendarEvent, remove = false, completionNotes?: string) {
    if (busy || (remove && !window.confirm(t.deleteConfirm))) return;
    setBusy(true);
    setError("");
    try {
      if (remove && event.followup.meeting_id) {
        const response = await fetch(
          `/api/meetings?id=${encodeURIComponent(event.followup.meeting_id)}`,
          { method: "DELETE" },
        );
        if (!response.ok) throw new Error();
      }
      const next = remove
        ? (event.patient.followups || []).filter((f) => f.id !== event.followup.id)
        : (event.patient.followups || []).map((f) =>
            f.id === event.followup.id
              ? {
                  ...f,
                  status: f.status === "completed" ? ("scheduled" as const) : ("completed" as const),
                  completed_at: f.status === "completed" ? undefined : new Date().toISOString(),
                  completion_notes:
                    f.status === "completed" || completionNotes === undefined
                      ? f.completion_notes
                      : completionNotes.trim() || undefined,
                }
              : f,
          );
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.patient.id, followups: next }),
      });
      if (!response.ok) throw new Error();
      setPatients((current) =>
        current.map((p) => (p.id === event.patient.id ? { ...p, followups: next } : p)),
      );
      setSelected(null);
    } catch {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  async function createFollowupMeeting(event: CalendarEvent) {
    if (busy || event.followup.meeting_id) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({
          title: event.followup.title,
          patientId: event.patient.id,
          followupId: event.followup.id,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        followup?: FollowupItem;
        email_sent?: boolean;
      };
      if (!response.ok || !data.followup) throw new Error(data.error || t.error);
      const followups = (event.patient.followups || []).map((item) =>
        item.id === event.followup.id ? data.followup! : item,
      );
      setPatients((current) =>
        current.map((patient) =>
          patient.id === event.patient.id ? { ...patient, followups } : patient,
        ),
      );
      setSelected({ patient: { ...event.patient, followups }, followup: data.followup });
      if (data.email_sent === false) setNotice(t.invitationWarning);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.error);
    } finally {
      setBusy(false);
    }
  }

  function finishButton(event: CalendarEvent) {
    return event.followup.status === "scheduled" ? (
      <button
        type="button"
        className={`${outlineBtn} text-sapphire dark:text-[#bad7fa]`}
        aria-label={`${t.markComplete}: ${event.followup.title}, ${event.patient.full_name}`}
        disabled={busy}
        onClick={() => void updateEvent(event)}
      >
        {t.markComplete}
      </button>
    ) : null;
  }

  function row(event: CalendarEvent) {
    return (
      <div
        key={`${event.patient.id}-${event.followup.id}`}
        className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-[var(--panel-subtle)] sm:px-2"
      >
        <button
          type="button"
          className="min-h-11 min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]"
          onClick={() => setSelected(event)}
        >
          <p className="text-sm font-semibold text-[var(--panel-ink)]">{event.followup.title}</p>
          <p className="mt-0.5 text-sm tabular-nums text-[var(--panel-muted)]">
            {event.patient.full_name}, {followupTime(event.followup, t.allDay, viewerZone)}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {finishButton(event)}
          {event.followup.meeting_id && (
            <Link
              className={primaryBtn}
              href={withLangPrefix(
                `/panel/patients/${event.patient.id}/meet/${event.followup.meeting_id}`,
                lang,
              )}
            >
              {t.join}
            </Link>
          )}
          <button type="button" className={outlineBtn} onClick={() => setSelected(event)}>
            {t.more}
          </button>
        </div>
      </div>
    );
  }

  const dateGroups = [...new Set(events.map((event) => event.followup.date.slice(0, 10)))];
  const dayEvents = events.filter((event) => event.followup.date.slice(0, 10) === currentDate);

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
              {shellCopy.calendar}
            </h1>
            <button
              type="button"
              className={primaryBtn}
              disabled={!patients.length}
              onClick={() => setScheduleDate(currentDate)}
            >
              {t.schedule}
            </button>
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
              {notice && (
                <p
                  role="status"
                  className="rounded-lg border border-[#9a4d0b]/35 bg-[#9a4d0b]/10 px-4 py-3 text-sm font-medium text-[#9a4d0b] dark:border-[#f5c58e]/35 dark:bg-[#9a4d0b]/20 dark:text-[#f5c58e]"
                >
                  {notice}
                </p>
              )}

              {/* Unified toolbar above tabs (matches Inbox & Meet) */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className={`${fieldInput} w-full sm:w-64`}
                  type="search"
                  placeholder={t.searchPatients}
                  aria-label={t.searchPatients}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className={`${fieldInput} whitespace-nowrap`}
                  aria-label={t.status}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  <option value="scheduled">{t.upcoming}</option>
                  <option value="completed">{t.completed}</option>
                  <option value="all">{t.history}</option>
                </select>
                <button
                  type="button"
                  className={`${outlineBtn} sm:ml-auto`}
                  disabled={busy}
                  onClick={() => void refresh()}
                >
                  {busy ? t.loading : t.refresh}
                </button>
              </div>

              {/* Horizontal underline tabs flowing seamlessly into calendar view */}
              <div>
                <div
                  className="flex flex-nowrap gap-6 overflow-x-auto border-b border-[var(--panel-line)]"
                  role="tablist"
                  aria-label={shellCopy.calendar}
                >
                  {(["agenda", "day", "week", "month"] as const).map((id) => {
                    const active = view === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        id={`calendar-tab-${id}`}
                        role="tab"
                        aria-selected={active}
                        aria-controls="calendar-view"
                        onClick={() => setView(id)}
                        className={`-mb-px inline-flex min-h-12 shrink-0 items-center whitespace-nowrap border-b-2 py-3 text-sm transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa] ${
                          active
                            ? "border-sapphire font-semibold text-sapphire dark:border-[#bad7fa] dark:text-[#bad7fa]"
                            : "border-transparent font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]"
                        }`}
                      >
                        {t[id]}
                      </button>
                    );
                  })}
                </div>

                <div
                  id="calendar-view"
                  role="tabpanel"
                  aria-labelledby={`calendar-tab-${view}`}
                >
                  {view !== "agenda" && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--panel-line)] py-3">
                      <button
                        type="button"
                        className={`${outlineBtn} min-w-11 px-2.5`}
                        aria-label={t.previous}
                        title={t.previous}
                        onClick={() => navigate(-1)}
                      >
                        <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={outlineBtn}
                        onClick={() => setCurrentDate(today)}
                      >
                        {t.today}
                      </button>
                      <button
                        type="button"
                        className={`${outlineBtn} min-w-11 px-2.5`}
                        aria-label={t.next}
                        title={t.next}
                        onClick={() => navigate(1)}
                      >
                        <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
                      </button>
                      <input
                        type="date"
                        aria-label={t.date}
                        className={fieldInput}
                        value={currentDate}
                        onChange={(e) => {
                          if (e.target.value) setCurrentDate(e.target.value);
                        }}
                      />
                      <h2 className="text-base font-semibold text-[var(--panel-ink)] sm:ml-auto">
                        {formatPanelDate(anchor, locale, "monthYear")}
                      </h2>
                    </div>
                  )}

                  {view === "agenda" ? (
                    !events.length ? (
                      <div className="py-8">
                        <p className="text-base font-semibold text-[var(--panel-ink)]">
                          {patients.length ? t.noFollowup : t.noPatients}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {patients.length > 0 ? (
                            <button
                              type="button"
                              className={outlineBtn}
                              onClick={() => setScheduleDate(currentDate)}
                            >
                              {t.schedule}
                            </button>
                          ) : (
                            <Link
                              href={withLangPrefix("/panel/patients", lang)}
                              className={primaryBtn}
                            >
                              {t.createPatient}
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {dateGroups.map((date) => (
                          <section
                            key={date}
                            className="border-b border-[var(--panel-line)] last:border-b-0"
                          >
                            <h2 className="border-b border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3 py-2 text-xs font-semibold tabular-nums text-[var(--panel-muted)]">
                              {date < today && (
                                <span className="mr-2 font-semibold text-[#9a4d0b] dark:text-[#f5c58e]">
                                  {t.overdue} —
                                </span>
                              )}
                              {dayLabel(date, locale, t.today, t.yesterday)}
                            </h2>
                            <div className="divide-y divide-[var(--panel-line)]">
                              {events
                                .filter((event) => event.followup.date.slice(0, 10) === date)
                                .map(row)}
                            </div>
                          </section>
                        ))}
                      </div>
                    )
                  ) : view === "day" ? (
                    <section>
                      <h2 className="border-b border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3 py-2 text-xs font-semibold text-[var(--panel-muted)]">
                        {dayLabel(currentDate, locale, t.today, t.yesterday)}
                      </h2>
                      {dayEvents.length === 0 ? (
                        <p className="py-8 text-sm text-[var(--panel-muted)]">{t.noFollowup}</p>
                      ) : (
                        <div className="divide-y divide-[var(--panel-line)] border-b border-[var(--panel-line)]">
                          {dayEvents.map(row)}
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          type="button"
                          className={outlineBtn}
                          disabled={!patients.length}
                          onClick={() => setScheduleDate(currentDate)}
                        >
                          {t.schedule}
                        </button>
                      </div>
                    </section>
                  ) : (
                    <div className="-mx-4 overflow-x-auto px-4 pt-3 sm:mx-0 sm:px-0">
                      <div className="crm-calendar-grid !border-[var(--panel-line)]">
                        {days.map((date) => (
                          <section
                            key={date}
                            className="crm-calendar-cell !border-[var(--panel-line)] !bg-[var(--panel-surface)] text-[var(--panel-ink)]"
                          >
                            <button
                              type="button"
                              className={`crm-calendar-day flex min-h-11 items-center whitespace-nowrap hover:!bg-[var(--panel-selection)] hover:!text-[var(--panel-ink)] ${
                                date === today
                                  ? "is-today !font-semibold !text-sapphire dark:!text-[#bad7fa]"
                                  : view === "month" &&
                                      date.slice(0, 7) !== currentDate.slice(0, 7)
                                    ? "is-outside !text-[var(--panel-muted)] opacity-60"
                                    : "!text-[var(--panel-muted)]"
                              }`}
                              aria-current={date === today ? "date" : undefined}
                              disabled={!patients.length}
                              onClick={() => setScheduleDate(date)}
                              title={t.schedule}
                            >
                              {formatPanelDate(`${date}T12:00:00`, locale, "weekdayDay")}
                            </button>
                            {events
                              .filter((event) => event.followup.date.slice(0, 10) === date)
                              .map((event) => (
                                <button
                                  key={`${event.patient.id}-${event.followup.id}`}
                                  type="button"
                                  className="crm-calendar-event min-h-11 !bg-[var(--panel-subtle)] !text-[var(--panel-ink)] hover:!bg-[var(--panel-selection)]"
                                  title={`${event.patient.full_name}, ${event.followup.time || t.allDay}, ${event.followup.title}`}
                                  onClick={() => setSelected(event)}
                                >
                                  <span className="block truncate font-semibold">
                                    {event.patient.full_name}
                                  </span>
                                  <span className="block truncate tabular-nums text-[var(--panel-muted)]">
                                    {event.followup.time || t.allDay}, {event.followup.title}
                                  </span>
                                </button>
                              ))}
                          </section>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {scheduleDate && (
            <ScheduleFollowupDialog
              patients={patients}
              date={scheduleDate}
              onClose={() => setScheduleDate(null)}
              onSaved={(id, followup, emailSent) => {
                setPatients((current) =>
                  current.map((p) =>
                    p.id === id
                      ? {
                          ...p,
                          followups: [
                            followup,
                            ...(p.followups || []).filter((f) => f.id !== followup.id),
                          ],
                        }
                      : p,
                  ),
                );
                setNotice(emailSent === false ? t.invitationWarning : "");
              }}
            />
          )}

          {selected && (
            <FollowupDetailDialog
              patient={selected.patient}
              followup={selected.followup}
              busy={busy}
              error={error}
              onClose={() => setSelected(null)}
              onToggle={(notes) => void updateEvent(selected, false, notes)}
              onCreateMeeting={() => void createFollowupMeeting(selected)}
              onDelete={() => void updateEvent(selected, true)}
            />
          )}
        </div>
      </main>
    </AdminShell>
  );
}

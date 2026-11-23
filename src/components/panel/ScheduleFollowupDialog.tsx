"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { REQUEST_LANG_HEADER } from "@/lib/i18n/routing";
import { localDateKey, zoneOffsetLabel } from "@/lib/panel-dates";
import type { FollowupItem } from "@/lib/types/patient";
import { useUnsavedChanges } from "./useUnsavedChanges";
import { usePanelRuntime } from "./PanelRuntime";

type PatientChoice = { id: string; full_name: string };

const fieldInput =
  "mt-1.5 block min-h-11 w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const outlineBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

export function ScheduleFollowupDialog({
  patients,
  patientId = "",
  date = localDateKey(),
  onClose,
  onSaved,
}: {
  patients: PatientChoice[];
  patientId?: string;
  date?: string;
  onClose: () => void;
  onSaved: (patientId: string, followup: FollowupItem, emailSent?: boolean) => void;
}) {
  const { lang } = useLanguage();
  const { request: fetch } = usePanelRuntime();
  const t = crmTranslations[lang];
  const baseId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef<string>("");
  const [selected, setSelected] = useState(patientId);
  const [title, setTitle] = useState("");
  const [scheduledDate, setDate] = useState(date);
  const [time, setTime] = useState("");
  const [timezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Bucharest",
  );
  const [notes, setNotes] = useState("");
  const [addVideo, setVideo] = useState(false);
  const [reminder, setReminder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Readable offset for the chosen day ("GMT+2"), not the raw IANA name.
  const zoneLabel = zoneOffsetLabel(
    timezone,
    new Date(`${scheduledDate || localDateKey()}T12:00:00`),
  );
  const dirty = Boolean(
    title || time || notes || selected !== patientId || scheduledDate !== date || addVideo,
  );
  useUnsavedChanges(dirty && !saving, t.unsaved);

  useEffect(() => {
    dialog.current?.showModal();
    requestId.current = crypto.randomUUID();
  }, []);

  function close() {
    if (!saving && (!dirty || window.confirm(t.unsaved))) onClose();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/patients/${encodeURIComponent(selected)}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify({
          id: requestId.current,
          title,
          date: scheduledDate,
          time,
          timezone,
          notes,
          video: addVideo,
          reminder_set: reminder,
        }),
      });
      const data = (await response.json()) as {
        followup?: FollowupItem;
        email_sent?: boolean;
        error?: string;
      };
      if (!response.ok || !data.followup) {
        setError(data.error || t.error);
        return;
      }
      onSaved(selected, data.followup, data.email_sent);
      onClose();
    } catch {
      setError(t.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="crm-dialog care-panel !border-[var(--panel-line)] !bg-[var(--panel-surface)] !text-[var(--panel-ink)]"
      aria-labelledby="schedule-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--panel-line)] pb-4">
          <h2 id="schedule-title" className="text-xl font-semibold text-[var(--panel-ink)]">
            {t.schedule}
          </h2>
          <button type="button" onClick={close} disabled={saving} className={outlineBtn}>
            {t.cancel}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-3.5 py-2.5 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
          >
            {error}
          </p>
        )}

        {!patients.length ? (
          <p className="py-4 text-sm text-[var(--panel-muted)]">{t.noPatients}</p>
        ) : (
          <>
            <div>
              <label
                htmlFor={`${baseId}-patient`}
                className="block text-sm font-medium text-[var(--panel-ink)]"
              >
                {t.patient}
              </label>
              <select
                id={`${baseId}-patient`}
                required
                className={`${fieldInput} whitespace-nowrap`}
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={Boolean(patientId) || saving}
              >
                <option value="">{t.choosePatient}</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`${baseId}-purpose`}
                className="block text-sm font-medium text-[var(--panel-ink)]"
              >
                {t.purpose}
              </label>
              <input
                id={`${baseId}-purpose`}
                autoFocus
                required
                maxLength={200}
                className={fieldInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${baseId}-date`}
                  className="block text-sm font-medium text-[var(--panel-ink)]"
                >
                  {t.date}
                </label>
                <input
                  id={`${baseId}-date`}
                  required
                  type="date"
                  className={fieldInput}
                  value={scheduledDate}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label
                  htmlFor={`${baseId}-time`}
                  className="block text-sm font-medium text-[var(--panel-ink)]"
                >
                  {t.time}
                </label>
                <input
                  id={`${baseId}-time`}
                  type="time"
                  className={fieldInput}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            {time && zoneLabel && (
              <p className="text-sm tabular-nums text-[var(--panel-muted)]">
                {t.timezone}: {zoneLabel}
              </p>
            )}

            <div>
              <label
                htmlFor={`${baseId}-notes`}
                className="block text-sm font-medium text-[var(--panel-ink)]"
              >
                {t.optionalNotes}
              </label>
              <textarea
                id={`${baseId}-notes`}
                className={`${fieldInput} min-h-[84px]`}
                rows={3}
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={saving}
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--panel-ink)]">
              <input
                type="checkbox"
                checked={addVideo}
                onChange={(e) => setVideo(e.target.checked)}
                disabled={saving}
                className="h-5 w-5 shrink-0 accent-sapphire"
              />
              <span>{t.video}</span>
            </label>

            <details className="text-sm">
              <summary className="inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap font-medium text-[var(--panel-muted)] hover:text-[var(--panel-ink)]">
                {t.additional}
              </summary>
              <label className="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-[var(--panel-ink)]">
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  disabled={saving}
                  className="h-5 w-5 shrink-0 accent-sapphire"
                />
                <span>{t.reminder}</span>
              </label>
            </details>

            <div className="flex justify-end border-t border-[var(--panel-line)] pt-4">
              <button disabled={saving} className={primaryBtn} type="submit">
                {saving ? t.saving : t.scheduleSave}
              </button>
            </div>
          </>
        )}
      </form>
    </dialog>
  );
}

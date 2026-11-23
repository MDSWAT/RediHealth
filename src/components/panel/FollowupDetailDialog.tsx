"use client";

import { PanelLink as Link } from "./PanelRuntime";
import { TrashIcon } from "@/components/ui/icons";
import { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { followupLabel, followupStatusLabel } from "@/lib/panel-dates";
import { useViewerTimeZone } from "./useViewerTimeZone";
import type { PatientItem, FollowupItem } from "@/lib/types/patient";

const outlineBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-selection)] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]";

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg border border-sapphire bg-sapphire px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#28476f] disabled:cursor-default disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:focus-visible:outline-[#bad7fa]";

export function FollowupDetailDialog({
  patient,
  followup,
  busy,
  error,
  onClose,
  onToggle,
  onDelete,
  onCreateMeeting,
}: {
  patient: PatientItem;
  followup: FollowupItem;
  busy: boolean;
  error?: string;
  onClose: () => void;
  onToggle: (completionNotes?: string) => void;
  onDelete: () => void;
  onCreateMeeting: () => void;
}) {
  const { lang } = useLanguage();
  const viewerZone = useViewerTimeZone();
  const t = crmTranslations[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const notesId = useId();
  const [completionNotes, setCompletionNotes] = useState(followup.completion_notes || "");

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="crm-dialog care-panel !border-[var(--panel-line)] !bg-[var(--panel-surface)] !text-[var(--panel-ink)]"
      style={{ width: "min(760px, calc(100vw - 24px))" }}
      aria-labelledby="followup-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--panel-line)] pb-4">
        <div className="min-w-0">
          <h2 id="followup-title" className="text-xl font-semibold text-[var(--panel-ink)]">
            {followup.title}
          </h2>
          <p className="mt-1 text-sm tabular-nums text-[var(--panel-muted)]">
            {followupLabel(followup, langToLocale[lang], t.allDay, viewerZone)} ·{" "}
            {followupStatusLabel(followup.status, t)}
          </p>
        </div>
        <button type="button" className={outlineBtn} onClick={onClose} disabled={busy}>
          {t.close}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-[#b91c1c]/35 bg-[#b91c1c]/10 px-3.5 py-2.5 text-sm font-medium text-[#b91c1c] dark:border-[#ffb4b4]/35 dark:bg-[#b91c1c]/20 dark:text-[#ffb4b4]"
        >
          {error}
        </p>
      )}

      <div className="mt-4 space-y-1">
        <Link
          className="inline-flex min-h-11 items-center whitespace-nowrap text-base font-semibold text-sapphire underline-offset-4 hover:underline dark:text-[#bad7fa]"
          href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}
        >
          {patient.full_name}
        </Link>
        {(patient.phone || patient.email) && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[var(--panel-muted)]">
            {patient.phone && (
              <a
                className="inline-flex min-h-11 items-center whitespace-nowrap tabular-nums text-[var(--panel-ink)] underline decoration-sapphire/35 underline-offset-4 dark:decoration-[#bad7fa]/40"
                href={`tel:${patient.phone}`}
              >
                {patient.phone}
              </a>
            )}
            {patient.email && (
              <a
                className="inline-flex min-h-11 items-center break-all text-[var(--panel-ink)] underline decoration-sapphire/35 underline-offset-4 dark:decoration-[#bad7fa]/40"
                href={`mailto:${patient.email}`}
              >
                {patient.email}
              </a>
            )}
          </div>
        )}
      </div>

      {followup.notes && (
        <p className="mt-4 max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed text-[var(--panel-ink)]">
          {followup.notes}
        </p>
      )}

      {followup.status === "completed" && followup.completion_notes && (
        <section className="mt-5 border-t border-[var(--panel-line)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.completionNotes}</h3>
          <p className="mt-2 max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed text-[var(--panel-muted)]">
            {followup.completion_notes}
          </p>
        </section>
      )}

      {followup.status !== "completed" && (
        <div className="mt-5 border-t border-[var(--panel-line)] pt-4">
          <label
            htmlFor={notesId}
            className="mb-1.5 block text-sm font-medium text-[var(--panel-ink)]"
          >
            {t.completionNotes}
          </label>
          <textarea
            id={notesId}
            className="w-full rounded-lg border border-[#8a94a6] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sapphire dark:border-[var(--panel-line)] dark:focus-visible:outline-[#bad7fa]"
            rows={4}
            maxLength={5000}
            value={completionNotes}
            onChange={(event) => setCompletionNotes(event.target.value)}
            disabled={busy}
          />
        </div>
      )}

      {(followup.meeting_notes || followup.meeting_transcript) && (
        <details className="mt-5 border-t border-[var(--panel-line)] pt-3 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap font-medium text-[var(--panel-ink)]">
            {t.consultationNotes}
          </summary>
          {followup.meeting_notes && (
            <p className="mt-2 whitespace-pre-wrap text-[var(--panel-muted)]">
              {followup.meeting_notes}
            </p>
          )}
          {followup.meeting_transcript && (
            <p className="mt-2 whitespace-pre-wrap text-[var(--panel-muted)]">
              {followup.meeting_transcript}
            </p>
          )}
        </details>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--panel-line)] pt-4">
        {followup.meeting_id && (
          <Link
            className={primaryBtn}
            href={withLangPrefix(`/panel/patients/${patient.id}/meet/${followup.meeting_id}`, lang)}
          >
            {t.join}
          </Link>
        )}
        <Link className={outlineBtn} href={withLangPrefix(`/panel/patients/${patient.id}`, lang)}>
          {t.openPatient}
        </Link>
        <button
          type="button"
          className={followup.meeting_id ? outlineBtn : primaryBtn}
          disabled={busy}
          onClick={() => onToggle(completionNotes)}
        >
          {followup.status === "completed" ? t.reopen : t.markComplete}
        </button>
        {!followup.meeting_id && (
          <button type="button" className={outlineBtn} disabled={busy} onClick={onCreateMeeting}>
            {t.createMeeting}
          </button>
        )}
        <button
          type="button"
          className={`${outlineBtn} ml-auto min-w-11 px-2.5 text-[#b91c1c] dark:text-[#ffb4b4]`}
          aria-label={t.delete}
          title={t.delete}
          disabled={busy}
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </dialog>
  );
}

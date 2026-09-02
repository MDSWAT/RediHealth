"use client";

import type { FormEvent } from "react";
import { BellIcon, CalendarIcon, CheckCircleIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import type { FollowupItem } from "@/lib/types/patient";

interface PatientFollowupsTabProps {
  followups: FollowupItem[];
  showAddFollowup: boolean;
  onToggleShowAddFollowup: () => void;
  newFollowupTitle: string;
  onChangeNewFollowupTitle: (value: string) => void;
  newFollowupDate: string;
  onChangeNewFollowupDate: (value: string) => void;
  newFollowupNotes: string;
  onChangeNewFollowupNotes: (value: string) => void;
  newFollowupReminder: boolean;
  onChangeNewFollowupReminder: (value: boolean) => void;
  onAddFollowup: (e: FormEvent) => void;
  onToggleFollowupStatus: (id: string, newStatus: FollowupItem["status"]) => void;
  onDeleteFollowup: (id: string) => void;
}

export function PatientFollowupsTab({
  followups,
  showAddFollowup,
  onToggleShowAddFollowup,
  newFollowupTitle,
  onChangeNewFollowupTitle,
  newFollowupDate,
  onChangeNewFollowupDate,
  newFollowupNotes,
  onChangeNewFollowupNotes,
  newFollowupReminder,
  onChangeNewFollowupReminder,
  onAddFollowup,
  onToggleFollowupStatus,
  onDeleteFollowup,
}: PatientFollowupsTabProps) {
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Care Follow-ups & Reminders
          </h3>
          <p className="text-xs text-muted-foreground">
            Schedule check-ins, call reminders, or consultation appointments.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleShowAddFollowup}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Follow-up</span>
        </button>
      </div>

      {showAddFollowup ? (
        <form
          onSubmit={onAddFollowup}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Schedule New Follow-Up
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Title / Purpose <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newFollowupTitle}
                onChange={(e) => onChangeNewFollowupTitle(e.target.value)}
                placeholder="e.g. Call to check symptom progress"
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newFollowupDate}
                onChange={(e) => onChangeNewFollowupDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Staff Notes
            </label>
            <input
              type="text"
              value={newFollowupNotes}
              onChange={(e) => onChangeNewFollowupNotes(e.target.value)}
              placeholder="Special instructions or phone script for worker..."
              className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newFollowupReminder}
                onChange={(e) => onChangeNewFollowupReminder(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>Set staff notification reminder</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleShowAddFollowup}
                className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-1 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Add Follow-up
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {followups.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
          <CalendarIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <span>No follow-ups scheduled yet. Click &quot;New Follow-up&quot; to add one.</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {followups.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-background p-3.5 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onToggleFollowupStatus(
                      item.id,
                      item.status === "completed" ? "scheduled" : "completed",
                    )
                  }
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    item.status === "completed"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-border hover:border-primary"
                  }`}
                  title="Toggle completion"
                >
                  {item.status === "completed" ? (
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                  ) : null}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        item.status === "completed"
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.status === "cancelled"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.reminder_set ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                        <BellIcon className="h-3 w-3" />
                        Reminder Set
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Date: <span className="font-semibold text-foreground">{item.date}</span>
                    {item.notes ? ` &bull; ${item.notes}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteFollowup(item.id)}
                className="self-end sm:self-auto rounded p-1 text-red-600 hover:bg-red-500/10"
                title="Delete follow-up"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CloseIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { MedicalHelpRequestItem, RequestPriority, RequestStatus } from "@/lib/types/medical-request";
import { CreatePatientModal } from "./CreatePatientModal";

interface RequestDetailModalProps {
  request: MedicalHelpRequestItem;
  onClose: () => void;
  onUpdate: (updatedRequest: MedicalHelpRequestItem) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenTemplates: () => void;
}

export function RequestDetailModal({
  request,
  onClose,
  onUpdate,
  onDelete,
  onOpenTemplates,
}: RequestDetailModalProps) {
  const [status, setStatus] = useState<RequestStatus>(request.status || "pending");
  const [priority, setPriority] = useState<RequestPriority>(request.priority || "normal");
  const [notes, setNotes] = useState<string>(request.internal_notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

  async function handleSaveChanges() {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/medical-help-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: request.id,
          status,
          priority,
          internal_notes: notes.trim() || null,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update request.");
        return;
      }

      setSaveSuccess(true);
      onUpdate({
        ...request,
        status,
        priority,
        internal_notes: notes.trim() || null,
      });

      setTimeout(() => setSaveSuccess(false), 2500);
    } catch {
      setErrorMessage("An error occurred while saving changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(request.id);
      onClose();
    } catch {
      setErrorMessage("Failed to delete request.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Request #{request.id}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  status === "pending"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : status === "in_progress"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    : status === "resolved"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                {status.replace("_", " ")}
              </span>
              {priority === "urgent" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-600 dark:text-red-400">
                  <AlertCircleIcon className="h-3 w-3" />
                  Urgent
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-foreground mt-1">
              {request.full_name || "Unnamed Requester"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Received on{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "full",
                timeStyle: "short",
              }).format(new Date(request.created_at))}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Changes saved successfully!</span>
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-muted/30 p-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Phone
              </p>
              <a
                href={`tel:${request.phone}`}
                className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>{request.phone}</span>
              </a>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Email
              </p>
              <a
                href={`mailto:${request.email}`}
                className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <MailIcon className="h-4 w-4" />
                <span>{request.email}</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" />
              <span>Patient Enquiry / Description</span>
            </h3>
            <div className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {request.description}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Update Request Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RequestStatus)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="pending">Pending (Needs Action)</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Set Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as RequestPriority)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="normal">Normal Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <EditIcon className="h-4 w-4 text-primary" />
              <span>Internal Worker Notes (Staff Confidential)</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record worker actions taken, phone attempt logs, or internal comments here..."
              className="w-full rounded-xl border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="text-xs">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <UsersIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Patient Profile Management</span>
              </p>
              <p className="text-muted-foreground mt-0.5">
                {createdPatientId
                  ? "Patient profile created! Click to open profile page."
                  : "Convert this request into a permanent patient record in the Patients directory."}
              </p>
            </div>
            {createdPatientId ? (
              <Link
                href={`/panel/patients/${createdPatientId}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <UsersIcon className="h-4 w-4" />
                <span>View Patient Profile</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreatePatient(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap self-start sm:self-auto"
              >
                <UsersIcon className="h-4 w-4" />
                <span>Create Patient Profile</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-soft p-3.5">
            <div className="text-xs">
              <p className="font-semibold text-foreground">Need to reply to this requester?</p>
              <p className="text-muted-foreground">Choose a template and send it by email.</p>
            </div>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
            >
              <MailIcon className="h-3.5 w-3.5" />
              <span>Quick Templates</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-red-600 dark:text-red-400">
                Are you sure?
              </span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete Request</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveChanges}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {showCreatePatient ? (
        <CreatePatientModal
          request={request}
          onClose={() => setShowCreatePatient(false)}
          onSuccess={(saved) => {
            setCreatedPatientId(saved.id);
            setShowCreatePatient(false);
          }}
        />
      ) : null}
    </div>
  );
}

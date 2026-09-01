"use client";

import { useState } from "react";
import { CheckCircleIcon, CloseIcon, StethoscopeIcon } from "@/components/ui/icons";
import type { CreateWorkerPayload, WorkerItem, WorkerStatus } from "@/lib/types/worker";

interface CreateWorkerModalProps {
  worker?: WorkerItem;
  onClose: () => void;
  onSuccess: (savedWorker: WorkerItem) => void;
}

export function CreateWorkerModal({
  worker,
  onClose,
  onSuccess,
}: CreateWorkerModalProps) {
  const isEditing = Boolean(worker);

  const [fullName, setFullName] = useState(worker?.full_name || "");
  const [email, setEmail] = useState(worker?.email || "");
  const [phone, setPhone] = useState(worker?.phone || "");
  const [role, setRole] = useState(worker?.role || "Healthcare Worker");
  const [department, setDepartment] = useState(worker?.department || "");
  const [status, setStatus] = useState<WorkerStatus>(worker?.status || "active");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const payload: CreateWorkerPayload = {
      id: worker?.id,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      role: role.trim() || "Healthcare Worker",
      department: department.trim() || undefined,
      status,
    };

    try {
      const url = "/api/workers";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        id?: number;
        success?: boolean;
      };

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save worker profile.");
        return;
      }

      setSaveSuccess(true);

      const savedWorker: WorkerItem = {
        id: String(data.id || worker?.id || "0"),
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone || null,
        role: payload.role || "Healthcare Worker",
        department: payload.department || null,
        status: payload.status || "active",
        assigned_patients_count: worker?.assigned_patients_count || 0,
        created_at: worker?.created_at || new Date().toISOString(),
      };

      onSuccess(savedWorker);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setErrorMessage("An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <StethoscopeIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEditing ? "Edit Staff Worker" : "Add New Staff Worker"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Healthcare worker profile and role details
              </p>
            </div>
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
            <span>Worker profile saved successfully!</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground mb-1 block">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Alex Munteanu"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground mb-1 block">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@redihealth.org"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0722 123 456"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground mb-1 block">
                Role / Title
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Healthcare Worker">Healthcare Worker</option>
                <option value="Doctor">Doctor / Physician</option>
                <option value="Mediator">Mediator</option>
                <option value="Nurse">Nurse Specialist</option>
                <option value="Case Worker">Case Worker</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                Department / Specialty
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Cardiology, Primary Care"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as WorkerStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="active">Active Staff</option>
              <option value="inactive">Inactive Staff</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Worker"
                : "Create Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

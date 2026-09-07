"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckCircleIcon, CloseIcon, UserIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";

interface PatientModalProps {
  request?: MedicalHelpRequestItem;
  patient?: PatientItem;
  workers?: WorkerItem[];
  onClose: () => void;
  onSuccess?: (patient: PatientItem) => void;
}

export function CreatePatientModal({
  request,
  patient,
  workers: initialWorkers,
  onClose,
  onSuccess,
}: PatientModalProps) {
  const { lang } = useLanguage();
  const t = createPatientModalTranslations[lang];

  const isEditing = Boolean(patient);
  const dialogTitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const [fullName, setFullName] = useState(
    patient?.full_name || request?.full_name || "",
  );
  const [phone, setPhone] = useState(patient?.phone || request?.phone || "");
  const [email, setEmail] = useState(patient?.email || request?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(patient?.date_of_birth || "");
  const [gender, setGender] = useState(patient?.gender || "");
  const [address, setAddress] = useState(patient?.address || "");
  const [conditionNotes, setConditionNotes] = useState(
    patient?.condition_notes ||
      (request
        ? `Request: ${request.description}${
            request.internal_notes ? `\n\nNotes: ${request.internal_notes}` : ""
          }`
        : ""),
  );
  const [medicalHistory, setMedicalHistory] = useState(
    patient?.medical_history || "",
  );
  const [status, setStatus] = useState<PatientStatus>(
    patient?.status || "active",
  );
  const [priority, setPriority] = useState<PatientPriority>(
    patient?.priority || "moderate",
  );
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>(
    patient?.assigned_worker_ids && patient.assigned_worker_ids.length > 0
      ? patient.assigned_worker_ids
      : patient?.assigned_worker_id
      ? [patient.assigned_worker_id]
      : [],
  );
  const [workersList, setWorkersList] = useState<WorkerItem[]>(
    initialWorkers || [],
  );
  const [workerSearchQuery, setWorkerSearchQuery] = useState("");
  const [showOnlySelectedWorkers, setShowOnlySelectedWorkers] = useState(false);

  const filteredWorkers = useMemo(() => {
    const query = workerSearchQuery.trim().toLowerCase();
    const byQuery = !query
      ? workersList
      : workersList.filter((worker) => {
          const haystack = `${worker.full_name} ${worker.role} ${worker.email || ""}`.toLowerCase();
          return haystack.includes(query);
        });

    if (!showOnlySelectedWorkers) {
      return byQuery;
    }

    return byQuery.filter((worker) => assignedWorkerIds.includes(worker.id));
  }, [workersList, workerSearchQuery, showOnlySelectedWorkers, assignedWorkerIds]);

  const selectedWorkers = useMemo(() => {
    const byId = new Map(workersList.map((worker) => [worker.id, worker]));
    return assignedWorkerIds
      .map((id) => byId.get(id))
      .filter((worker): worker is WorkerItem => Boolean(worker));
  }, [workersList, assignedWorkerIds]);

  function selectAllVisibleWorkers() {
    if (filteredWorkers.length === 0) {
      return;
    }
    setAssignedWorkerIds((current) => {
      const next = new Set(current);
      for (const worker of filteredWorkers) {
        next.add(worker.id);
      }
      return [...next];
    });
  }

  function removeSelectedWorker(workerId: string) {
    setAssignedWorkerIds((current) => current.filter((id) => id !== workerId));
  }

  useEffect(() => {
    if (!initialWorkers || initialWorkers.length === 0) {
      void fetch("/api/workers")
        .then((res) => res.json())
        .then((data: { workers?: WorkerItem[] }) => {
          if (Array.isArray(data.workers)) {
            setWorkersList(data.workers);
          }
        })
        .catch(() => {});
    }
  }, [initialWorkers]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setSaveSuccess(false);

    const payload = {
      id: patient?.id,
      request_id: request?.id || patient?.request_id,
      assigned_worker_id: assignedWorkerIds[0] || undefined,
      assigned_worker_ids: assignedWorkerIds,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      date_of_birth: dateOfBirth.trim() || undefined,
      gender: gender.trim() || undefined,
      address: address.trim() || undefined,
      condition_notes: conditionNotes.trim() || undefined,
      medical_history: medicalHistory.trim() || undefined,
      status,
      priority,
    };

    try {
      const url = "/api/patients";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        id?: number;
        access_token?: string;
        success?: boolean;
        email_sent?: boolean;
        warning?: string;
      };

      if (!response.ok) {
        setErrorMessage(data.error || t.errSave);
        return;
      }

      if (data.email_sent === false) {
        setWarningMessage(data.warning || t.warnEmail);
      }

      setSaveSuccess(true);

      const matchedWorkers = workersList.filter((w) => assignedWorkerIds.includes(w.id));

      const savedPatient: PatientItem = {
        id: String(data.id || patient?.id || "0"),
        request_id: payload.request_id ? String(payload.request_id) : null,
        assigned_worker_id: assignedWorkerIds[0] || null,
        assigned_worker_ids: assignedWorkerIds,
        assigned_worker_name: matchedWorkers[0]?.full_name || null,
        assigned_worker_names: matchedWorkers.map((w) => w.full_name),
        access_token: data.access_token || patient?.access_token || null,
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email,
        date_of_birth: payload.date_of_birth || null,
        gender: payload.gender || null,
        address: payload.address || null,
        condition_notes: payload.condition_notes || null,
        medical_history: payload.medical_history || null,
        status: payload.status,
        priority: payload.priority,
        created_at: patient?.created_at || new Date().toISOString(),
      };

      if (onSuccess) {
        onSuccess(savedPatient);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="relative my-4 w-full max-w-4xl rounded-2xl border border-border bg-card p-4 shadow-xl sm:my-0 sm:p-6"
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 id={dialogTitleId} className="text-lg font-bold text-foreground">
                {isEditing ? t.titleEdit : t.titleCreate}
              </h2>
              <p className="text-xs text-muted-foreground">
                {request
                  ? t.convertedFrom(String(request.id))
                  : t.subtitleCreate}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t.close}
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
            <span>
              {isEditing
                ? t.successEdit
                : t.successCreate}
            </span>
          </div>
        ) : null}

        {warningMessage ? (
          <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300">
            {warningMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.dob}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.gender}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.selectGender}</option>
                <option value="Female">{t.female}</option>
                <option value="Male">{t.male}</option>
                <option value="Other">{t.other}</option>
                <option value="Prefer not to say">{t.preferNot}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.patientStatus}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">{t.activeCare}</option>
                <option value="inactive">{t.inactive}</option>
                <option value="archived">{t.archived}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PatientPriority)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="critical">{t.pCritical}</option>
                <option value="high">{t.pHigh}</option>
                <option value="moderate">{t.pModerate}</option>
                <option value="low">{t.pLow}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.assignedWorker}
              </label>
              <div className="rounded-lg border border-border bg-background p-2.5">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    {assignedWorkerIds.length > 0
                      ? `${assignedWorkerIds.length} selected`
                      : t.unassigned}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllVisibleWorkers}
                      className="text-primary hover:underline disabled:opacity-50"
                      disabled={filteredWorkers.length === 0}
                    >
                      Select visible
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedWorkerIds([])}
                      className="text-primary hover:underline disabled:opacity-50"
                      disabled={assignedWorkerIds.length === 0}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                {selectedWorkers.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedWorkers.slice(0, 5).map((worker) => (
                      <button
                        key={worker.id}
                        type="button"
                        onClick={() => removeSelectedWorker(worker.id)}
                        className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                        title="Remove selection"
                      >
                        {worker.full_name}
                      </button>
                    ))}
                    {selectedWorkers.length > 5 ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        +{selectedWorkers.length - 5} more
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <input
                  type="text"
                  value={workerSearchQuery}
                  onChange={(event) => setWorkerSearchQuery(event.target.value)}
                  placeholder="Search doctor or role..."
                  className="mb-2 w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <label className="mb-2 flex items-center gap-1.5 px-0.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={showOnlySelectedWorkers}
                    onChange={(event) => setShowOnlySelectedWorkers(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-ring"
                  />
                  Show selected only
                </label>
                {workersList.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">{t.unassigned}</p>
                ) : filteredWorkers.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">No matches for this search.</p>
                ) : (
                  <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                    {filteredWorkers.map((w) => {
                      const isSelected = assignedWorkerIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-xs text-foreground hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setAssignedWorkerIds((current) =>
                                current.includes(w.id)
                                  ? current.filter((id) => id !== w.id)
                                  : [...current, w.id],
                              );
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-ring"
                          />
                          <span className="leading-5">{w.full_name} ({w.role})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.address}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.addressPh}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.condition}
            </label>
            <textarea
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder={t.conditionPh}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.history}
            </label>
            <textarea
              rows={3}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder={t.historyPh}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
            >
              {isSubmitting
                ? t.saving
                : isEditing
                ? t.update
                : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

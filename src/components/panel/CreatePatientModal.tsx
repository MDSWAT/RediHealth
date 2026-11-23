"use client";

import { usePanelRouter as useRouter, usePanelRuntime } from "./PanelRuntime";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { createPatientModalTranslations } from "@/lib/i18n/panel-component-translations";
import type { MedicalHelpRequestItem } from "@/lib/types/medical-request";
import type { PatientIntake, PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import type { WorkerItem } from "@/lib/types/worker";
import { ROMANIAN_COUNTIES } from "@/lib/romanian-counties";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { PatientIntakeFields } from "./PatientIntakeFields";
import { normalizePatientFromApi } from "@/lib/api-normalizers";
import { patientWizardTranslations } from "@/lib/i18n/patient-wizard-translations";

interface PatientModalProps {
  request?: MedicalHelpRequestItem;
  patient?: PatientItem;
  workers?: WorkerItem[];
  isRomania: boolean;
  isAdmin?: boolean;
  onClose: () => void;
  onSuccess?: (patient: PatientItem) => void;
}

export function CreatePatientModal({
  request,
  patient,
  workers: initialWorkers,
  isRomania,
  onClose,
  onSuccess,
  isAdmin = false,
}: PatientModalProps) {
  const { lang } = useLanguage();
  const { request: fetch, offline } = usePanelRuntime();
  const t = createPatientModalTranslations[lang];
  const crm = crmTranslations[lang];
  const intakeCopy = patientIntakeTranslations[lang];
  const wizard = patientWizardTranslations[lang];
  const router = useRouter();

  const isEditing = Boolean(patient);
  const dialogTitleId = useId();
  const formId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);

  const [fullName, setFullName] = useState(
    patient?.full_name || request?.full_name || "",
  );
  const [phone, setPhone] = useState(patient?.phone || request?.phone || "");
  const [email, setEmail] = useState(patient?.email || request?.email || "");
  const [dateOfBirth, setDateOfBirth] = useState(patient?.date_of_birth || "");
  const [gender, setGender] = useState(patient?.gender || "");
  const [address, setAddress] = useState(patient?.address || "");
  const [county, setCounty] = useState(patient?.county || request?.county || "");
  const [intake, setIntake] = useState<PatientIntake>(patient?.intake || { has_documents: false, documents: [], location: null });
  const [intakeBusy, setIntakeBusy] = useState(false);
  const [conditionNotes, setConditionNotes] = useState(
    patient?.condition_notes ||
      (request
        ? `${t.prefillRequest}: ${request.description}${
            request.internal_notes ? `\n\n${t.prefillNotes}: ${request.internal_notes}` : ""
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
  const [workersLoading, setWorkersLoading] = useState(isAdmin && !initialWorkers);
  const [workersError, setWorkersError] = useState(false);
  const [workersRetry, setWorkersRetry] = useState(0);

  const filteredWorkers = useMemo(() => {
    const query = workerSearchQuery.trim().toLowerCase();
    return !query
      ? workersList
      : workersList.filter((worker) => {
          const haystack = `${worker.full_name} ${worker.role} ${worker.email || ""} ${worker.county || ""}`.toLowerCase();
          return haystack.includes(query);
        });
  }, [workersList, workerSearchQuery]);

  const selectedWorkers = useMemo(() => {
    const byId = new Map(workersList.map((worker) => [worker.id, worker]));
    return assignedWorkerIds
      .map((id) => byId.get(id))
      .filter((worker): worker is WorkerItem => Boolean(worker));
  }, [workersList, assignedWorkerIds]);

  function removeSelectedWorker(workerId: string) {
    setAssignedWorkerIds((current) => current.filter((id) => id !== workerId));
  }

  useEffect(() => {
    if (!isAdmin || initialWorkers) return;
    let cancelled = false;
    async function loadWorkers() {
      setWorkersLoading(true);
      setWorkersError(false);
      try {
        const response = await fetch("/api/workers");
        if (!response.ok) throw new Error("Unable to load care team");
        const data: { workers?: WorkerItem[] } = await response.json();
        if (!Array.isArray(data.workers)) throw new Error("Invalid care team response");
        if (!cancelled) setWorkersList(data.workers);
      } catch {
        if (!cancelled) setWorkersError(true);
      } finally {
        if (!cancelled) setWorkersLoading(false);
      }
    }
    void loadWorkers();
    return () => { cancelled = true; };
  }, [initialWorkers, isAdmin, fetch, workersRetry]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting && !intakeBusy) {
        onClose();
      }
      if (event.key === "Tab") {
        const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], summary',
        ) || []).filter((element) => element.getClientRects().length > 0);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isSubmitting, intakeBusy]);

  function goToStep(next: number) {
    if (isSubmitting || intakeBusy) return;
    if (next > 0) {
      const invalid = Array.from(formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-patient-contact] input, [data-patient-contact] select') || [])
        .find((field) => !field.validity.valid || (field.required && !field.value.trim()));
      if (invalid) {
        if (invalid.required && !invalid.value.trim()) invalid.setCustomValidity(wizard.required);
        setStep(0);
        requestAnimationFrame(() => { invalid.focus(); invalid.reportValidity(); });
        return;
      }
    }
    setStep(next);
    setFurthestStep((current) => Math.max(current, next));
    setErrorMessage(null);
    requestAnimationFrame(() => { formRef.current?.scrollTo(0, 0); stepHeadingRef.current?.focus(); });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting || intakeBusy) return;
    if (!isEditing && step < 2) { goToStep(step + 1); return; }
    if (!isEditing) {
      const invalid = Array.from(formRef.current?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea") || [])
        .find((field) => !field.validity.valid || (field.required && !field.value.trim()));
      if (invalid) {
        if (invalid.required && !invalid.value.trim()) invalid.setCustomValidity(wizard.required);
        setStep(invalid.closest("[data-patient-contact]") ? 0 : 1);
        requestAnimationFrame(() => { invalid.focus(); invalid.reportValidity(); });
        return;
      }
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setSaveSuccess(false);

    const payload = {
      id: patient?.id,
      request_id: request?.id || patient?.request_id,
      assigned_worker_id: isAdmin ? assignedWorkerIds[0] || undefined : undefined,
      assigned_worker_ids: isAdmin ? assignedWorkerIds : undefined,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      date_of_birth: dateOfBirth.trim() || undefined,
      gender: gender.trim() || undefined,
      address: address.trim() || undefined,
      county: isRomania && county ? county : undefined,
      intake,
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
        headers: { "Content-Type": "application/json", [REQUEST_LANG_HEADER]: lang },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        error?: string;
        id?: number;
        email_sent?: boolean;
        warning?: string;
        patient?: unknown;
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
        ...patient,
        id: String(data.id || patient?.id || "0"),
        request_id: payload.request_id ? String(payload.request_id) : null,
        assigned_worker_id: assignedWorkerIds[0] || null,
        assigned_worker_ids: assignedWorkerIds,
        assigned_worker_name: matchedWorkers[0]?.full_name || null,
        assigned_worker_names: matchedWorkers.map((w) => w.full_name),
        has_portal_access: true,
        full_name: payload.full_name,
        phone: payload.phone,
        email: payload.email,
        date_of_birth: payload.date_of_birth || null,
        gender: payload.gender || null,
        address: payload.address || null,
        county: payload.county || null,
        intake: payload.intake,
        condition_notes: payload.condition_notes || null,
        medical_history: payload.medical_history || null,
        status: payload.status,
        priority: payload.priority,
        created_at: patient?.created_at || new Date().toISOString(),
      };

      onSuccess?.(normalizePatientFromApi(data.patient) || savedPatient);
      if (!isEditing && data.id) {
        if (data.email_sent === false && !offline) sessionStorage.setItem(`patient-portal-warning:${data.id}`, "1");
        router.push(withLangPrefix(`/panel/patients/${data.id}`, lang));
      } else {
        onClose();
      }

    } catch {
      setErrorMessage(t.errUnexpected);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="panel-scrim fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-0 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="app-sheet-slide-up relative flex h-dvh min-h-0 w-full max-w-3xl flex-col overflow-hidden border-[var(--panel-line)] bg-[var(--panel-surface)] text-[var(--panel-ink)] shadow-2xl sm:h-auto sm:max-h-[min(850px,calc(100dvh-2rem))] sm:rounded-2xl sm:border"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--panel-line)] bg-[var(--panel-subtle)] p-5 sm:items-center sm:px-6">
          <div className="min-w-0">
            <h2 id={dialogTitleId} className="text-base font-bold text-[var(--panel-ink)] sm:text-lg">
              {isEditing ? t.titleEdit : t.titleCreate}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--panel-muted)] break-words">
              {request ? t.convertedFrom(String(request.id)) : t.subtitleCreate}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isSubmitting || intakeBusy}
            aria-label={t.close}
            className="inline-flex h-11 w-11 min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-[var(--panel-muted)] transition-colors hover:bg-[var(--panel-selection)] hover:text-[var(--panel-ink)]"
          >
            <CloseIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {!isEditing && <nav aria-label={wizard.progress} className="shrink-0 border-b border-[var(--panel-line)] bg-[var(--panel-surface)] px-4 sm:px-6">
          <ol className="flex overflow-x-auto divide-x divide-[var(--panel-line)]">
            {wizard.steps.map((label, index) => <li key={label} className="shrink-0 sm:flex-1">
              <button
                type="button"
                disabled={index > furthestStep || isSubmitting || intakeBusy}
                onClick={() => goToStep(index)}
                aria-current={step === index ? "step" : undefined}
                className={`relative flex h-full min-h-12 w-full items-center gap-2 whitespace-nowrap px-3.5 py-3 text-left text-xs font-medium leading-snug transition-colors disabled:cursor-default ${
                  step === index
                    ? "bg-[var(--panel-selection)] font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]"
                    : index < step
                    ? "text-[var(--panel-ink)] hover:bg-[var(--panel-subtle)]"
                    : "text-[var(--panel-muted)]"
                }`}
              >
                <span className="shrink-0 font-display tabular-nums font-semibold">
                  {index + 1}.
                </span>
                <span>{label}</span>
                {step === index ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-sapphire)] dark:bg-[#bad7fa]"
                  />
                ) : null}
              </button>
            </li>)}
          </ol>
        </nav>}

        {errorMessage ? (
          <div role="alert" className="mx-5 mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-medium text-[#b91c1c] dark:text-[#ffb4b4]">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div role="status" className="mx-5 mt-4 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-4 py-3 text-xs font-medium text-[var(--panel-ink)]">
            {isEditing ? t.successEdit : t.successCreate}
          </div>
        ) : null}

        {warningMessage ? (
          <div role="status" className="mx-5 mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-medium text-[#9a4d0b] dark:text-[#f5c58e]">
            {warningMessage}
          </div>
        ) : null}

        <form ref={formRef} id={formId} noValidate={!isEditing} onSubmit={handleSubmit} onInput={(event) => {
          if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) event.target.setCustomValidity("");
        }} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {!isEditing && <div>
            <h3 ref={stepHeadingRef} tabIndex={-1} className="sr-only">{wizard.steps[step]}</h3>
            <p className="text-sm leading-relaxed text-[var(--panel-muted)]">{wizard.hints[step]}</p>
          </div>}
          <div data-patient-contact hidden={!isEditing && step !== 0} className="space-y-4">
          {isEditing &&
          <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{intakeCopy.contact}</h3>
          }
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isRomania ? (
              <div>
                <label htmlFor={`${formId}-county`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                  {t.county} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
                </label>
                <select
                  id={`${formId}-county`}
                  required={!isEditing || Boolean(patient?.county)}
                  value={county}
                  onChange={(event) => setCounty(event.target.value)}
                  className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t.selectCounty}</option>
                  {ROMANIAN_COUNTIES.map((countyName) => <option key={countyName} value={countyName}>{countyName}</option>)}
                </select>
              </div>
            ) : null}
            <div className={isRomania ? undefined : "sm:col-span-2"}>
              <label htmlFor={`${formId}-name`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.fullName} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePh}
                className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-phone`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.phone} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
              </label>
              <input
                type="tel"
                id={`${formId}-phone`}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-display tabular-nums text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-email`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.email} <span aria-hidden="true" className="text-[#b91c1c] dark:text-[#ffb4b4]">*</span>
              </label>
              <input
                type="email"
                id={`${formId}-email`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          </div>

          <div hidden={!isEditing && step !== 1} className="space-y-5">
          <div className="space-y-3 border-t border-[var(--panel-line)] pt-5">
            <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{intakeCopy.care}</h3>
            <div>
              <label htmlFor={`${formId}-condition`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.condition}
              </label>
              <textarea
                id={`${formId}-condition`}
                rows={3}
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder={t.conditionPh}
                className="w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] p-3 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${formId}-address`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">{t.address}</label>
            <input id={`${formId}-address`} type="text" value={address} onChange={(event) => setAddress(event.target.value)} placeholder={t.addressPh}
              className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <PatientIntakeFields value={intake} onChange={setIntake} disabled={isSubmitting} onBusyChange={setIntakeBusy} />

          <section aria-labelledby={`${formId}-personal`} className="space-y-4 border-t border-[var(--panel-line)] pt-5">
            <div><h4 id={`${formId}-personal`} className="text-sm font-semibold text-[var(--panel-ink)]">{wizard.personal}</h4><p className="mt-0.5 text-xs text-[var(--panel-muted)]">{wizard.personalHint}</p></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-dob`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.dob}
              </label>
              <input
                id={`${formId}-dob`}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm tabular-nums text-[var(--panel-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-gender`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.gender}
              </label>
              <select
                id={`${formId}-gender`}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.selectGender}</option>
                <option value="Female">{t.female}</option>
                <option value="Male">{t.male}</option>
                <option value="Other">{t.other}</option>
                <option value="Prefer not to say">{t.preferNot}</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor={`${formId}-history`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">{t.history}</label>
            <textarea id={`${formId}-history`} rows={3} value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder={t.historyPh} className="w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] p-3 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          </section>

          <section aria-labelledby={`${formId}-care`} className="space-y-4 border-t border-[var(--panel-line)] pt-5">
            <div><h4 id={`${formId}-care`} className="text-sm font-semibold text-[var(--panel-ink)]">{wizard.care}</h4><p className="mt-0.5 text-xs text-[var(--panel-muted)]">{wizard.careHint}</p></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-status`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.patientStatus}
              </label>
              <select
                id={`${formId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm text-[var(--panel-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">{t.activeCare}</option>
                <option value="inactive">{t.inactive}</option>
                <option value="archived">{t.archived}</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-priority`} className="mb-1 block text-xs font-semibold text-[var(--panel-ink)]">
                {t.priority}
              </label>
              <select
                id={`${formId}-priority`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as PatientPriority)}
                className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3.5 py-2 text-sm font-medium text-[var(--panel-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="critical">{t.pCritical}</option>
                <option value="high">{t.pHigh}</option>
                <option value="moderate">{t.pModerate}</option>
                <option value="low">{t.pLow}</option>
              </select>
            </div>
          </div>
          </section>

            {isAdmin ? (
            <section aria-labelledby={`${formId}-team`} className="space-y-4 border-t border-[var(--panel-line)] pt-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1"><h4 id={`${formId}-team`} className="text-sm font-semibold text-[var(--panel-ink)]">{wizard.team}</h4><p className="mt-0.5 text-xs leading-relaxed text-[var(--panel-muted)]">{wizard.teamHint}</p></div>
                  <span aria-live="polite" className="shrink-0 whitespace-nowrap text-xs font-medium font-display tabular-nums text-[var(--panel-muted)]">{assignedWorkerIds.length} {crm.selected}</span>
                </div>
                {assignedWorkerIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignedWorkerIds.map((id) => {
                      const worker = workersList.find((item) => item.id === id);
                      return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => removeSelectedWorker(id)}
                        aria-label={`${crm.removeSelection}: ${worker?.full_name || id}`}
                        className="inline-flex min-h-11 max-w-full items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-selection)] px-3 py-2 text-sm font-medium text-[var(--panel-ink)] transition-colors hover:bg-[var(--panel-subtle)]"
                      >
                        <span className="truncate">{worker?.full_name || id}</span><CloseIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                      </button>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-[var(--panel-muted)]">{wizard.emptyTeam}</p>}
                <label htmlFor={`${formId}-worker-search`} className="block text-xs font-semibold text-[var(--panel-ink)]">{wizard.searchTeam}</label>
                <input
                  id={`${formId}-worker-search`}
                  type="search"
                  value={workerSearchQuery}
                  onChange={(event) => setWorkerSearchQuery(event.target.value)}
                  placeholder={wizard.searchTeam}
                  className="min-h-11 w-full rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3 py-2 text-sm text-[var(--panel-ink)] placeholder:text-[var(--panel-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {workersLoading ? <p role="status" className="text-sm text-[var(--panel-muted)]">{wizard.loadingTeam}</p>
                : workersError ? <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-[#b91c1c] dark:text-[#ffb4b4]">
                  <p>{wizard.teamError}</p><button type="button" onClick={() => setWorkersRetry((value) => value + 1)} className="inline-flex min-h-11 items-center whitespace-nowrap font-semibold underline">{wizard.retry}</button>
                </div>
                : workersList.length === 0 ? (
                  <p className="py-1.5 text-xs text-[var(--panel-muted)]">{t.unassigned}</p>
                ) : filteredWorkers.length === 0 ? (
                  <p role="status" className="py-3 text-sm text-[var(--panel-muted)]">{crm.noMatches}</p>
                ) : (
                  <div role="group" aria-labelledby={`${formId}-team`} className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto p-1 sm:grid-cols-2">
                    {filteredWorkers.map((w) => {
                      const isSelected = assignedWorkerIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className={`flex min-h-20 min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                            isSelected
                              ? "border-[var(--panel-selected-border,#9eb4cc)] bg-[var(--panel-selection)]"
                              : "border-[var(--panel-line)] bg-[var(--panel-surface)] hover:bg-[var(--panel-subtle)]"
                          }`}
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
                            className="h-5 w-5 shrink-0 rounded border-[var(--color-border-control,#8a94a6)] accent-primary focus:ring-ring"
                          />
                          <span className="min-w-0">
                            <span className="block break-words font-semibold text-[var(--panel-ink)]">{w.full_name}</span>
                            <span className="mt-1 block break-words text-xs text-[var(--panel-muted)]">{w.role}{w.county ? ` · ${w.county}` : ""}</span>
                            <span className="mt-1 block break-all text-xs text-[var(--panel-muted)]">{w.email}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
            </section>
            ) : null}
          </div>
          {!isEditing && step === 2 && <div className="space-y-5">
            <div className="rounded-xl border border-[var(--panel-line)] bg-[var(--panel-selection)] p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--color-sapphire)] dark:text-[#bad7fa]">{wizard.ready}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-xl font-bold text-[var(--panel-ink)]">{fullName}</p>
                  <p className="mt-1 break-all text-sm text-[var(--panel-ink)]"><span className="font-display tabular-nums">{phone}</span> · {email}</p>
                  {county && <p className="mt-1 text-sm text-[var(--panel-muted)]">{county}</p>}
                </div>
                <button type="button" onClick={() => goToStep(0)} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-sm font-semibold text-primary hover:underline dark:text-[#bad7fa]">{wizard.edit}</button>
              </div>
            </div>
            <section className="border-t border-[var(--panel-line)] pt-5">
              <div className="mb-4 flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-[var(--panel-ink)]">{wizard.steps[1]}</h4><button type="button" onClick={() => goToStep(1)} className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-sm font-semibold text-primary hover:underline dark:text-[#bad7fa]">{wizard.edit}</button></div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {([
                  [t.address, address], [t.condition, conditionNotes], [t.history, medicalHistory],
                  [t.dob, dateOfBirth], [t.gender, gender ? ({ Female: t.female, Male: t.male, Other: t.other, "Prefer not to say": t.preferNot }[gender] || gender) : ""],
                  [t.patientStatus, status === "active" ? t.activeCare : status === "inactive" ? t.inactive : t.archived],
                  [t.priority, priority === "critical" ? t.pCritical : priority === "high" ? t.pHigh : priority === "low" ? t.pLow : t.pModerate],
                  ...(isAdmin ? [[t.assignedWorker, selectedWorkers.map((worker) => worker.full_name).join(", ")]] : []),
                  [intakeCopy.documents, intake.has_documents ? intakeCopy.hasDocuments : intakeCopy.noDocuments],
                  [wizard.gps, intake.location ? `${intake.location.latitude.toFixed(6)}, ${intake.location.longitude.toFixed(6)}` : ""],
                ]).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs font-medium text-[var(--panel-muted)]">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-[var(--panel-ink)]">{value || wizard.empty}</dd></div>)}
              </dl>
              {intake.documents.length > 0 && <div className="mt-4 border-t border-[var(--panel-line)] pt-4"><h4 className="text-xs font-medium text-[var(--panel-muted)]">{wizard.documents} (<span className="font-display tabular-nums">{intake.documents.length}</span>)</h4><ul className="mt-2 divide-y divide-[var(--panel-line)] border-t border-[var(--panel-line)]">{intake.documents.map((document) => <li key={document.id} className="break-words py-2 text-sm text-[var(--panel-ink)]">{document.name} · <span className="text-[var(--panel-muted)]">{document.category === "identity" ? intakeCopy.identity : intakeCopy.medical}</span></li>)}</ul></div>}
            </section>
          </div>}
        </form>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--panel-line)] bg-[var(--panel-surface)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <button
              type="button"
              onClick={() => !isEditing && step > 0 ? goToStep(step - 1) : onClose()}
              disabled={isSubmitting || intakeBusy}
              className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)]"
            >
              {!isEditing && step > 0 ? <><ArrowLeftIcon aria-hidden="true" className="h-4 w-4 shrink-0" /><span>{wizard.back}</span></> : t.cancel}
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSubmitting || intakeBusy}
              className="crm-button crm-primary flex-1 whitespace-nowrap sm:flex-none"
            >
              {isSubmitting
                ? t.saving
                : isEditing
                ? t.update
                : step === 2 ? t.create : <><span>{wizard.next}</span><ArrowRightIcon aria-hidden="true" className="h-4 w-4 shrink-0" /></>}
            </button>
          </div>
      </div>
    </div>
  );
}

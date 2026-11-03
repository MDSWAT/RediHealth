"use client";

import { usePanelRouter as useRouter, usePanelRuntime } from "./PanelRuntime";
import { REQUEST_LANG_HEADER, withLangPrefix } from "@/lib/i18n/routing";
import { crmTranslations } from "@/lib/i18n/crm-translations";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CloseIcon, UserIcon } from "@/components/ui/icons";
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
  }, [initialWorkers, fetch]);

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
        requestAnimationFrame(() => { invalid.closest("details")?.setAttribute("open", ""); invalid.focus(); invalid.reportValidity(); });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        className="app-sheet-slide-up relative flex h-dvh min-h-0 w-full max-w-3xl flex-col overflow-hidden border-border bg-card shadow-2xl sm:h-[min(850px,calc(100dvh-2rem))] sm:rounded-3xl sm:border"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border bg-muted/30 p-5 sm:items-center sm:px-6">
          <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <UserIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id={dialogTitleId} className="text-base font-bold text-foreground sm:text-lg">
                {isEditing ? t.titleEdit : t.titleCreate}
              </h2>
              <p className="text-xs text-muted-foreground break-words">
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
            disabled={isSubmitting || intakeBusy}
            aria-label={t.close}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {!isEditing && <nav aria-label={wizard.progress} className="shrink-0 border-b border-border bg-card px-4 py-4 sm:px-6">
          <ol className="grid grid-cols-3 gap-2">
            {wizard.steps.map((label, index) => <li key={label}>
              <button type="button" disabled={index > furthestStep || isSubmitting || intakeBusy} onClick={() => goToStep(index)} aria-current={step === index ? "step" : undefined}
                className={`flex w-full flex-col items-start gap-2 rounded-xl p-2 text-left text-xs font-semibold transition-colors disabled:cursor-default sm:flex-row sm:items-center ${step === index ? "bg-primary-soft text-primary" : index < step ? "text-primary" : "text-muted-foreground"}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${index <= step ? "bg-primary text-white" : "bg-muted"}`}>{index < step ? <CheckCircleIcon className="h-4 w-4" /> : index + 1}</span>{label}
              </button>
            </li>)}
          </ol>
        </nav>}

        {errorMessage ? (
          <div role="alert" className="mx-5 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        {saveSuccess ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>
              {isEditing
                ? t.successEdit
                : t.successCreate}
            </span>
          </div>
        ) : null}

        {warningMessage ? (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-medium text-amber-800 dark:text-amber-300">
            {warningMessage}
          </div>
        ) : null}

        <form ref={formRef} id={formId} noValidate={!isEditing} onSubmit={handleSubmit} onInput={(event) => {
          if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) event.target.setCustomValidity("");
        }} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
          {!isEditing && <div>
            <h3 ref={stepHeadingRef} tabIndex={-1} className="text-xl font-bold tracking-tight outline-none">{wizard.steps[step]}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{wizard.hints[step]}</p>
          </div>}
          <div data-patient-contact hidden={!isEditing && step !== 0} className="space-y-4">
          {isEditing &&
          <h3 className="text-sm font-bold text-foreground">{intakeCopy.contact}</h3>
          }
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isRomania ? (
              <div>
                <label htmlFor={`${formId}-county`} className="text-xs font-semibold text-foreground mb-1 block">
                  {t.county} <span className="text-red-500">*</span>
                </label>
                <select
                  id={`${formId}-county`}
                  required={!isEditing || Boolean(patient?.county)}
                  value={county}
                  onChange={(event) => setCounty(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t.selectCounty}</option>
                  {ROMANIAN_COUNTIES.map((countyName) => <option key={countyName} value={countyName}>{countyName}</option>)}
                </select>
              </div>
            ) : null}
            <div>
              <label htmlFor={`${formId}-name`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePh}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-phone`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id={`${formId}-phone`}
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePh}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor={`${formId}-email`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id={`${formId}-email`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPh}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          </div>

          <div hidden={!isEditing && step !== 1} className="space-y-5">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <h3 className="mb-3 text-sm font-bold text-foreground">{intakeCopy.care}</h3>
            <label htmlFor={`${formId}-condition`} className="text-xs font-semibold text-foreground mb-1 block">
              {t.condition}
            </label>
            <textarea
              id={`${formId}-condition`}
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder={t.conditionPh}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label htmlFor={`${formId}-address`} className="mb-1 block text-xs font-semibold text-foreground">{t.address}</label>
            <input id={`${formId}-address`} type="text" value={address} onChange={(event) => setAddress(event.target.value)} placeholder={t.addressPh}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <PatientIntakeFields value={intake} onChange={setIntake} disabled={isSubmitting} onBusyChange={setIntakeBusy} />

          <details open={isEditing} className="space-y-4 rounded-2xl border border-border p-4">
            <summary className="min-h-8 cursor-pointer text-sm font-semibold text-primary">{intakeCopy.more}</summary>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor={`${formId}-dob`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.dob}
              </label>
              <input
                id={`${formId}-dob`}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-gender`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.gender}
              </label>
              <select
                id={`${formId}-gender`}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.selectGender}</option>
                <option value="Female">{t.female}</option>
                <option value="Male">{t.male}</option>
                <option value="Other">{t.other}</option>
                <option value="Prefer not to say">{t.preferNot}</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-status`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.patientStatus}
              </label>
              <select
                id={`${formId}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value as PatientStatus)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">{t.activeCare}</option>
                <option value="inactive">{t.inactive}</option>
                <option value="archived">{t.archived}</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-priority`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.priority}
              </label>
              <select
                id={`${formId}-priority`}
                value={priority}
                onChange={(e) => setPriority(e.target.value as PatientPriority)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="critical">{t.pCritical}</option>
                <option value="high">{t.pHigh}</option>
                <option value="moderate">{t.pModerate}</option>
                <option value="low">{t.pLow}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {isAdmin ? (
            <div>
              <label htmlFor={`${formId}-history`} className="text-xs font-semibold text-foreground mb-1 block">
                {t.assignedWorker}
              </label>
              <div className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-foreground">
                    {assignedWorkerIds.length > 0
                      ? `${assignedWorkerIds.length} ${crm.selected}`
                      : t.unassigned}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllVisibleWorkers}
                      className="text-primary hover:underline disabled:opacity-50 font-semibold"
                      disabled={filteredWorkers.length === 0}
                    >
                      {crm.selectVisible}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignedWorkerIds([])}
                      className="text-primary hover:underline disabled:opacity-50 font-semibold"
                      disabled={assignedWorkerIds.length === 0}
                    >
                      {crm.clear}
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
                        className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                        title={crm.removeSelection}
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
                  placeholder={crm.selectWorkers}
                  className="mb-2 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <label className="mb-2 flex items-center gap-1.5 px-0.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlySelectedWorkers}
                    onChange={(event) => setShowOnlySelectedWorkers(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-ring"
                  />
                  {crm.selectedOnly}
                </label>
                {workersList.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">{t.unassigned}</p>
                ) : filteredWorkers.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-muted-foreground">{crm.noMatches}</p>
                ) : (
                  <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                    {filteredWorkers.map((w) => {
                      const isSelected = assignedWorkerIds.includes(w.id);
                      return (
                        <label
                          key={w.id}
                          className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
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
            ) : null}

          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.history}
            </label>
            <textarea
              id={`${formId}-history`}
              rows={3}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder={t.historyPh}
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          </details>
          </div>
          {!isEditing && step === 2 && <div className="space-y-4">
            <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary"><CheckCircleIcon className="h-4 w-4" />{wizard.ready}</p>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><p className="break-words text-xl font-bold">{fullName}</p><p className="mt-1 break-all text-sm">{phone} · {email}</p>{county && <p className="mt-1 text-sm text-muted-foreground">{county}</p>}</div>
                <button type="button" onClick={() => goToStep(0)} className="min-h-10 shrink-0 px-2 text-sm font-semibold text-primary">{wizard.edit}</button>
              </div>
            </div>
            <section className="rounded-2xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3"><h4 className="font-semibold">{wizard.steps[1]}</h4><button type="button" onClick={() => goToStep(1)} className="min-h-10 px-2 text-sm font-semibold text-primary">{wizard.edit}</button></div>
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {([
                  [t.address, address], [t.condition, conditionNotes], [t.history, medicalHistory],
                  [t.dob, dateOfBirth], [t.gender, gender ? ({ Female: t.female, Male: t.male, Other: t.other, "Prefer not to say": t.preferNot }[gender] || gender) : ""],
                  [t.patientStatus, status === "active" ? t.activeCare : status === "inactive" ? t.inactive : t.archived],
                  [t.priority, priority === "critical" ? t.pCritical : priority === "high" ? t.pHigh : priority === "low" ? t.pLow : t.pModerate],
                  ...(isAdmin ? [[t.assignedWorker, selectedWorkers.map((worker) => worker.full_name).join(", ")]] : []),
                  [intakeCopy.documents, intake.has_documents ? intakeCopy.hasDocuments : intakeCopy.noDocuments],
                  [wizard.gps, intake.location ? `${intake.location.latitude.toFixed(6)}, ${intake.location.longitude.toFixed(6)}` : ""],
                ]).map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs font-medium text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{value || wizard.empty}</dd></div>)}
              </dl>
              {intake.documents.length > 0 && <div className="mt-4 border-t border-border pt-4"><h4 className="text-xs font-medium text-muted-foreground">{wizard.documents} ({intake.documents.length})</h4><ul className="mt-2 space-y-2">{intake.documents.map((document) => <li key={document.id} className="break-words rounded-lg bg-muted p-2 text-sm">{document.name} · {document.category === "identity" ? intakeCopy.identity : intakeCopy.medical}</li>)}</ul></div>}
            </section>
          </div>}
        </form>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <button
              type="button"
              onClick={() => !isEditing && step > 0 ? goToStep(step - 1) : onClose()}
              disabled={isSubmitting || intakeBusy}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {!isEditing && step > 0 ? <span className="inline-flex items-center gap-2"><ArrowLeftIcon className="h-4 w-4" />{wizard.back}</span> : t.cancel}
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSubmitting || intakeBusy}
              className="min-h-12 flex-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60 shadow-2xs transition-colors sm:flex-none"
            >
              {isSubmitting
                ? t.saving
                : isEditing
                ? t.update
                : step === 2 ? t.create : <span className="inline-flex items-center gap-2">{wizard.next}<ArrowRightIcon className="h-4 w-4" /></span>}
            </button>
          </div>
      </div>
    </div>
  );
}

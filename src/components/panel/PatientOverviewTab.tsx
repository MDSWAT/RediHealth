/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircleIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
} from "@/components/ui/icons";
import type {
  PatientItem,
  PatientPriority,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";

interface PatientOverviewTabProps {
  patient: PatientItem;
  status: PatientStatus;
  priority: PatientPriority;
  assignedWorkerId: string;
  workersList: { id: string; full_name: string; role: string }[];
  isUpdatingStatus: boolean;
  isUpdatingPriority: boolean;
  isUpdatingWorker: boolean;
  treatmentPlan: TreatmentPlan;
  hasTreatmentPlan: boolean;
  onStatusChange: (status: PatientStatus) => void;
  onPriorityChange: (priority: PatientPriority) => void;
  onWorkerChange: (workerId: string) => void;
  onGoToTreatmentTab: () => void;
}

export function PatientOverviewTab({
  patient,
  status,
  priority,
  assignedWorkerId,
  workersList,
  isUpdatingStatus,
  isUpdatingPriority,
  isUpdatingWorker,
  treatmentPlan,
  hasTreatmentPlan,
  onStatusChange,
  onPriorityChange,
  onWorkerChange,
  onGoToTreatmentTab,
}: PatientOverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Phone Contact
          </p>
          <a
            href={`tel:${patient.phone}`}
            className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            <PhoneIcon className="h-4 w-4" />
            <span>{patient.phone}</span>
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Email Contact
          </p>
          <a
            href={`mailto:${patient.email}`}
            className="mt-1 inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
          >
            <MailIcon className="h-4 w-4" />
            <span>{patient.email}</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Date of Birth
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.date_of_birth || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Gender
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.gender || "Not specified"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Address / Location
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {patient.address || "Not provided"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Update Care Status
          </label>
          <select
            value={status}
            disabled={isUpdatingStatus}
            onChange={(e) => onStatusChange(e.target.value as PatientStatus)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="active">Active Care</option>
            <option value="inactive">Inactive Care</option>
            <option value="archived">Archived Record</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Update Urgency Priority Level
          </label>
          <select
            value={priority}
            disabled={isUpdatingPriority}
            onChange={(e) => onPriorityChange(e.target.value as PatientPriority)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="critical">🔴 Critical Priority (Follow-up &lt; 24h)</option>
            <option value="high">🟠 High Priority (Follow-up &lt; 3 days)</option>
            <option value="moderate">🟡 Moderate Priority (Follow-up &lt; 7 days)</option>
            <option value="low">🟢 Low Priority (Follow-up &lt; 14 days)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Assigned Healthcare Worker
          </label>
          <select
            value={assignedWorkerId}
            disabled={isUpdatingWorker}
            onChange={(e) => onWorkerChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="">-- Unassigned --</option>
            {workersList.map((w) => (
              <option key={w.id} value={w.id}>
                {w.full_name} ({w.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <EditIcon className="h-4 w-4 text-primary" />
          <span>Condition & Symptoms Summary</span>
        </h3>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {patient.condition_notes || "No condition notes recorded."}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircleIcon className="h-4 w-4 text-primary" />
          <span>Medical History Notes</span>
        </h3>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {patient.medical_history || "No medical history recorded."}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <EditIcon className="h-4 w-4 text-primary" />
            <span>Current Active Treatment Plan</span>
          </h3>
          <button
            type="button"
            onClick={onGoToTreatmentTab}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {hasTreatmentPlan ? "Edit Treatment Plan" : "Set Up Treatment Plan"}
          </button>
        </div>

        {hasTreatmentPlan ? (
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 space-y-4">
            {treatmentPlan.diagnosis ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Primary Diagnosis & Findings
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap font-medium">
                  {treatmentPlan.diagnosis}
                </p>
              </div>
            ) : null}

            {treatmentPlan.goals ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Care Goals & Objectives
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.goals}
                </p>
              </div>
            ) : null}

            {treatmentPlan.medications ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Prescribed Medications & Therapies
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.medications}
                </p>
              </div>
            ) : null}

            {treatmentPlan.care_instructions ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Care Instructions
                </p>
                <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                  {treatmentPlan.care_instructions}
                </p>
              </div>
            ) : null}

            {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                  Treatment Plan Photos & Documents ({treatmentPlan.photos.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {treatmentPlan.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-xl border border-border bg-card p-2 text-xs"
                    >
                      <img
                        src={photo.data_url}
                        alt={photo.name}
                        className="h-20 w-full object-cover rounded-lg border border-border mb-1"
                      />
                      <p className="font-semibold text-foreground truncate" title={photo.name}>
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            <span>
              No treatment plan set up yet. Click below to add diagnosis, medications, care instructions, and photos.
            </span>
            <div className="mt-3">
              <button
                type="button"
                onClick={onGoToTreatmentTab}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Set Up Treatment Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import type { PatientItem, PatientPriority, PatientStatus } from "@/lib/types/patient";
import type { WorkerItem, WorkerStatus } from "@/lib/types/worker";

const EPOCH_ISO = new Date(0).toISOString();

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toPrimitiveString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function toOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toIsoOrEpoch(value: unknown): string {
  return typeof value === "string" && value ? value : EPOCH_ISO;
}

function toIsoOptional(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function toPatientStatus(value: unknown): PatientStatus {
  return value === "inactive" || value === "archived" ? value : "active";
}

function toPatientPriority(value: unknown): PatientPriority {
  return value === "critical" || value === "high" || value === "low" ? value : "moderate";
}

function toWorkerStatus(value: unknown): WorkerStatus {
  return value === "inactive" ? "inactive" : "active";
}

function toObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function normalizePatientFromApi(value: unknown): PatientItem | null {
  const patient = toObject(value);
  if (!patient) return null;

  const id = toPrimitiveString(patient.id);
  const fullName = toTrimmedString(patient.full_name);
  const phone = toTrimmedString(patient.phone);
  const email = toTrimmedString(patient.email);
  if (!id || !fullName || !phone || !email) {
    return null;
  }

  return {
    id,
    request_id: patient.request_id != null ? String(patient.request_id) : null,
    assigned_worker_id: patient.assigned_worker_id != null ? String(patient.assigned_worker_id) : null,
    assigned_worker_ids: Array.isArray(patient.assigned_worker_ids)
      ? patient.assigned_worker_ids
          .map((item) => toPrimitiveString(item))
          .filter((item) => item.length > 0)
      : [],
    assigned_worker_name: toOptionalString(patient.assigned_worker_name),
    assigned_worker_names: Array.isArray(patient.assigned_worker_names)
      ? patient.assigned_worker_names
          .map((item) => toPrimitiveString(item))
          .filter((item) => item.length > 0)
      : [],
    access_token: toOptionalString(patient.access_token),
    full_name: fullName,
    phone,
    email,
    date_of_birth: toOptionalString(patient.date_of_birth),
    gender: toOptionalString(patient.gender),
    address: toOptionalString(patient.address),
    condition_notes: toOptionalString(patient.condition_notes),
    medical_history: toOptionalString(patient.medical_history),
    treatment_plan: toObject(patient.treatment_plan) as PatientItem["treatment_plan"],
    followups: Array.isArray(patient.followups) ? (patient.followups as PatientItem["followups"]) : [],
    photos: Array.isArray(patient.photos) ? (patient.photos as PatientItem["photos"]) : [],
    status: toPatientStatus(patient.status),
    priority: toPatientPriority(patient.priority),
    created_at: toIsoOrEpoch(patient.created_at),
    updated_at: toIsoOptional(patient.updated_at),
  };
}

export function normalizePatientsFromApi(values: unknown): PatientItem[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => normalizePatientFromApi(value))
    .filter((value): value is PatientItem => value !== null);
}

export function normalizeWorkerFromApi(value: unknown): WorkerItem | null {
  const worker = toObject(value);
  if (!worker) return null;

  const id = toPrimitiveString(worker.id);
  const fullName = toTrimmedString(worker.full_name);
  const email = toTrimmedString(worker.email);
  if (!id || !fullName || !email) {
    return null;
  }

  return {
    id,
    full_name: fullName,
    email,
    phone: toOptionalString(worker.phone),
    role: toTrimmedString(worker.role) || "Healthcare Worker",
    department: toOptionalString(worker.department),
    status: toWorkerStatus(worker.status),
    assigned_patients_count: Number(worker.assigned_patients_count || 0),
    created_at: toIsoOrEpoch(worker.created_at),
    updated_at: toIsoOptional(worker.updated_at),
  };
}

export function normalizeWorkersFromApi(values: unknown): WorkerItem[] {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => normalizeWorkerFromApi(value))
    .filter((value): value is WorkerItem => value !== null);
}

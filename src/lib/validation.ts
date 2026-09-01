import type {
  FollowupItem,
  PatientPriority,
  PatientPhoto,
  PatientStatus,
} from "@/lib/types/patient";

export const PATIENT_PRIORITIES: readonly PatientPriority[] = [
  "critical",
  "high",
  "moderate",
  "low",
];

export const PATIENT_STATUSES: readonly PatientStatus[] = [
  "active",
  "inactive",
  "archived",
];

const FOLLOWUP_STATUSES: readonly FollowupItem["status"][] = [
  "scheduled",
  "completed",
  "cancelled",
];

// Base64 payloads inflate size by ~33%; cap the stored data URL so a single
// upload cannot exhaust the row/packet limits (~5 MB of original image data).
const MAX_PHOTO_DATA_URL_LENGTH = 7_000_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isPatientPriority(value: unknown): value is PatientPriority {
  return (
    typeof value === "string" &&
    (PATIENT_PRIORITIES as readonly string[]).includes(value)
  );
}

export function isPatientStatus(value: unknown): value is PatientStatus {
  return (
    typeof value === "string" &&
    (PATIENT_STATUSES as readonly string[]).includes(value)
  );
}

export function validateFollowupInput(
  value: unknown,
): ValidationResult<FollowupItem> {
  if (!isRecord(value)) {
    return { ok: false, error: "Follow-up must be an object." };
  }

  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (!title || title.length > 200) {
    return { ok: false, error: "Follow-up title is required (max 200 chars)." };
  }

  const date = typeof value.date === "string" ? value.date.slice(0, 10) : "";
  if (!ISO_DATE_PATTERN.test(date)) {
    return { ok: false, error: "Follow-up date must be a valid YYYY-MM-DD value." };
  }

  const notes = typeof value.notes === "string" ? value.notes.trim() : undefined;
  if (notes && notes.length > 2_000) {
    return { ok: false, error: "Follow-up notes are too long (max 2000 chars)." };
  }

  const status =
    typeof value.status === "string" &&
    (FOLLOWUP_STATUSES as readonly string[]).includes(value.status)
      ? (value.status as FollowupItem["status"])
      : "scheduled";

  // The identifier and reminder flag are re-derived server-side rather than trusted.
  return {
    ok: true,
    value: {
      id:
        typeof value.id === "string" && value.id.trim()
          ? value.id.trim().slice(0, 64)
          : String(Date.now()),
      title,
      date,
      notes: notes || undefined,
      status,
      reminder_set: value.reminder_set === false ? false : true,
    },
  };
}

export function validatePhotoInput(
  value: unknown,
): ValidationResult<PatientPhoto> {
  if (!isRecord(value)) {
    return { ok: false, error: "Photo must be an object." };
  }

  const dataUrl = typeof value.data_url === "string" ? value.data_url : "";
  if (!dataUrl.startsWith("data:image/")) {
    return { ok: false, error: "Photo must be an image data URL." };
  }
  if (dataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
    return { ok: false, error: "Photo exceeds the maximum allowed size." };
  }

  const name =
    typeof value.name === "string" && value.name.trim()
      ? value.name.trim().slice(0, 200)
      : "Patient Attachment";

  const notes = typeof value.notes === "string" ? value.notes.trim() : undefined;
  if (notes && notes.length > 2_000) {
    return { ok: false, error: "Photo notes are too long (max 2000 chars)." };
  }

  const date =
    typeof value.date === "string" && ISO_DATE_PATTERN.test(value.date.slice(0, 10))
      ? value.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  return {
    ok: true,
    value: {
      id:
        typeof value.id === "string" && value.id.trim()
          ? value.id.trim().slice(0, 64)
          : String(Date.now()),
      name,
      data_url: dataUrl,
      date,
      notes: notes || undefined,
    },
  };
}

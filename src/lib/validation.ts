import type {
  FollowupItem,
  PatientPriority,
  PatientPhoto,
  PatientStatus,
  TreatmentDetails,
  TreatmentEntry,
  TreatmentPlan,
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

function validTreatmentDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateTreatmentDetails(value: Record<string, unknown>): ValidationResult<TreatmentDetails> {
  const details: TreatmentDetails = {};
  for (const field of ["diagnosis", "goals", "medications", "care_instructions"] as const) {
    if (value[field] !== undefined && typeof value[field] !== "string") {
      return { ok: false, error: `Treatment ${field} must be text.` };
    }
    if (typeof value[field] === "string") details[field] = value[field];
  }
  if (value.photos !== undefined) {
    if (!Array.isArray(value.photos)) return { ok: false, error: "Treatment photos must be an array." };
    const photos: PatientPhoto[] = [];
    for (const photo of value.photos) {
      const result = validatePhotoInput(photo);
      if (!result.ok) return result;
      const originalDate = isRecord(photo) && typeof photo.date === "string" ? photo.date : "";
      photos.push({
        ...result.value,
        date: validTreatmentDate(originalDate.slice(0, 10)) && !Number.isNaN(new Date(originalDate).getTime())
          ? originalDate
          : result.value.date,
      });
    }
    details.photos = photos;
  }
  return { ok: true, value: details };
}

export function validateTreatmentPlanInput(input: unknown): ValidationResult<TreatmentPlan | null> {
  let value = input;
  if (typeof value === "string") {
    try { value = JSON.parse(value); }
    catch { return { ok: false, error: "Treatment plans must contain valid JSON." }; }
  }
  if (value === null) return { ok: true, value: null };
  if (!isRecord(value)) return { ok: false, error: "Treatment plans must be an object." };
  const details = validateTreatmentDetails(value);
  if (!details.ok) return details;
  if (value.entries === undefined) return details;
  if (!Array.isArray(value.entries)) return { ok: false, error: "Treatment entries must be an array." };
  const entries: TreatmentEntry[] = [];
  const ids = new Set<string>();
  for (const entry of value.entries) {
    if (!isRecord(entry)) return { ok: false, error: "Each treatment plan must be an object." };
    const id = typeof entry.id === "string" ? entry.id.trim() : "";
    const title = typeof entry.title === "string" ? entry.title.trim() : "";
    if (!id || id.length > 64 || ids.has(id)) return { ok: false, error: "Treatment plan identifiers must be unique (max 64 characters)." };
    if ((!title && id !== "legacy-treatment") || title.length > 200) return { ok: false, error: "Treatment plan name is required (max 200 characters)." };
    const start = entry.start_date || undefined;
    const end = entry.end_date || undefined;
    const undatedLegacy = id === "legacy-treatment" && !start && !end;
    if (!undatedLegacy && (!validTreatmentDate(start) || !validTreatmentDate(end))) {
      return { ok: false, error: "Each treatment plan needs valid start and end dates (YYYY-MM-DD)." };
    }
    if (typeof start === "string" && typeof end === "string" && end < start) {
      return { ok: false, error: "Treatment end date cannot be before its start date." };
    }
    const validated = validateTreatmentDetails(entry);
    if (!validated.ok) return validated;
    ids.add(id);
    entries.push({ ...validated.value, id, title, start_date: typeof start === "string" ? start : undefined, end_date: typeof end === "string" ? end : undefined });
  }
  return { ok: true, value: { entries } };
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
  const calendarDate = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) {
    return { ok: false, error: "Follow-up date must be a valid calendar date." };
  }
  const time = typeof value.time === "string" ? value.time.trim() : "";
  const timezone = typeof value.timezone === "string" ? value.timezone.trim() : "";
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return { ok: false, error: "Appointment time must be HH:mm." };
  }
  if (time) {
    try { if (!timezone) throw new Error(); new Intl.DateTimeFormat("en", { timeZone: timezone }); }
    catch { return { ok: false, error: "Choose a valid appointment timezone." }; }
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
      time: time || undefined,
      timezone: time ? timezone : undefined,
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

export type FollowupCompletionInput = {
  followup_id: string;
  completion_notes?: string;
  completion_photos: PatientPhoto[];
  completed_at: string;
};

export function validateFollowupCompletionInput(
  value: unknown,
): ValidationResult<FollowupCompletionInput> {
  if (!isRecord(value)) {
    return { ok: false, error: "Follow-up completion must be an object." };
  }

  const followupId =
    typeof value.followup_id === "string" ? value.followup_id.trim() : "";
  if (!followupId) {
    return { ok: false, error: "Follow-up id is required." };
  }

  const completionNotes =
    typeof value.completion_notes === "string"
      ? value.completion_notes.trim()
      : undefined;
  if (completionNotes && completionNotes.length > 2_000) {
    return { ok: false, error: "Completion notes are too long (max 2000 chars)." };
  }

  const photoInputs = Array.isArray(value.completion_photos)
    ? value.completion_photos
    : [];
  if (photoInputs.length > 8) {
    return { ok: false, error: "Too many completion photos (max 8)." };
  }

  const photos: PatientPhoto[] = [];
  for (const input of photoInputs) {
    const validated = validatePhotoInput(input);
    if (!validated.ok) {
      return { ok: false, error: validated.error };
    }
    photos.push(validated.value);
  }

  const completedAt =
    typeof value.completed_at === "string" && ISO_DATE_PATTERN.test(value.completed_at.slice(0, 10))
      ? value.completed_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  return {
    ok: true,
    value: {
      followup_id: followupId,
      completion_notes: completionNotes || undefined,
      completion_photos: photos,
      completed_at: completedAt,
    },
  };
}

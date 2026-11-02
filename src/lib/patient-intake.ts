import type { PatientDocument, PatientIntake } from "@/lib/types/patient";

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_PATIENT_DOCUMENTS = 5;
export const DOCUMENT_ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

type IntakeResult =
  | { ok: true; value: PatientIntake | null }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function documentBytes(dataUrl: string): number | null {
  const match = /^data:(application\/pdf|image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(dataUrl);
  if (!match) return null;
  const [, mime, data] = match;
  if (data.length % 4 !== 0 || data.length > Math.ceil(MAX_DOCUMENT_BYTES / 3) * 4) return null;
  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const bytes = data.length * 3 / 4 - padding;
  if (bytes === 0 || bytes > MAX_DOCUMENT_BYTES) return null;
  const header = atob(data.slice(0, 24));
  const matchesType = mime === "application/pdf" ? header.startsWith("%PDF-")
    : mime === "image/jpeg" ? header.startsWith("\xff\xd8\xff")
    : mime === "image/png" ? header.startsWith("\x89PNG\r\n\x1a\n")
    : header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
  return matchesType ? bytes : null;
}

export function validatePatientIntake(value: unknown): IntakeResult {
  if (value === null || value === undefined) return { ok: true, value: null };
  if (!isRecord(value) || typeof value.has_documents !== "boolean" || !Array.isArray(value.documents)) {
    return { ok: false, error: "Invalid patient document details." };
  }
  if (value.documents.length > MAX_PATIENT_DOCUMENTS || (!value.has_documents && value.documents.length > 0)) {
    return { ok: false, error: "Upload at most 5 documents and mark that the patient has documents." };
  }
  const documents: PatientDocument[] = [];
  let total = 0;
  const ids = new Set<string>();
  for (const document of value.documents) {
    if (!isRecord(document) || typeof document.id !== "string" || !document.id || document.id.length > 100
      || ids.has(document.id) || typeof document.name !== "string" || !document.name.trim() || document.name.length > 200
      || (document.category !== "medical" && document.category !== "identity") || typeof document.data_url !== "string") {
      return { ok: false, error: "Invalid patient document." };
    }
    const bytes = documentBytes(document.data_url);
    if (bytes === null) return { ok: false, error: "Documents must be PDF, JPEG, PNG or WebP files, at most 5 MB each." };
    total += bytes;
    if (total > MAX_TOTAL_DOCUMENT_BYTES) return { ok: false, error: "Documents must not exceed 10 MB in total." };
    ids.add(document.id);
    documents.push({ id: document.id, name: document.name.trim(), category: document.category, data_url: document.data_url });
  }
  let location: PatientIntake["location"] = null;
  if (value.location !== null) {
    const point = value.location;
    if (!isRecord(point) || typeof point.latitude !== "number" || !Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
      || typeof point.longitude !== "number" || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180
      || typeof point.accuracy !== "number" || !Number.isFinite(point.accuracy) || point.accuracy < 0) {
      return { ok: false, error: "Invalid GPS coordinates." };
    }
    location = { latitude: point.latitude, longitude: point.longitude, accuracy: point.accuracy };
  }
  return { ok: true, value: { has_documents: value.has_documents, documents, location } };
}

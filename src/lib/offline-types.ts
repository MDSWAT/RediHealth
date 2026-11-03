import type { PatientItem } from "./types/patient";
import type { MedicalHelpRequestItem } from "./types/medical-request";
import type { CountryCode } from "./countries";

export type OfflineIdentity = {
  email: string; workerId: string; workerName: string; role: string; country: CountryCode;
};
export type OfflineSnapshot = {
  identity: OfflineIdentity;
  authorizedAt: number;
  expiresAt: number;
  patients: PatientItem[];
  requests: MedicalHelpRequestItem[];
  revisions: Record<string, string>;
};
export type OfflineOperation = {
  operationId: string;
  entity: "patient" | "request";
  id: string;
  create: boolean;
  revision: string | null;
  changes: Record<string, unknown>;
  error?: string;
  submitted?: boolean;
};
export type OfflineData = OfflineSnapshot & {
  version: 1;
  deviceId: string;
  queue: OfflineOperation[];
};
export const OFFLINE_DAYS = 30;
export const OFFLINE_CACHE_LIMIT = 100;
export const OFFLINE_PENDING_MESSAGE = "Saved encrypted on this device. Pending synchronization; no email or video action was sent.";

import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import { isValidEmail } from "@/lib/text";

export const ALERT_EMAIL_SETTING = "alert_email";

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: string | null; expiresAt: number }>();
const pendingReads = new Map<string, Promise<string | null>>();

function isConnectionFailure(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = "code" in error ? error.code : undefined;
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EPIPE", "08001", "08006", "57P03"].includes(String(code)) ||
    /^(Connection terminated due to connection timeout|Connection terminated unexpectedly|timeout exceeded when trying to connect)$/.test(error.message);
}

async function readSetting(key: string): Promise<string | null> {
  try {
    const read = () => getControlDatabase().query<(RowDataPacket & { setting_value: string | null })[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = ? LIMIT 1",
      [key],
    );
    // Only this idempotent read is retried. pg discards the failed connection; writes elsewhere
    // must never be replayed because the server may already have committed them.
    const [rows] = await read().catch((error: unknown) => {
      if (!isConnectionFailure(error)) throw error;
      return read();
    });
    return rows[0]?.setting_value?.trim() || null;
  } catch (error) {
    console.error(`Failed to read setting ${key}`, error);
    // Keep known alert recipients available during an outage; a cold process uses the env fallback.
    return cache.get(key)?.value ?? null;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (!hasControlDatabase()) {
    return null;
  }

  const pending = pendingReads.get(key);
  if (pending) return pending;

  const read = readSetting(key).then((value) => {
    // A successful write invalidates an older in-flight read too.
    if (pendingReads.get(key) === read) {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    }
    return value;
  }).finally(() => {
    if (pendingReads.get(key) === read) pendingReads.delete(key);
  });
  pendingReads.set(key, read);
  return read;
}

export async function setSetting(key: string, value: string | null, updatedBy: string): Promise<void> {
  await getControlDatabase().query(
    `INSERT INTO app_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = EXCLUDED.updated_by`,
    [key, value, updatedBy],
  );
  cache.delete(key);
  pendingReads.delete(key);
}

export const MAX_ALERT_RECIPIENTS = 10;

/** Splits a stored or typed list ("a@x.org, b@y.org") into unique, valid, lower-case addresses. */
export function parseAlertEmails(value: string | null | undefined): string[] {
  if (!value) return [];
  const emails = value
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email && isValidEmail(email));
  return [...new Set(emails)].slice(0, MAX_ALERT_RECIPIENTS);
}

export type AlertRecipients = {
  emails: string[];
  source: "panel" | "env" | "none";
};

/**
 * The addresses that receive issue reports, error reports and operational alerts: the list saved
 * in the panel first, then OPERATIONAL_ALERT_EMAIL from the environment (also a comma-separated list).
 */
export async function getAlertRecipients(): Promise<AlertRecipients> {
  const fromPanel = parseAlertEmails(await getSetting(ALERT_EMAIL_SETTING));
  if (fromPanel.length > 0) return { emails: fromPanel, source: "panel" };

  const fromEnv = parseAlertEmails(process.env.OPERATIONAL_ALERT_EMAIL);
  if (fromEnv.length > 0) return { emails: fromEnv, source: "env" };

  return { emails: [], source: "none" };
}

import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import { isValidEmail } from "@/lib/text";

export const ALERT_EMAIL_SETTING = "alert_email";

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: string | null; expiresAt: number }>();

export async function getSetting(key: string): Promise<string | null> {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  if (!hasControlDatabase()) {
    return null;
  }

  try {
    const [rows] = await getControlDatabase().query<(RowDataPacket & { setting_value: string | null })[]>(
      "SELECT setting_value FROM app_settings WHERE setting_key = ? LIMIT 1",
      [key],
    );
    const value = rows[0]?.setting_value?.trim() || null;
    cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  } catch (error) {
    console.error(`Failed to read setting ${key}`, error);
    return null;
  }
}

export async function setSetting(key: string, value: string | null, updatedBy: string): Promise<void> {
  await getControlDatabase().query(
    `INSERT INTO app_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
     ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = EXCLUDED.updated_by`,
    [key, value, updatedBy],
  );
  cache.delete(key);
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

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
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
    [key, value, updatedBy],
  );
  cache.delete(key);
}

export type AlertRecipient = {
  email: string | null;
  source: "panel" | "env" | "none";
};

/** The address that receives issue reports and operational alerts: panel setting first, then the environment. */
export async function getAlertRecipient(): Promise<AlertRecipient> {
  const fromPanel = await getSetting(ALERT_EMAIL_SETTING);
  if (fromPanel && isValidEmail(fromPanel)) {
    return { email: fromPanel, source: "panel" };
  }

  const fromEnv = process.env.OPERATIONAL_ALERT_EMAIL?.trim();
  if (fromEnv && isValidEmail(fromEnv)) {
    return { email: fromEnv, source: "env" };
  }

  return { email: null, source: "none" };
}

import type { Lang } from "@/lib/i18n/translations";

/**
 * Languages whose readers cannot use the online doctor. The service is not offered in Croatia,
 * so the Croatian site does not link to it and its pages say so plainly instead of offering a call.
 */
export const ONLINE_DOCTOR_UNAVAILABLE_LANGS: readonly Lang[] = ["hr"];

export function isOnlineDoctorAvailable(lang: Lang): boolean {
  return !ONLINE_DOCTOR_UNAVAILABLE_LANGS.includes(lang);
}

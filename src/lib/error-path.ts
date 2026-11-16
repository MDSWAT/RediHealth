/**
 * Page address that is safe to put in an error report: no query string (triage notes and country
 * codes travel there) and no patient portal token.
 */
export function safeErrorPath(value: string | null | undefined): string {
  if (!value) return "";
  let path = value;
  try {
    path = new URL(value, "https://redihealth.invalid").pathname;
  } catch {
    path = value.split(/[?#]/)[0] ?? "";
  }
  return path.replace(/(\/patient-portal\/)[^/]+/i, "$1[token]").slice(0, 300);
}

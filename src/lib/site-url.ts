const FALLBACK_SITE_URL = "https://redi.healthcare";

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/i;

/**
 * Turns a configured address into a bare origin such as "https://redi.healthcare".
 * Accepts values typed without the scheme ("redi.healthcare") or with a path or trailing slash
 * ("https://redi.healthcare/ro/"). Returns undefined for anything that is not an http(s) address.
 */
export function normalizeOrigin(raw: string | undefined | null): string | undefined {
  const value = raw?.trim();
  if (!value) return undefined;
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

/** A normalized public origin, or undefined when it is missing, invalid or a loopback address. */
export function publicOrigin(raw: string | undefined | null): string | undefined {
  const origin = normalizeOrigin(raw);
  if (!origin) return undefined;
  return LOOPBACK_HOST.test(new URL(origin).hostname) ? undefined : origin;
}

/** Public origin of the site, without a trailing slash. Never throws. */
export function getSiteUrl(): string {
  return publicOrigin(process.env.APP_URL) ?? publicOrigin(process.env.AUTH_URL) ?? FALLBACK_SITE_URL;
}

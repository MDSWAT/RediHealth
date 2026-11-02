const FALLBACK_SITE_URL = "https://redihealth.org";

/** Public origin of the site, without a trailing slash. */
export function getSiteUrl(): string {
  const configured = process.env.APP_URL || process.env.AUTH_URL;
  const url = configured && !/localhost|127\.0\.0\.1/.test(configured) ? configured : FALLBACK_SITE_URL;
  return url.replace(/\/+$/, "");
}

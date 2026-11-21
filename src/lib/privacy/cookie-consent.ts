export const COOKIE_CONSENT_NAME = "redihealth_cookie_consent";
export const COOKIE_CONSENT_VERSION = "0.1";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days
export const COOKIE_CONSENT_EVENT = "redihealth:cookie-consent-changed";
export const OPEN_COOKIE_PREFERENCES_EVENT = "redihealth:open-cookie-preferences";

export type CookieConsentState = {
  version: string;
  necessary: true;
  updatedAt: string;
};

export function parseCookieConsent(raw: string | null | undefined): CookieConsentState | null {
  if (!raw) return null;
  try {
    const decoded = raw.startsWith("%7B") ? decodeURIComponent(raw) : raw;
    const parsed = JSON.parse(decoded) as Partial<CookieConsentState>;
    if (
      parsed &&
      parsed.version === COOKIE_CONSENT_VERSION &&
      parsed.necessary === true &&
      typeof parsed.updatedAt === "string"
    ) {
      return {
        version: parsed.version,
        necessary: true,
        updatedAt: parsed.updatedAt,
      };
    }
  } catch {
    return null;
  }
  return null;
}

function readConsentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_CONSENT_NAME}=([^;]+)`),
  );
  return match?.[1] ?? null;
}

export function readCookieConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  const fromCookie = parseCookieConsent(readConsentCookie());
  if (fromCookie) return fromCookie;
  try {
    return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_NAME));
  } catch {
    return null;
  }
}

let cachedSnapshotRaw: string | null | undefined = undefined;
let cachedSnapshotValue: CookieConsentState | null = null;

export function acknowledgeNecessaryCookies(): CookieConsentState {
  const next: CookieConsentState = {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(next);
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(serialized)}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; samesite=lax${secure}`;
    try {
      window.localStorage.setItem(COOKIE_CONSENT_NAME, serialized);
    } catch {
      // Ignore storage quota or private-mode restrictions; cookie remains primary.
    }
    cachedSnapshotRaw = serialized;
    cachedSnapshotValue = next;
    window.dispatchEvent(new CustomEvent<CookieConsentState>(COOKIE_CONSENT_EVENT, { detail: next }));
  }

  return next;
}

/** Stable client snapshot for React's useSyncExternalStore (returns null if not yet acknowledged). */
export function getCookieConsentSnapshot(): CookieConsentState | null {
  if (typeof window === "undefined") return null;
  let raw = readConsentCookie();
  if (!raw) {
    try {
      raw = window.localStorage.getItem(COOKIE_CONSENT_NAME);
    } catch {
      raw = null;
    }
  }
  if (raw === cachedSnapshotRaw) {
    return cachedSnapshotValue;
  }
  cachedSnapshotRaw = raw;
  cachedSnapshotValue = parseCookieConsent(raw);
  return cachedSnapshotValue;
}

export function subscribeCookieConsent(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(COOKIE_CONSENT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function openCookiePreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
}

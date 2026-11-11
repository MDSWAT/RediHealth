const FALLBACK_ORIGIN = "https://redihealth.org";

/**
 * The origin to put in links that leave this device: the QR code and the copied note. It is the
 * site's configured public address when the server has one (`APP_URL`, written on <html> by the
 * root layout), so a code made while developing on localhost still opens on a phone. Otherwise
 * it is the address in the address bar.
 */
export function readPublicOrigin(): string {
  const configured = document.documentElement.dataset.publicOrigin;
  return (configured || window.location.origin || FALLBACK_ORIGIN).replace(/\/+$/, "");
}

export const SERVER_PUBLIC_ORIGIN = FALLBACK_ORIGIN;

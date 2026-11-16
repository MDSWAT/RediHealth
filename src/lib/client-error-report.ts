import { safeErrorPath } from "@/lib/error-path";

/**
 * Sends an error that happened in the visitor's browser to /api/client-errors, which forwards it
 * to the alert addresses. Only the error text, the page path (no query string, no portal token)
 * and the kind of error are sent.
 */

const MAX_REPORTS_PER_PAGE = 10;
const reported = new Set<string>();

// Not faults of the website: browser extensions, cross-origin scripts, a dropped connection, a cancelled request.
const NOISE = [
  "Script error",
  "ResizeObserver loop",
  "A listener indicated an asynchronous response",
  "message channel closed",
  "chrome-extension://",
  "moz-extension://",
  "safari-web-extension://",
  "Failed to fetch",
  "Load failed",
  "NetworkError",
  "The operation was aborted",
  "AbortError",
];

export function reportClientError(error: unknown, kind: "error" | "unhandledrejection" | "render"): void {
  try {
    if (typeof window === "undefined" || reported.size >= MAX_REPORTS_PER_PAGE) return;

    const isError = error instanceof Error;
    const message = (isError ? `${error.name}: ${error.message}` : typeof error === "string" ? error : "").slice(0, 1000);
    const stack = isError && error.stack ? error.stack.slice(0, 4000) : "";
    if (!message || NOISE.some((noise) => message.includes(noise) || stack.includes(noise))) return;

    if (reported.has(message)) return;
    reported.add(message);

    const digest = isError && "digest" in error && typeof error.digest === "string" ? error.digest : undefined;
    const body = JSON.stringify({ kind, message, stack, digest, path: safeErrorPath(window.location.pathname) });

    // sendBeacon still delivers when the page is closing; fetch covers browsers that refuse the beacon.
    const sent = navigator.sendBeacon?.("/api/client-errors", new Blob([body], { type: "application/json" }));
    if (!sent) {
      void fetch("/api/client-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    // Reporting must never cause another error.
  }
}

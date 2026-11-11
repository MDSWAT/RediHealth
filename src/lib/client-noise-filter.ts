/**
 * Intercepts third-party browser extension noise (such as VS Code Edge DevTools
 * telemetry pings blocked by ad-blockers and broken extension message channel rejections)
 * so they do not pollute the developer or user console with false-positive red errors.
 */

let initialized = false;

export function _resetClientNoiseFilterForTest(): void {
  initialized = false;
}

export function initClientNoiseFilter(): void {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  // 1. Prevent unhandled rejections from external browser extension content scripts
  // ("A listener indicated an asynchronous response by returning true, but the message channel closed")
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const msg = event?.reason?.message || String(event?.reason || "");
    if (
      msg.includes("A listener indicated an asynchronous response") ||
      msg.includes("message channel closed before a response was received")
    ) {
      event.preventDefault();
    }
  });

  // 2. Intercept calls to third-party telemetry endpoints (like dc.services.visualstudio.com)
  // injected by VS Code / Edge DevTools extensions, which get blocked by ad blockers (net::ERR_BLOCKED_BY_CLIENT)
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.href
        : input && typeof input === "object" && "url" in input
        ? (input as Request).url
        : "";

    if (typeof url === "string" && url.includes("dc.services.visualstudio.com")) {
      return Promise.resolve(
        new Response(JSON.stringify({ itemsReceived: 1, itemsAccepted: 1, errors: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
    return originalFetch.call(this, input, init);
  };

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const originalSendBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
      const urlStr = typeof url === "string" ? url : url.href;
      if (urlStr.includes("dc.services.visualstudio.com")) {
        return true;
      }
      return originalSendBeacon(url, data);
    };
  }
}

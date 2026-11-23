/**
 * Conversion events for the website statistics, sent to our own Nextlytics endpoint (/api/event,
 * see src/nextlytics.ts); nothing goes to a third party. Events carry no personal or health data:
 * only the event name and the page it happened on.
 *
 * This posts Nextlytics' "custom-event" request directly instead of using its useNextlytics() hook,
 * because the hook throws on pages that are not tracked (the panel, the patient portal), and these
 * calls live in components that also appear there. The package version is pinned in package.json.
 */
import type { AnalyticsEventName } from "@/lib/analytics";

export type AnalyticsEvent = AnalyticsEventName;

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      type: "custom-event",
      name: event,
      collectedAt: new Date().toISOString(),
      clientContext: {
        collectedAt: new Date().toISOString(),
        path: window.location.pathname,
        search: window.location.search,
        host: window.location.host,
        screen: {},
      },
    });
    void fetch("/api/event", {
      method: "POST",
      body,
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        // Nextlytics requires a page id; it links events to page views, which we do not use.
        "x-nl-page-render-id": crypto.randomUUID?.() ?? String(Date.now()),
      },
    }).catch(() => {});
  } catch {
    // Statistics must never break the page.
  }
}

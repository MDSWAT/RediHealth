/**
 * Conversion and anonymous engagement events for the website statistics, sent to our own Nextlytics
 * endpoint (/api/event, see src/nextlytics.ts); nothing goes to a third party. Events carry no
 * personal or health data: only the event name, the page it happened on, and sanitized aggregate
 * properties (active time on page, scroll depth, or anonymized UI control identifiers).
 *
 * This posts Nextlytics' "custom-event" request directly instead of using its useNextlytics() hook,
 * because the hook throws on pages that are not tracked (the panel, the patient portal), and these
 * calls live in components that also appear there. The package version is pinned in package.json.
 */
import type { ClickTargetKind, TrackedEventName } from "@/lib/analytics";

export type AnalyticsEvent = TrackedEventName;

export type AnalyticsEventProps = {
  durationMs?: number;
  scrollDepth?: number;
  targetKey?: string;
  targetLabel?: string;
  targetKind?: ClickTargetKind;
  variant?: "initial" | "followup";
};

export function trackEvent(
  event: AnalyticsEvent,
  props?: AnalyticsEventProps,
  options?: { path?: string; useBeacon?: boolean },
) {
  if (typeof window === "undefined") return;
  try {
    const nowIso = new Date().toISOString();
    const path = options?.path ?? window.location.pathname;
    const body = JSON.stringify({
      type: "custom-event",
      name: event,
      ...(props ? { props } : {}),
      collectedAt: nowIso,
      clientContext: {
        collectedAt: nowIso,
        path,
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

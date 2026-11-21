/**
 * Website statistics with Nextlytics (https://github.com/jitsucom/nextlytics), running inside this
 * Next.js app: no separate analytics server and no third party. Page loads are recorded by its
 * middleware, which proxy.ts calls; client-side navigations and conversion events reach it through
 * /api/event. Everything is stored by redihealthBackend in our own database and shown in the panel
 * under Statistics (/panel/analytics).
 *
 * Privacy (see lib/analytics.ts for the exact rules):
 *   - staff, sign-in and triage-note pages are never recorded, and portal tokens are removed;
 *   - no IP address, cookie or full user agent is stored, and no visitor is identified
 *     (callbacks.getUser is deliberately not set);
 *   - the visitor ID is a keyed hash that changes every day;
 *   - bots and browsers sending Do Not Track / Global Privacy Control are not counted.
 */
import { Nextlytics } from "@nextlytics/core/server";
import { cleanPagePath, isBot } from "@/lib/analytics";
import { clientIpFromHeaders, redihealthBackend, visitorHash } from "@/lib/analytics-server";

export const ANALYTICS_EVENT_ENDPOINT = "/api/event";

export const { middleware: analyticsMiddleware, NextlyticsServer } = Nextlytics({
  eventEndpoint: ANALYTICS_EVENT_ENDPOINT,
  backends: [redihealthBackend()],
  capture: ({ path, fromBrowser, userAgent }) => fromBrowser && !isBot(userAgent) && cleanPagePath(path) !== null,
  anonymousUsers: { useCookies: false, gdprMode: true, dailySalt: true },
  callbacks: {
    async getAnonymousUserId({ ctx }) {
      return {
        anonId: visitorHash(clientIpFromHeaders(ctx.headers), ctx.headers.get("user-agent") ?? "", ctx.headers.get("host") ?? ""),
      };
    },
  },
});

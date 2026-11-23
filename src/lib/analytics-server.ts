/**
 * Nextlytics backend that stores website statistics in our own database (table analytics_events in
 * the control database). Nextlytics hands every event to onEvent with the full request context;
 * this backend keeps only the fields listed in lib/analytics.ts and drops the rest (IP address,
 * request headers, full user agent, query strings other than utm_*).
 * Failures are swallowed: statistics must never slow down or break a page.
 */
import { createHmac, randomBytes } from "node:crypto";
import type { NextlyticsBackend, NextlyticsEvent } from "@nextlytics/core";
import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import {
  campaignFromSearch,
  cleanPagePath,
  countryFromHeaders,
  isAnalyticsEvent,
  isBot,
  optedOut,
  parseUserAgent,
  referrerHost,
} from "@/lib/analytics";

const RETENTION_MONTHS = 13;
let fallbackSecret: string | undefined;
let warned = false;

function secret(): string {
  const configured = process.env.ANALYTICS_SALT?.trim() || process.env.AUTH_SECRET?.trim();
  if (configured) return configured;
  fallbackSecret ??= randomBytes(32).toString("hex");
  return fallbackSecret;
}

/**
 * Same visitor + same day = same hash. The daily salt is derived from a server secret and never
 * stored, so the hash can neither be linked to the next day nor turned back into an IP address
 * (Nextlytics' own default hash has no secret and could be reversed by trying every IPv4 address).
 */
export function visitorHash(ip: string, userAgent: string, host: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10);
  const dailySalt = createHmac("sha256", secret()).update(`analytics:${day}`).digest();
  return createHmac("sha256", dailySalt).update(`${ip}|${userAgent}|${host}`).digest("hex").slice(0, 32);
}

/** Same trust rules as rate limiting: forwarded headers count only behind a known proxy. */
export function clientIpFromHeaders(headers: Headers): string {
  if (process.env.REDIHEALTH_TRUST_PROXY_HEADERS !== "true" && process.env.VERCEL !== "1") return "unknown";
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
}

function searchString(search: Record<string, string[]> | undefined): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(search ?? {})) {
    if (values[0] !== undefined) params.set(key, values[0]);
  }
  return params;
}

/** The row to store, or null when the event must not be recorded. Exported for the tests. */
export function eventToRow(event: NextlyticsEvent) {
  const kind = event.type === "pageView" ? "pageview" : isAnalyticsEvent(event.type) ? "event" : null;
  if (!kind) return null;

  const headers = new Headers(event.serverContext.requestHeaders ?? {});
  const userAgent = headers.get("user-agent") ?? "";
  if (optedOut(headers) || isBot(userAgent)) return null;

  const page = cleanPagePath(event.clientContext?.path || event.serverContext.path || "");
  if (!page) return null;

  const { device, browser, os } = parseUserAgent(userAgent);
  // Only the first, server-side page view of a visit knows the external referrer.
  const referrer = kind === "pageview" && event.origin === "server" ? headers.get("referer") : null;

  return {
    kind,
    event_name: kind === "event" ? event.type : null,
    path: page.path,
    lang: page.lang,
    referrer_host: referrerHost(referrer, event.serverContext.host),
    ...campaignFromSearch(searchString(event.serverContext.search)),
    country: countryFromHeaders(headers),
    device,
    browser,
    os,
    visitor_hash: event.anonymousUserId || visitorHash("unknown", userAgent, event.serverContext.host),
  };
}

export function redihealthBackend(): NextlyticsBackend {
  return {
    name: "redihealth-postgres",
    supportsUpdates: false,
    async onEvent(event) {
      try {
        if (!hasControlDatabase()) return;
        const row = eventToRow(event);
        if (!row) return;
        const db = getControlDatabase();

        let campaign = {
          utm_source: row.utm_source ?? null,
          utm_medium: row.utm_medium ?? null,
          utm_campaign: row.utm_campaign ?? null,
          utm_term: row.utm_term ?? null,
          utm_content: row.utm_content ?? null,
        };
        if (row.kind === "event" && !campaign.utm_campaign && !campaign.utm_source) {
          // Credit the conversion to the campaign that brought this visitor in today, if any.
          const [rows] = await db.query<RowDataPacket[]>(
            `SELECT utm_source, utm_medium, utm_campaign, utm_term, utm_content
             FROM analytics_events
             WHERE visitor_hash = ? AND created_at >= CURRENT_DATE AND (utm_campaign IS NOT NULL OR utm_source IS NOT NULL)
             ORDER BY created_at DESC LIMIT 1`,
            [row.visitor_hash],
          );
          if (rows[0]) campaign = rows[0] as typeof campaign;
        }

        await db.query(
          `INSERT INTO analytics_events
             (kind, event_name, path, lang, referrer_host, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
              country, device, browser, os, visitor_hash)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.kind,
            row.event_name,
            row.path,
            row.lang,
            row.referrer_host,
            campaign.utm_source,
            campaign.utm_medium,
            campaign.utm_campaign,
            campaign.utm_term,
            campaign.utm_content,
            row.country,
            row.device,
            row.browser,
            row.os,
            row.visitor_hash,
          ],
        );

        if (Math.random() < 0.002) {
          await db.query(`DELETE FROM analytics_events WHERE created_at < NOW() - make_interval(months => ?::int)`, [
            RETENTION_MONTHS,
          ]);
        }
      } catch (error) {
        if (!warned) {
          warned = true;
          console.warn("Website statistics could not be saved:", error instanceof Error ? error.message : error);
        }
      }
    },
    updateEvent() {
      // Nextlytics offers to add browser details to the first page view; we do not keep them.
    },
  };
}

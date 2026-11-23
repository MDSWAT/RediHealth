import { getControlDatabase, type ResultSetHeader, type RowDataPacket } from "@/lib/database";
import { ANALYTICS_EVENTS } from "@/lib/analytics";
import type { ValidCampaignLink } from "@/lib/campaign-links";

const CONVERSION_EVENT_SQL = ANALYTICS_EVENTS.map((name) => `'${name}'`).join(", ");

/**
 * Saved ad links (table campaign_links) with what each one brought, measured on our own site:
 * a visitor "came from" a link when their first page of the day carried exactly its utm_* tags.
 */
export type CampaignLinkStats = {
  /** Page loads that carried the link's tags ("landing page views"). */
  landingViews: number;
  /** People (one person on one day) whose visit started from the link. */
  visitors: number;
  pageviews: number;
  /** Visitors who left after a single page. */
  bounces: number;
  /** Mean seconds between the first and last recorded action of visitors who saw two or more pages. */
  avgSeconds: number | null;
  conversions: number;
  countries: { code: string | null; visitors: number }[];
};

export type SavedCampaignLink = {
  id: number;
  label: string;
  campaign: string;
  source: string;
  medium: string;
  content: string | null;
  path: string;
  lang: string;
  url: string;
  createdAt: string;
  stats: CampaignLinkStats;
};

const EMPTY_STATS: CampaignLinkStats = {
  landingViews: 0,
  visitors: 0,
  pageviews: 0,
  bounces: 0,
  avgSeconds: null,
  conversions: 0,
  countries: [],
};

async function rows<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const [result] = await getControlDatabase().query<RowDataPacket[]>(sql, params);
  return result as unknown as T[];
}

const DEFAULT_ANALYTICS_WINDOW_DAYS = 365;
const MAX_ANALYTICS_WINDOW_DAYS = 365;

export type ListCampaignLinksOptions = {
  /** Number of trailing days of analytics_events to scan (1..365). Defaults to 365. */
  days?: number;
  /** Skip analytics aggregation when only link metadata is needed. */
  includeStats?: boolean;
};

/** Matches an analytics row (alias e) to a saved link (alias l) by its tags. */
const MATCH = `e.utm_source = l.source AND e.utm_medium = l.medium AND e.utm_campaign = l.campaign
  AND e.utm_content IS NOT DISTINCT FROM l.content`;

export async function listCampaignLinks(options: ListCampaignLinksOptions = {}): Promise<SavedCampaignLink[]> {
  const links = await rows<{
    id: number;
    label: string;
    campaign: string;
    source: string;
    medium: string;
    content: string | null;
    path: string;
    lang: string;
    url: string;
    created_at: Date;
  }>(
    `SELECT id, label, campaign, source, medium, content, path, lang, url, created_at
     FROM campaign_links ORDER BY created_at DESC, id DESC LIMIT 300`,
  );
  if (links.length === 0) return [];

  if (options.includeStats === false) {
    return links.map((link) => ({
      id: link.id,
      label: link.label,
      campaign: link.campaign,
      source: link.source,
      medium: link.medium,
      content: link.content,
      path: link.path,
      lang: link.lang,
      url: link.url,
      createdAt: new Date(link.created_at).toISOString(),
      stats: { ...EMPTY_STATS, countries: [] },
    }));
  }

  const rawDays = options.days ?? DEFAULT_ANALYTICS_WINDOW_DAYS;
  const windowDays = Number.isFinite(rawDays)
    ? Math.min(MAX_ANALYTICS_WINDOW_DAYS, Math.max(1, Math.trunc(rawDays)))
    : DEFAULT_ANALYTICS_WINDOW_DAYS;
  const linkIds = links.map((link) => link.id);
  const linkIdPlaceholders = linkIds.map(() => "?").join(", ");

  const [behaviour, landing, countries] = await Promise.all([
    rows<{ link_id: number; visitors: number; pageviews: number; bounces: number; avg_seconds: number | null; conversions: number }>(
      `WITH landings AS (
         SELECT DISTINCT ON (visitor_hash) visitor_hash, utm_source, utm_medium, utm_campaign, utm_content
         FROM analytics_events
         WHERE kind = 'pageview' AND created_at >= NOW() - make_interval(days => ?::int)
         ORDER BY visitor_hash, created_at
       ),
       link_visitors AS (
         SELECT l.id AS link_id, e.visitor_hash
         FROM campaign_links l JOIN landings e ON ${MATCH}
         WHERE l.id IN (${linkIdPlaceholders})
       ),
       per_visitor AS (
         SELECT lv.link_id, lv.visitor_hash,
                COUNT(*) FILTER (WHERE a.kind = 'pageview') AS pages,
                COUNT(*) FILTER (WHERE a.kind = 'event' AND a.event_name IN (${CONVERSION_EVENT_SQL})) AS conversions,
                EXTRACT(EPOCH FROM MAX(a.created_at) - MIN(a.created_at)) AS seconds
         FROM link_visitors lv
         JOIN analytics_events a
           ON a.visitor_hash = lv.visitor_hash
          AND a.created_at >= NOW() - make_interval(days => ?::int)
         GROUP BY lv.link_id, lv.visitor_hash
       )
       SELECT link_id,
              COUNT(*)::int AS visitors,
              SUM(pages)::int AS pageviews,
              COUNT(*) FILTER (WHERE pages <= 1)::int AS bounces,
              ROUND(AVG(seconds) FILTER (WHERE pages > 1))::int AS avg_seconds,
              SUM(conversions)::int AS conversions
       FROM per_visitor GROUP BY link_id`,
      [windowDays, ...linkIds, windowDays],
    ),
    rows<{ link_id: number; views: number }>(
      `SELECT l.id AS link_id, COUNT(*)::int AS views
       FROM campaign_links l
       JOIN analytics_events e
         ON e.kind = 'pageview'
        AND e.created_at >= NOW() - make_interval(days => ?::int)
        AND ${MATCH}
       WHERE l.id IN (${linkIdPlaceholders})
       GROUP BY l.id`,
      [windowDays, ...linkIds],
    ),
    rows<{ link_id: number; country: string | null; visitors: number }>(
      `WITH landings AS (
         SELECT DISTINCT ON (visitor_hash) visitor_hash, country, utm_source, utm_medium, utm_campaign, utm_content
         FROM analytics_events
         WHERE kind = 'pageview' AND created_at >= NOW() - make_interval(days => ?::int)
         ORDER BY visitor_hash, created_at
       )
       SELECT l.id AS link_id, e.country, COUNT(*)::int AS visitors
       FROM campaign_links l JOIN landings e ON ${MATCH}
       WHERE l.id IN (${linkIdPlaceholders})
       GROUP BY l.id, e.country ORDER BY visitors DESC`,
      [windowDays, ...linkIds],
    ),
  ]);

  const stats = new Map<number, CampaignLinkStats>();
  const statsFor = (id: number) => {
    if (!stats.has(id)) stats.set(id, { ...EMPTY_STATS, countries: [] });
    return stats.get(id)!;
  };
  for (const row of behaviour) {
    Object.assign(statsFor(row.link_id), {
      visitors: row.visitors,
      pageviews: row.pageviews,
      bounces: row.bounces,
      avgSeconds: row.avg_seconds,
      conversions: row.conversions,
    });
  }
  for (const row of landing) statsFor(row.link_id).landingViews = row.views;
  for (const row of countries) {
    const entry = statsFor(row.link_id);
    if (entry.countries.length < 5) entry.countries.push({ code: row.country, visitors: row.visitors });
  }

  return links.map((link) => ({
    id: link.id,
    label: link.label,
    campaign: link.campaign,
    source: link.source,
    medium: link.medium,
    content: link.content,
    path: link.path,
    lang: link.lang,
    url: link.url,
    createdAt: new Date(link.created_at).toISOString(),
    stats: stats.get(link.id) ?? { ...EMPTY_STATS, countries: [] },
  }));
}

/** Saves links; one that already exists (same URL) is kept as it is. Returns how many were new. */
export async function saveCampaignLinks(links: ValidCampaignLink[], createdByEmail: string): Promise<number> {
  let added = 0;
  for (const link of links) {
    const [result] = await getControlDatabase().query<ResultSetHeader>(
      `INSERT INTO campaign_links (label, campaign, source, medium, content, path, lang, url, created_by_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (url) DO NOTHING`,
      [link.label, link.campaign, link.source, link.medium, link.content, link.path, link.lang, link.url, createdByEmail],
    );
    added += result.affectedRows;
  }
  return added;
}

export async function deleteCampaignLink(id: number): Promise<boolean> {
  const [result] = await getControlDatabase().query<ResultSetHeader>("DELETE FROM campaign_links WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

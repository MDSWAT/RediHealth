import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics";

/**
 * Aggregates for the panel's statistics page (/panel/analytics). A "visitor" is one person on one
 * day: the visitor hash changes every day, so the same person on two days counts twice.
 * Sources, campaigns, countries, devices and languages are taken from each visitor's first page
 * of the day (the landing page), where the referrer and the ad's utm_* tags are known.
 */

const TZ = "Europe/Bucharest";
/** Start of the first day of the range, in local time. The one parameter is the number of days. */
const SINCE = `((date_trunc('day', NOW() AT TIME ZONE '${TZ}') - make_interval(days => ?::int - 1)) AT TIME ZONE '${TZ}')`;
const LANDINGS = `WITH landings AS (
  SELECT DISTINCT ON (visitor_hash) *
  FROM analytics_events
  WHERE kind = 'pageview' AND created_at >= ${SINCE}
  ORDER BY visitor_hash, created_at
)`;

export type DailyPoint = { day: string; visitors: number; pageviews: number; events: number };
export type CountRow = { label: string | null; visitors: number };
export type PageRow = { path: string; views: number; visitors: number };
export type CampaignRow = {
  campaign: string | null;
  source: string | null;
  medium: string | null;
  /** utm_content: the ad variant, e.g. one line per video. */
  content: string | null;
  visitors: number;
  conversions: number;
};
export type EventRow = { name: string; count: number; visitors: number };

export type AnalyticsSummary = {
  range: AnalyticsRange;
  totals: { visitors: number; pageviews: number; events: number };
  /** Behaviour on the site: one-page visits and the mean time between first and last action. */
  behaviour: { bounces: number; avgSeconds: number | null };
  daily: DailyPoint[];
  pages: PageRow[];
  landingPages: CountRow[];
  sources: CountRow[];
  campaigns: CampaignRow[];
  countries: CountRow[];
  devices: CountRow[];
  languages: CountRow[];
  events: EventRow[];
};

export type AnalyticsResult =
  | { status: "ok"; summary: AnalyticsSummary }
  | { status: "no-database" }
  | { status: "not-migrated" }
  | { status: "error" };

export function parseRange(value: string | string[] | undefined): AnalyticsRange {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return (ANALYTICS_RANGES as readonly number[]).includes(number) ? (number as AnalyticsRange) : 30;
}

async function rows<T>(sql: string, params: unknown[]): Promise<T[]> {
  const [result] = await getControlDatabase().query<RowDataPacket[]>(sql, params);
  return result as unknown as T[];
}

function grouped(column: string, range: number, limit = 10) {
  return rows<CountRow>(
    `${LANDINGS}
     SELECT ${column} AS label, COUNT(*)::int AS visitors
     FROM landings GROUP BY 1 ORDER BY visitors DESC, label LIMIT ${limit}`,
    [range],
  );
}

export async function getAnalyticsSummary(range: AnalyticsRange): Promise<AnalyticsResult> {
  if (!hasControlDatabase()) return { status: "no-database" };

  try {
    const [daily, pages, landingPages, sources, campaigns, countries, devices, languages, events, behaviourRows] = await Promise.all([
      rows<DailyPoint>(
        `WITH days AS (
           SELECT generate_series((NOW() AT TIME ZONE '${TZ}')::date - (?::int - 1), (NOW() AT TIME ZONE '${TZ}')::date, '1 day')::date AS day
         ),
         views AS (
           SELECT (created_at AT TIME ZONE '${TZ}')::date AS day, COUNT(DISTINCT visitor_hash)::int AS visitors, COUNT(*)::int AS pageviews
           FROM analytics_events WHERE kind = 'pageview' AND created_at >= ${SINCE} GROUP BY 1
         ),
         conversions AS (
           SELECT (created_at AT TIME ZONE '${TZ}')::date AS day, COUNT(*)::int AS events
           FROM analytics_events WHERE kind = 'event' AND created_at >= ${SINCE} GROUP BY 1
         )
         SELECT to_char(days.day, 'YYYY-MM-DD') AS day,
                COALESCE(views.visitors, 0) AS visitors,
                COALESCE(views.pageviews, 0) AS pageviews,
                COALESCE(conversions.events, 0) AS events
         FROM days
         LEFT JOIN views ON views.day = days.day
         LEFT JOIN conversions ON conversions.day = days.day
         ORDER BY days.day`,
        [range, range, range],
      ),
      rows<PageRow>(
        `SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_hash)::int AS visitors
         FROM analytics_events WHERE kind = 'pageview' AND created_at >= ${SINCE}
         GROUP BY path ORDER BY views DESC, path LIMIT 10`,
        [range],
      ),
      grouped("path", range),
      grouped("COALESCE(utm_source, referrer_host)", range),
      rows<CampaignRow>(
        `${LANDINGS},
         campaign_visits AS (
           SELECT utm_campaign AS campaign, utm_source AS source, utm_medium AS medium, utm_content AS content, COUNT(*)::int AS visitors
           FROM landings WHERE utm_campaign IS NOT NULL OR utm_source IS NOT NULL OR utm_medium IS NOT NULL
           GROUP BY 1, 2, 3, 4
         ),
         campaign_conversions AS (
           SELECT utm_campaign AS campaign, utm_source AS source, utm_medium AS medium, utm_content AS content, COUNT(*)::int AS conversions
           FROM analytics_events
           WHERE kind = 'event' AND created_at >= ${SINCE}
             AND (utm_campaign IS NOT NULL OR utm_source IS NOT NULL OR utm_medium IS NOT NULL)
           GROUP BY 1, 2, 3, 4
         )
         SELECT v.campaign, v.source, v.medium, v.content, v.visitors, COALESCE(c.conversions, 0) AS conversions
         FROM campaign_visits v
         LEFT JOIN campaign_conversions c
           ON c.campaign IS NOT DISTINCT FROM v.campaign
          AND c.source IS NOT DISTINCT FROM v.source
          AND c.medium IS NOT DISTINCT FROM v.medium
          AND c.content IS NOT DISTINCT FROM v.content
         ORDER BY v.visitors DESC LIMIT 20`,
        [range, range],
      ),
      grouped("country", range, 15),
      grouped("device", range),
      grouped("lang", range),
      rows<EventRow>(
        `SELECT event_name AS name, COUNT(*)::int AS count, COUNT(DISTINCT visitor_hash)::int AS visitors
         FROM analytics_events WHERE kind = 'event' AND created_at >= ${SINCE} AND event_name IS NOT NULL
         GROUP BY event_name ORDER BY count DESC`,
        [range],
      ),
      rows<{ bounces: number; avg_seconds: number | null }>(
        `WITH per_visitor AS (
           SELECT visitor_hash,
                  COUNT(*) FILTER (WHERE kind = 'pageview') AS pages,
                  EXTRACT(EPOCH FROM MAX(created_at) - MIN(created_at)) AS seconds
           FROM analytics_events WHERE created_at >= ${SINCE}
           GROUP BY visitor_hash
         )
         SELECT COUNT(*) FILTER (WHERE pages = 1)::int AS bounces,
                ROUND(AVG(seconds) FILTER (WHERE pages > 1))::int AS avg_seconds
         FROM per_visitor`,
        [range],
      ),
    ]);

    const totals = daily.reduce(
      (sum, point) => ({
        visitors: sum.visitors + point.visitors,
        pageviews: sum.pageviews + point.pageviews,
        events: sum.events + point.events,
      }),
      { visitors: 0, pageviews: 0, events: 0 },
    );

    return {
      status: "ok",
      summary: {
        range,
        totals,
        behaviour: { bounces: behaviourRows[0]?.bounces ?? 0, avgSeconds: behaviourRows[0]?.avg_seconds ?? null },
        daily, pages, landingPages, sources, campaigns, countries, devices, languages, events },
    };
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return { status: "not-migrated" };
    console.error("Statistics could not be loaded:", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}

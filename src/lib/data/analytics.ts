import { getControlDatabase, hasControlDatabase, type RowDataPacket } from "@/lib/database";
import { ANALYTICS_EVENTS, ANALYTICS_RANGES, type AnalyticsRange } from "@/lib/analytics";

/**
 * Aggregates for the panel's statistics page (/panel/analytics). A "visitor" is one person on one
 * day: the visitor hash changes every day, so the same person on two days counts twice.
 * Sources, campaigns, countries, devices and languages are taken from each visitor's first page
 * of the day (the landing page), where the referrer and the ad's utm_* tags are known.
 */

const TZ = "Europe/Bucharest";
/** Start of the first day of the range, in local time. The one parameter is the number of days. */
const SINCE = `((date_trunc('day', NOW() AT TIME ZONE '${TZ}') - make_interval(days => ?::int - 1)) AT TIME ZONE '${TZ}')`;
const CONVERSION_EVENT_SQL = ANALYTICS_EVENTS.map((name) => `'${name}'`).join(", ");
const LANDINGS = `WITH landings AS (
  SELECT DISTINCT ON (visitor_hash) *
  FROM analytics_events
  WHERE kind = 'pageview' AND created_at >= ${SINCE}
  ORDER BY visitor_hash, created_at
)`;

export type DailyPoint = { day: string; visitors: number; pageviews: number; events: number };
export type CountRow = { label: string | null; visitors: number };
export type PageRow = {
  path: string;
  views: number;
  visitors: number;
  avgSeconds: number | null;
  avgScrollDepth: number | null;
};
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

export type JourneyTransitionRow = {
  fromPath: string;
  toPath: string;
  visitors: number;
  transitions: number;
};

export type JourneyPathRow = {
  steps: string[];
  visitors: number;
};

export type ClickInsightRow = {
  targetKey: string;
  targetLabel: string;
  targetKind: string;
  path: string;
  clicks: number;
  visitors: number;
};

export type FeedbackPromptFunnel = {
  initialShown: number;
  followupShown: number;
  dismissed: number;
  submitted: number;
};

export type AnalyticsSummary = {
  range: AnalyticsRange;
  totals: { visitors: number; pageviews: number; events: number };
  /** Behaviour on the site: bounces, engaged stay count, session time, and per-page dwell/scroll. */
  behaviour: {
    bounces: number;
    avgSeconds: number | null;
    avgPageSeconds: number | null;
    engagedVisitors: number;
    avgScrollDepth: number | null;
  };
  daily: DailyPoint[];
  pages: PageRow[];
  landingPages: CountRow[];
  sources: CountRow[];
  campaigns: CampaignRow[];
  countries: CountRow[];
  devices: CountRow[];
  languages: CountRow[];
  events: EventRow[];
  journeys: {
    transitions: JourneyTransitionRow[];
    paths: JourneyPathRow[];
    exits: CountRow[];
  };
  clicks: ClickInsightRow[];
  feedbackFunnel: FeedbackPromptFunnel;
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

/** Runs an optional query that relies on migration 004 columns; returns fallback if columns do not exist yet. */
async function optionalRows<T>(sql: string, params: unknown[], fallback: T[]): Promise<T[]> {
  try {
    return await rows<T>(sql, params);
  } catch (error) {
    if ((error as { code?: string }).code === "42703") return fallback;
    throw error;
  }
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
    const [
      daily,
      rawPages,
      landingPages,
      sources,
      campaigns,
      countries,
      devices,
      languages,
      events,
      behaviourRows,
      transitionRows,
      journeyPathRows,
      exitRows,
      pageEngagementRows,
      overallEngagementRows,
      clickRows,
      funnelRows,
    ] = await Promise.all([
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
           FROM analytics_events
           WHERE kind = 'event' AND event_name IN (${CONVERSION_EVENT_SQL}) AND created_at >= ${SINCE}
           GROUP BY 1
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
      rows<{ path: string; views: number; visitors: number }>(
        `SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT visitor_hash)::int AS visitors
         FROM analytics_events WHERE kind = 'pageview' AND created_at >= ${SINCE}
         GROUP BY path ORDER BY views DESC, path LIMIT 12`,
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
           WHERE kind = 'event' AND event_name IN (${CONVERSION_EVENT_SQL}) AND created_at >= ${SINCE}
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
         FROM analytics_events
         WHERE kind = 'event' AND event_name IN (${CONVERSION_EVENT_SQL}) AND created_at >= ${SINCE}
         GROUP BY event_name ORDER BY count DESC`,
        [range],
      ),
      rows<{ bounces: number; avg_seconds: number | null; multi_page_visitors: number }>(
        `WITH per_visitor AS (
           SELECT visitor_hash,
                  COUNT(*) FILTER (WHERE kind = 'pageview') AS pages,
                  EXTRACT(EPOCH FROM MAX(created_at) - MIN(created_at)) AS seconds
           FROM analytics_events WHERE created_at >= ${SINCE}
           GROUP BY visitor_hash
         )
         SELECT COUNT(*) FILTER (WHERE pages = 1)::int AS bounces,
                COUNT(*) FILTER (WHERE pages > 1)::int AS multi_page_visitors,
                ROUND(AVG(seconds) FILTER (WHERE pages > 1))::int AS avg_seconds
         FROM per_visitor`,
        [range],
      ),
      // Top page-to-page transitions (works immediately on all pageview data)
      rows<{ from_path: string; to_path: string; visitors: number; transitions: number }>(
        `WITH ordered AS (
           SELECT visitor_hash, path AS from_path,
                  LEAD(path) OVER (PARTITION BY visitor_hash ORDER BY created_at, id) AS to_path
           FROM analytics_events
           WHERE kind = 'pageview' AND created_at >= ${SINCE}
         )
         SELECT from_path, to_path,
                COUNT(DISTINCT visitor_hash)::int AS visitors,
                COUNT(*)::int AS transitions
         FROM ordered
         WHERE to_path IS NOT NULL AND to_path <> from_path
         GROUP BY from_path, to_path
         ORDER BY visitors DESC, transitions DESC
         LIMIT 12`,
        [range],
      ),
      // Top multi-step user journeys (deduped consecutive repeats, up to 4 steps per visitor)
      rows<{ journey: string; visitors: number }>(
        `WITH ordered AS (
           SELECT visitor_hash, path, created_at, id,
                  LAG(path) OVER (PARTITION BY visitor_hash ORDER BY created_at, id) AS prev_path
           FROM analytics_events
           WHERE kind = 'pageview' AND created_at >= ${SINCE}
         ),
         deduped AS (
           SELECT visitor_hash, path,
                  ROW_NUMBER() OVER (PARTITION BY visitor_hash ORDER BY created_at, id) AS step_no
           FROM ordered
           WHERE prev_path IS NULL OR path <> prev_path
         ),
         paths AS (
           SELECT visitor_hash,
                  STRING_AGG(path, ' -> ' ORDER BY step_no) AS journey,
                  COUNT(*)::int AS step_count
           FROM deduped
           WHERE step_no <= 4
           GROUP BY visitor_hash
         )
         SELECT journey, COUNT(*)::int AS visitors
         FROM paths
         WHERE step_count >= 2
         GROUP BY journey
         ORDER BY visitors DESC, journey
         LIMIT 10`,
        [range],
      ),
      // Top exit pages (last page seen per visitor)
      rows<CountRow>(
        `WITH exits AS (
           SELECT DISTINCT ON (visitor_hash) path
           FROM analytics_events
           WHERE kind = 'pageview' AND created_at >= ${SINCE}
           ORDER BY visitor_hash, created_at DESC, id DESC
         )
         SELECT path AS label, COUNT(*)::int AS visitors
         FROM exits
         GROUP BY 1
         ORDER BY visitors DESC, label
         LIMIT 8`,
        [range],
      ),
      // Per-page average dwell time & scroll depth (migration 004; graceful fallback if unmigrated)
      optionalRows<{ path: string; avg_seconds: number | null; avg_scroll: number | null }>(
        `WITH per_visitor_page AS (
           SELECT visitor_hash, path,
                  SUM(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) AS total_ms,
                  MAX(scroll_depth) FILTER (WHERE scroll_depth IS NOT NULL) AS max_scroll
           FROM analytics_events
           WHERE kind = 'event' AND event_name = 'page_engagement' AND created_at >= ${SINCE}
           GROUP BY visitor_hash, path
         )
         SELECT path,
                ROUND(AVG(total_ms) / 1000.0)::int AS avg_seconds,
                ROUND(AVG(max_scroll))::int AS avg_scroll
         FROM per_visitor_page
         GROUP BY path`,
        [range],
        [],
      ),
      // Overall engaged stay count + average page dwell time + average scroll depth
      optionalRows<{
        avg_page_seconds: number | null;
        avg_scroll_depth: number | null;
        engaged_visitors: number;
      }>(
        `WITH per_visitor AS (
           SELECT visitor_hash,
                  COUNT(*) FILTER (WHERE kind = 'pageview') AS pages,
                  COALESCE(SUM(duration_ms) FILTER (WHERE event_name = 'page_engagement'), 0) AS dwell_ms,
                  MAX(scroll_depth) FILTER (WHERE event_name = 'page_engagement') AS max_scroll,
                  COUNT(*) FILTER (WHERE event_name IN ('ui_click', ${CONVERSION_EVENT_SQL})) AS interactions
           FROM analytics_events
           WHERE created_at >= ${SINCE}
           GROUP BY visitor_hash
         ),
         per_page_dwell AS (
           SELECT visitor_hash, path,
                  SUM(duration_ms) AS total_ms,
                  MAX(scroll_depth) AS max_scroll
           FROM analytics_events
           WHERE event_name = 'page_engagement' AND created_at >= ${SINCE}
           GROUP BY visitor_hash, path
         )
         SELECT
           (SELECT ROUND(AVG(total_ms) / 1000.0)::int FROM per_page_dwell WHERE total_ms IS NOT NULL AND total_ms > 0) AS avg_page_seconds,
           (SELECT ROUND(AVG(max_scroll))::int FROM per_page_dwell WHERE max_scroll IS NOT NULL) AS avg_scroll_depth,
           COUNT(*) FILTER (WHERE pages > 1 OR dwell_ms >= 15000 OR max_scroll >= 50 OR interactions > 0)::int AS engaged_visitors
         FROM per_visitor
         WHERE pages > 0`,
        [range, range],
        [],
      ),
      // Top tapped / clicked UI elements
      optionalRows<{
        target_key: string;
        target_label: string | null;
        target_kind: string | null;
        path: string;
        clicks: number;
        visitors: number;
      }>(
        `SELECT target_key,
                MAX(target_label) AS target_label,
                MAX(target_kind) AS target_kind,
                path,
                COUNT(*)::int AS clicks,
                COUNT(DISTINCT visitor_hash)::int AS visitors
         FROM analytics_events
         WHERE kind = 'event' AND event_name = 'ui_click' AND target_key IS NOT NULL AND created_at >= ${SINCE}
         GROUP BY target_key, path
         ORDER BY clicks DESC, visitors DESC
         LIMIT 15`,
        [range],
        [],
      ),
      // Smart feedback popup conversion funnel
      optionalRows<{ event_name: string; target_key: string | null; count: number }>(
        `SELECT event_name, target_key, COUNT(*)::int AS count
         FROM analytics_events
         WHERE kind = 'event'
           AND event_name IN ('feedback_prompt_shown', 'feedback_prompt_dismissed', 'feedback_sent')
           AND created_at >= ${SINCE}
         GROUP BY event_name, target_key`,
        [range],
        [],
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

    const engagementByPath = new Map(
      pageEngagementRows.map((row) => [
        row.path,
        { avgSeconds: row.avg_seconds, avgScrollDepth: row.avg_scroll },
      ]),
    );

    const pages: PageRow[] = rawPages.map((row) => {
      const extra = engagementByPath.get(row.path);
      return {
        path: row.path,
        views: row.views,
        visitors: row.visitors,
        avgSeconds: extra?.avgSeconds ?? null,
        avgScrollDepth: extra?.avgScrollDepth ?? null,
      };
    });

    const overallEng = overallEngagementRows[0];
    const fallbackEngaged = behaviourRows[0]?.multi_page_visitors ?? 0;

    let initialShown = 0;
    let followupShown = 0;
    let dismissed = 0;
    let feedbackSubmitted = 0;
    for (const row of funnelRows) {
      if (row.event_name === "feedback_prompt_shown") {
        if (row.target_key === "feedback_prompt:followup") followupShown += row.count;
        else initialShown += row.count;
      } else if (row.event_name === "feedback_prompt_dismissed") {
        dismissed += row.count;
      } else if (row.event_name === "feedback_sent") {
        feedbackSubmitted += row.count;
      }
    }
    if (feedbackSubmitted === 0) {
      feedbackSubmitted = events.find((e) => e.name === "feedback_sent")?.count ?? 0;
    }

    return {
      status: "ok",
      summary: {
        range,
        totals,
        behaviour: {
          bounces: behaviourRows[0]?.bounces ?? 0,
          avgSeconds: behaviourRows[0]?.avg_seconds ?? null,
          avgPageSeconds: overallEng?.avg_page_seconds ?? null,
          engagedVisitors: overallEng?.engaged_visitors ?? fallbackEngaged,
          avgScrollDepth: overallEng?.avg_scroll_depth ?? null,
        },
        daily,
        pages,
        landingPages,
        sources,
        campaigns,
        countries,
        devices,
        languages,
        events,
        journeys: {
          transitions: transitionRows.map((row) => ({
            fromPath: row.from_path,
            toPath: row.to_path,
            visitors: row.visitors,
            transitions: row.transitions,
          })),
          paths: journeyPathRows.map((row) => ({
            steps: row.journey.split(" -> ").filter(Boolean),
            visitors: row.visitors,
          })),
          exits: exitRows,
        },
        clicks: clickRows.map((row) => ({
          targetKey: row.target_key,
          targetLabel: row.target_label || row.target_key,
          targetKind: row.target_kind || "control",
          path: row.path,
          clicks: row.clicks,
          visitors: row.visitors,
        })),
        feedbackFunnel: {
          initialShown,
          followupShown,
          dismissed,
          submitted: feedbackSubmitted,
        },
      },
    };
  } catch (error) {
    if ((error as { code?: string }).code === "42P01") return { status: "not-migrated" };
    console.error("Statistics could not be loaded:", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}

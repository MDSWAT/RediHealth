import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/database", () => ({
  getControlDatabase: () => ({ query: mocks.query }),
}));

import { listCampaignLinks } from "./campaign-links";

describe("listCampaignLinks analytics windowing (M5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.query.mockReset();
  });

  it("bounds every analytics_events query to a trailing date window and fetched link IDs", async () => {
    mocks.query
      .mockResolvedValueOnce([[{
        id: 10,
        label: "Spring campaign",
        campaign: "spring",
        source: "facebook",
        medium: "paid",
        content: null,
        path: "/",
        lang: "ro",
        url: "https://redihealth.org/?utm_source=facebook",
        created_at: new Date("2026-01-01T00:00:00Z"),
      }]])
      .mockResolvedValueOnce([[{ link_id: 10, visitors: 12, pageviews: 25, bounces: 4, avg_seconds: 90, conversions: 2 }]])
      .mockResolvedValueOnce([[{ link_id: 10, views: 15 }]])
      .mockResolvedValueOnce([[{ link_id: 10, country: "RO", visitors: 12 }]]);

    const result = await listCampaignLinks();
    expect(result).toHaveLength(1);
    expect(result[0].stats).toMatchObject({ landingViews: 15, visitors: 12, pageviews: 25, bounces: 4, avgSeconds: 90, conversions: 2 });

    // Queries 1, 2, 3 scan analytics_events and must all bound created_at + l.id
    for (const call of mocks.query.mock.calls.slice(1)) {
      const [sql, params] = call;
      expect(String(sql)).toContain("created_at >= NOW() - make_interval(days => ?::int)");
      expect(String(sql)).toContain("l.id IN (?)");
      expect(params[0]).toBe(365);
    }
  });

  it("skips analytics_events scans when includeStats is false", async () => {
    mocks.query.mockResolvedValueOnce([[{
      id: 11,
      label: "Quick",
      campaign: "q",
      source: "x",
      medium: "y",
      content: null,
      path: "/",
      lang: "ro",
      url: "https://redihealth.org/?utm_source=x",
      created_at: new Date("2026-01-01T00:00:00Z"),
    }]]);

    const result = await listCampaignLinks({ includeStats: false });
    expect(result).toHaveLength(1);
    expect(mocks.query).toHaveBeenCalledTimes(1);
  });
});

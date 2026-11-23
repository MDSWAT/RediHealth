import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  requireSuperAdmin: vi.fn(),
  hasControlDatabase: vi.fn(() => true),
  listCampaignLinks: vi.fn(),
  saveCampaignLinks: vi.fn(),
  deleteCampaignLink: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/lib/super-admin", () => ({
  requireSuperAdmin: mocks.requireSuperAdmin,
}));
vi.mock("@/lib/database", () => ({
  hasControlDatabase: mocks.hasControlDatabase,
}));
vi.mock("@/lib/data/campaign-links", () => ({
  listCampaignLinks: mocks.listCampaignLinks,
  saveCampaignLinks: mocks.saveCampaignLinks,
  deleteCampaignLink: mocks.deleteCampaignLink,
}));
vi.mock("@/lib/activity-log", () => ({
  logActivity: mocks.logActivity,
}));
vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "198.51.100.1",
}));

import { DELETE, GET, POST } from "./route";

describe("/api/admin/campaign-links Super Admin enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasControlDatabase.mockReturnValue(true);
    mocks.listCampaignLinks.mockResolvedValue([]);
    mocks.saveCampaignLinks.mockResolvedValue(1);
    mocks.deleteCampaignLink.mockResolvedValue(true);
    mocks.logActivity.mockResolvedValue(true);
  });

  it("rejects non-super-admin Administrators on GET, POST, and DELETE", async () => {
    mocks.requireSuperAdmin.mockResolvedValue({
      error: NextResponse.json({ error: "Super admin access is required." }, { status: 403 }),
    });

    expect((await GET()).status).toBe(403);
    expect(
      (
        await POST(
          new Request("https://redi.healthcare/api/admin/campaign-links", {
            method: "POST",
            body: JSON.stringify({ links: [] }),
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await DELETE(
          new Request("https://redi.healthcare/api/admin/campaign-links?id=1", {
            method: "DELETE",
          }),
        )
      ).status,
    ).toBe(403);
    expect(mocks.listCampaignLinks).not.toHaveBeenCalled();
    expect(mocks.deleteCampaignLink).not.toHaveBeenCalled();
  });

  it("allows Super Admins to list and delete campaign links", async () => {
    mocks.requireSuperAdmin.mockResolvedValue({
      email: "super@example.com",
      worker: {
        country: "RO",
        workerId: "1",
        workerName: "Super",
        role: "Super Admin",
        isAdmin: true,
        isSuperAdmin: true,
      },
    });

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    expect(await getRes.json()).toEqual({ links: [] });

    const delRes = await DELETE(
      new Request("https://redi.healthcare/api/admin/campaign-links?id=5", {
        method: "DELETE",
      }),
    );
    expect(delRes.status).toBe(200);
    expect(mocks.deleteCampaignLink).toHaveBeenCalledWith(5);
  });
});

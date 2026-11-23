import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSuperAdmin: vi.fn(),
  listInstitutesForAdmin: vi.fn(),
  getInstituteForAdmin: vi.fn(),
  setSetting: vi.fn(),
  getAlertRecipients: vi.fn(),
  logActivity: vi.fn(),
}));

vi.mock("@/lib/super-admin", () => ({ requireSuperAdmin: mocks.requireSuperAdmin }));
vi.mock("@/lib/data/medical-institutes", () => ({
  listInstitutesForAdmin: mocks.listInstitutesForAdmin,
  createInstitute: vi.fn(),
  getInstituteForAdmin: mocks.getInstituteForAdmin,
  setInstituteActive: vi.fn(),
  updateInstitute: vi.fn(),
  deleteInstitute: vi.fn(),
}));
vi.mock("@/lib/settings", () => ({
  ALERT_EMAIL_SETTING: "alert_email",
  MAX_ALERT_RECIPIENTS: 10,
  getAlertRecipients: mocks.getAlertRecipients,
  setSetting: mocks.setSetting,
}));
vi.mock("@/lib/activity-log", () => ({ logActivity: mocks.logActivity }));

import { GET as getAdminInstitutes } from "@/app/api/admin/medical-institutes/route";
import { PATCH as patchAdminInstitute } from "@/app/api/admin/medical-institutes/[id]/route";
import { PUT as putAdminSettings } from "@/app/api/admin/settings/route";

describe("Admin medical institutes & settings error hygiene", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSuperAdmin.mockResolvedValue({
      email: "admin@redihealth.org",
      worker: { workerId: 1, workerName: "Admin", role: "Super Admin", country: "RO" },
    });
  });

  it("omits internal migration hints from 503 responses in admin/medical-institutes and admin/settings", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    mocks.listInstitutesForAdmin.mockRejectedValueOnce(new Error("relation missing"));
    const instRes = await getAdminInstitutes(new Request("https://redihealth.org/api/admin/medical-institutes"));
    expect(instRes.status).toBe(503);
    expect(((await instRes.json()) as { error: string }).error).not.toMatch(/migration/i);

    mocks.setSetting.mockRejectedValueOnce(new Error("relation missing"));
    const setRes = await putAdminSettings(
      new Request("https://redihealth.org/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ alertEmails: ["ops@redihealth.org"] }),
      }),
    );
    expect(setRes.status).toBe(503);
    expect(((await setRes.json()) as { error: string }).error).not.toMatch(/migration/i);
  });

  it("catches DB errors from getInstituteForAdmin and rejects non-object JSON in PATCH /api/admin/medical-institutes/[id]", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const ctx = { params: Promise.resolve({ id: "42" }) } as Parameters<typeof patchAdminInstitute>[1];

    const arrayBodyRes = await patchAdminInstitute(
      new Request("https://redihealth.org/api/admin/medical-institutes/42", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: "[]",
      }),
      ctx,
    );
    expect(arrayBodyRes.status).toBe(400);

    mocks.getInstituteForAdmin.mockRejectedValueOnce(new Error("pool timeout"));
    const dbErrRes = await patchAdminInstitute(
      new Request("https://redihealth.org/api/admin/medical-institutes/42", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      }),
      ctx,
    );
    expect(dbErrRes.status).toBe(500);
  });
});

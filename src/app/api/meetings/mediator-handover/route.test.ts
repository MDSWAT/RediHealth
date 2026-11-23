import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  worker: {
    country: "RO" as "RO" | "MD",
    workerId: "10",
    workerName: "Mediator One",
    isAdmin: false,
  },
  email: "mediator1@example.com",
  name: "Mediator One",
  canAccessMeeting: vi.fn(),
}));

vi.mock("@/lib/staff-access", () => ({
  requireStaff: async () => ({
    worker: mocks.worker,
    email: mocks.email,
    name: mocks.name,
  }),
}));

vi.mock("@/lib/record-access", () => ({
  canAccessMeeting: mocks.canAccessMeeting,
}));

import { GET, POST } from "./route";

function postHandover(body: unknown) {
  return POST(
    new Request("https://redi.healthcare/api/meetings/mediator-handover", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("mediator-handover IDOR and ownership enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.worker = {
      country: "RO",
      workerId: "10",
      workerName: "Mediator One",
      isAdmin: false,
    };
    mocks.canAccessMeeting.mockResolvedValue(true);
  });

  it("blocks ?handoverId=meeting:<id> key-namespace collision IDOR attack", async () => {
    const createRes = await postHandover({
      meetingId: 501,
      patientName: "Confidential Patient",
      vitals: { bloodPressure: "140/90" },
      reasonForVisit: "Chest discomfort",
      languageBarrier: false,
    });
    expect(createRes.status).toBe(200);
    const created = (await createRes.json()) as { handoverId: string };
    expect(created.handoverId).toMatch(/^handover-[0-9a-f-]{36}$/i);

    // Switch to another non-admin worker in the same country who cannot access meeting 501.
    mocks.worker = {
      country: "RO",
      workerId: "99",
      workerName: "Other Staff",
      isAdmin: false,
    };
    mocks.canAccessMeeting.mockResolvedValue(false);

    // Exploit attempt 1: key-namespace collision via handoverId=meeting:501
    const collisionRes = await GET(
      new Request("https://redi.healthcare/api/meetings/mediator-handover?handoverId=meeting:501"),
    );
    expect(collisionRes.status).toBe(200);
    expect(await collisionRes.json()).toEqual({ vignette: null });

    // Exploit attempt 2: direct lookup using the real handoverId without meeting access
    const directIdRes = await GET(
      new Request(
        `https://redi.healthcare/api/meetings/mediator-handover?handoverId=${encodeURIComponent(created.handoverId)}`,
      ),
    );
    expect(directIdRes.status).toBe(200);
    expect(await directIdRes.json()).toEqual({ vignette: null });
    expect(mocks.canAccessMeeting).toHaveBeenCalledWith(mocks.worker, 501);

    // Exploit attempt 3: meetingId lookup without meeting access
    const meetingLookupRes = await GET(
      new Request("https://redi.healthcare/api/meetings/mediator-handover?meetingId=501"),
    );
    expect(meetingLookupRes.status).toBe(200);
    expect(await meetingLookupRes.json()).toEqual({ vignette: null });

    // Assigned clinician CAN read both by meetingId and by valid handoverId
    mocks.canAccessMeeting.mockResolvedValue(true);
    const allowedById = await GET(
      new Request(
        `https://redi.healthcare/api/meetings/mediator-handover?handoverId=${encodeURIComponent(created.handoverId)}`,
      ),
    );
    expect((await allowedById.json()).vignette?.patientName).toBe("Confidential Patient");

    const allowedByMeeting = await GET(
      new Request("https://redi.healthcare/api/meetings/mediator-handover?meetingId=501"),
    );
    expect((await allowedByMeeting.json()).vignette?.patientName).toBe("Confidential Patient");
  });

  it("enforces creator/admin ownership on non-meeting handovers", async () => {
    const createRes = await postHandover({
      meetingId: "field-room-alpha",
      patientName: "Field Patient",
      vitals: {},
      reasonForVisit: "Fever",
      languageBarrier: true,
    });
    expect(createRes.status).toBe(200);
    const { handoverId } = (await createRes.json()) as { handoverId: string };

    // Creator can read it
    const creatorRes = await GET(
      new Request(`https://redi.healthcare/api/meetings/mediator-handover?handoverId=${handoverId}`),
    );
    expect((await creatorRes.json()).vignette?.patientName).toBe("Field Patient");

    // Different non-admin worker in the same country cannot read it
    mocks.worker = { country: "RO", workerId: "22", workerName: "Other", isAdmin: false };
    const otherRes = await GET(
      new Request(`https://redi.healthcare/api/meetings/mediator-handover?handoverId=${handoverId}`),
    );
    expect(await otherRes.json()).toEqual({ vignette: null });

    // Admin in the same country can read it
    mocks.worker = { country: "RO", workerId: "1", workerName: "Admin", isAdmin: true };
    const adminRes = await GET(
      new Request(`https://redi.healthcare/api/meetings/mediator-handover?handoverId=${handoverId}`),
    );
    expect((await adminRes.json()).vignette?.patientName).toBe("Field Patient");

    // Admin in another country cannot read it
    mocks.worker = { country: "MD", workerId: "2", workerName: "MD Admin", isAdmin: true };
    const crossCountryRes = await GET(
      new Request(`https://redi.healthcare/api/meetings/mediator-handover?handoverId=${handoverId}`),
    );
    expect(await crossCountryRes.json()).toEqual({ vignette: null });
  });

  it("rejects null and array JSON payloads with 400", async () => {
    expect((await postHandover(null)).status).toBe(400);
    expect((await postHandover([])).status).toBe(400);
  });
});

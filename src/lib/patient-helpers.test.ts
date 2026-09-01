import { describe, expect, it } from "vitest";
import {
  getFollowupState,
  getPriorityMeta,
  getRecommendedFollowupDate,
} from "@/lib/patient-helpers";
import type { FollowupItem } from "@/lib/types/patient";

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function scheduled(date: string): FollowupItem {
  return { id: date, title: "Check-in", date, status: "scheduled" };
}

describe("getRecommendedFollowupDate", () => {
  it("maps each priority to its recommended offset", () => {
    expect(getRecommendedFollowupDate("critical")).toBe(isoDaysFromNow(1));
    expect(getRecommendedFollowupDate("high")).toBe(isoDaysFromNow(3));
    expect(getRecommendedFollowupDate("moderate")).toBe(isoDaysFromNow(7));
    expect(getRecommendedFollowupDate("low")).toBe(isoDaysFromNow(14));
  });

  it("defaults to the moderate offset", () => {
    expect(getRecommendedFollowupDate()).toBe(isoDaysFromNow(7));
  });
});

describe("getPriorityMeta", () => {
  it("returns the matching label and recommended days", () => {
    expect(getPriorityMeta("critical").recommendedDays).toBe(1);
    expect(getPriorityMeta("high").shortLabel).toBe("High");
    expect(getPriorityMeta("low").label).toBe("Low Priority");
  });
});

describe("getFollowupState", () => {
  it("reports 'none' when there are no follow-ups", () => {
    expect(getFollowupState([]).state).toBe("none");
    expect(getFollowupState(null).state).toBe("none");
  });

  it("flags a past scheduled follow-up as overdue", () => {
    expect(getFollowupState([scheduled(isoDaysFromNow(-2))]).state).toBe("overdue");
  });

  it("flags a follow-up due today", () => {
    expect(getFollowupState([scheduled(isoDaysFromNow(0))]).state).toBe("today");
  });

  it("flags a future follow-up as upcoming", () => {
    expect(getFollowupState([scheduled(isoDaysFromNow(5))]).state).toBe("upcoming");
  });

  it("reports 'completed' when nothing is scheduled", () => {
    const completed: FollowupItem = {
      id: "1",
      title: "Done",
      date: isoDaysFromNow(-1),
      status: "completed",
    };
    expect(getFollowupState([completed]).state).toBe("completed");
  });

  it("chooses the earliest scheduled follow-up as the next up", () => {
    const result = getFollowupState([
      scheduled(isoDaysFromNow(9)),
      scheduled(isoDaysFromNow(3)),
    ]);
    expect(result.latest?.date).toBe(isoDaysFromNow(3));
  });
});

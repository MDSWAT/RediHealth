import { describe, expect, it } from "vitest";
import {
  isPatientPriority,
  isPatientStatus,
  validateFollowupInput,
  validatePhotoInput,
} from "@/lib/validation";

describe("enum guards", () => {
  it("accepts only known priorities", () => {
    expect(isPatientPriority("critical")).toBe(true);
    expect(isPatientPriority("urgent")).toBe(false);
    expect(isPatientPriority(42)).toBe(false);
  });

  it("accepts only known statuses", () => {
    expect(isPatientStatus("active")).toBe(true);
    expect(isPatientStatus("deleted")).toBe(false);
  });
});

describe("validateFollowupInput", () => {
  it("accepts a well-formed follow-up and re-derives safe fields", () => {
    const result = validateFollowupInput({
      title: "  Recovery check  ",
      date: "2026-01-15",
      status: "scheduled",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Recovery check");
      expect(result.value.reminder_set).toBe(true);
    }
  });

  it("rejects a missing title", () => {
    expect(validateFollowupInput({ date: "2026-01-15" }).ok).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(validateFollowupInput({ title: "x", date: "15/01/2026" }).ok).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(validateFollowupInput("nope").ok).toBe(false);
  });

  it("falls back to 'scheduled' for an unknown status", () => {
    const result = validateFollowupInput({
      title: "x",
      date: "2026-01-15",
      status: "bogus",
    });
    expect(result.ok && result.value.status).toBe("scheduled");
  });
});

describe("validatePhotoInput", () => {
  const dataUrl = "data:image/png;base64,iVBORw0KGgo=";

  it("accepts an image data URL", () => {
    const result = validatePhotoInput({ data_url: dataUrl, name: "Scan" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Scan");
    }
  });

  it("rejects a non-image data URL", () => {
    expect(validatePhotoInput({ data_url: "data:text/plain;base64,AAAA" }).ok).toBe(
      false,
    );
  });

  it("rejects an oversized payload", () => {
    const huge = `data:image/png;base64,${"A".repeat(7_000_001)}`;
    expect(validatePhotoInput({ data_url: huge }).ok).toBe(false);
  });
});

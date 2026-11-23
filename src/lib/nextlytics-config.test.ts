import { Nextlytics } from "@nextlytics/core/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.restoreAllMocks());

describe("Nextlytics configuration validation", () => {
  it("accepts capture without warning about library-supplied defaults", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    Nextlytics({ capture: () => false, callbacks: {} });
    expect(warn).not.toHaveBeenCalled();
  });

  it("still warns when deprecated options are explicitly supplied", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    Nextlytics({ capture: () => false, callbacks: {}, excludeApiCalls: true });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("excludeApiCalls"));
  });
});

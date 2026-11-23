import { createElement, isValidElement } from "react";
import { headers } from "next/headers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebsiteStatistics } from "./WebsiteStatistics";
import { NextlyticsServer } from "@/nextlytics";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/nextlytics", () => ({ NextlyticsServer: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("website statistics request context", () => {
  const untrackedRequests: Record<string, string>[] = [{}, { "x-nl-active": "1" }];
  it.each(untrackedRequests)("renders pages without analytics when no page context exists (%j)", async (requestHeaders) => {
    vi.mocked(headers).mockResolvedValue(new Headers(requestHeaders) as Awaited<ReturnType<typeof headers>>);
    const content = createElement("main", null, "Page content");
    expect(await WebsiteStatistics({ children: content })).toBe(content);
    expect(NextlyticsServer).not.toHaveBeenCalled();
  });

  it("keeps the Nextlytics client connected for tracked page requests", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers({ "x-nl-page-render-id": "render-1" }) as Awaited<ReturnType<typeof headers>>);
    const content = createElement("main", null, "Page content");
    const result = await WebsiteStatistics({ children: content });
    expect(isValidElement(result) && result.type).toBe(NextlyticsServer);
    expect(isValidElement<{ children: unknown }>(result) && result.props.children).toBe(content);
  });
});

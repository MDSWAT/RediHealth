import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { RequestsInbox } from "./RequestsInbox";
import { filterLocalInbox } from "@/lib/request-inbox";

vi.mock("next/navigation", () => ({ usePathname: () => "/en/panel", useSearchParams: () => new URLSearchParams("request=1") }));
vi.mock("@/lib/i18n/language-context", () => ({ useLanguage: () => ({ lang: "en" }) }));

afterEach(() => vi.unstubAllEnvs());

it("renders the same inbox dates across server and browser zones, including the selected request", () => {
  const initialInbox = filterLocalInbox([{
    id: "1", full_name: "Test", phone: "", email: "", description: "Test request", status: "pending", priority: "normal", internal_notes: null,
    created_at: "2026-11-22T23:30:00.000Z",
  }]);
  const render = () => renderToString(createElement(RequestsInbox, { initialInbox, isRomania: true, onPendingChange: () => {} }));
  vi.stubEnv("TZ", "UTC");
  const server = render();
  vi.stubEnv("TZ", "Europe/Bucharest");
  const hydration = render();
  // React-generated IDs are stable within each separately rendered tree.
  expect(hydration).toBe(server);
  expect(server).toContain("23:30 UTC");
  expect(server).toContain("2026-11-22 23:30 UTC");
});

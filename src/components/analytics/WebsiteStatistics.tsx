import type { ReactNode } from "react";
import { headers } from "next/headers";
import { NextlyticsServer } from "@/nextlytics";

export async function WebsiteStatistics({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  // Missing-file 404s bypass the proxy; excluded requests and analytics failures
  // also have no page context. They still render this layout, without tracking.
  if (!requestHeaders.get("x-nl-page-render-id")) return children;
  return <NextlyticsServer>{children}</NextlyticsServer>;
}

"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const browserZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
};

/**
 * The viewer's IANA time zone, or null during the server render and hydration, so server and
 * browser print the same text first. Follow-up times use it to show a zone only when it differs.
 */
export function useViewerTimeZone(): string | null {
  return useSyncExternalStore(subscribe, browserZone, () => null);
}

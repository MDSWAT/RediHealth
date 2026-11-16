"use client";

import { useSyncExternalStore } from "react";

const PHONE_QUERY = "(max-width: 639px)";

function subscribeToPhoneQuery(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True below the `sm` breakpoint (phones). False on the server, so the first paint is the wide layout. */
export function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribeToPhoneQuery,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

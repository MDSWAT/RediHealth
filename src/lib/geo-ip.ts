"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { ROMANIAN_COUNTIES, isRomanianCounty } from "@/lib/romanian-counties";
import {
  DEFAULT_COUNTY,
  USER_COUNTY_COOKIE,
  USER_COUNTY_HEADER,
  REDIHEALTH_COUNTY_HEADER,
  resolveCountyFromHeaders,
} from "@/lib/geo-ip-server";

export {
  DEFAULT_COUNTY,
  USER_COUNTY_COOKIE,
  USER_COUNTY_HEADER,
  REDIHEALTH_COUNTY_HEADER,
  resolveCountyFromHeaders,
};

/**
 * Read cookie in browser
 */
function getClientCountyCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${USER_COUNTY_COOKIE}=([^;]+)`));
  if (match) {
    const decoded = decodeURIComponent(match[1]);
    if (isRomanianCounty(decoded)) return decoded;
  }
  return null;
}

/**
 * React hook: useUserCounty
 * Provides the active user county, loading state, and a setter that updates cookie without full page reload.
 */
const countyListeners = new Set<() => void>();
function subscribeCounty(listener: () => void) {
  countyListeners.add(listener);
  return () => countyListeners.delete(listener);
}

export function useUserCounty(initialCounty: string = DEFAULT_COUNTY) {
  // The saved cookie is an external store: the server snapshot is null, so the first
  // client render matches the server HTML and the saved county appears right after.
  const savedCounty = useSyncExternalStore(subscribeCounty, getClientCountyCookie, () => null);
  const [detected, setDetected] = useState<{ county: string; isOverride: boolean } | null>(null);
  const county = savedCounty ?? detected?.county ?? initialCounty;
  const isManualOverride = Boolean(savedCounty) || Boolean(detected?.isOverride);

  useEffect(() => {
    // Only ask the server when nothing is saved on this device.
    if (getClientCountyCookie()) return;
    fetch("/api/geo-ip")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { county?: string; isOverride?: boolean } | null) => {
        if (data?.county && isRomanianCounty(data.county)) {
          setDetected({ county: data.county, isOverride: Boolean(data.isOverride) });
        }
      })
      .catch(() => {
        // fallback to default
      });
  }, []);

  const setCounty = useCallback((newCounty: string) => {
    if (!isRomanianCounty(newCounty)) return;

    // Persist to cookie (Path=/; SameSite=Lax; max-age 1 year), then tell every reader.
    if (typeof document !== "undefined") {
      document.cookie = `${USER_COUNTY_COOKIE}=${encodeURIComponent(
        newCounty
      )}; Path=/; SameSite=Lax; max-age=31536000`;
    }
    countyListeners.forEach((l) => l());

    // Inform API
    void fetch("/api/geo-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ county: newCounty }),
    }).catch(() => {
      // ignore network errors
    });
  }, []);

  return {
    county,
    setCounty,
    isManualOverride,
    availableCounties: ROMANIAN_COUNTIES,
  };
}

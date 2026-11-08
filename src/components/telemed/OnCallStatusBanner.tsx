"use client";

import { useEffect, useState } from "react";

const START_HOUR = 8;
const END_HOUR = 20;
/** The on-call hours, Bucharest time, as shown to the reader. */
export const DUTY_HOURS = "08:00–20:00";

export interface OnCallStatus {
  isOnDuty: boolean;
}

function calculateOnCallStatus(now = new Date()): OnCallStatus {
  // The on-call shift follows Bucharest time wherever the reader is.
  const [hourStr, minuteStr] = now
    .toLocaleTimeString("en-GB", { timeZone: "Europe/Bucharest", hour12: false, hour: "2-digit", minute: "2-digit" })
    .split(":");
  const minutesNow = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
  return { isOnDuty: minutesNow >= START_HOUR * 60 && minutesNow < END_HOUR * 60 };
}

/** Whether the on-call doctor is on duty now (Bucharest time), refreshed once a minute. */
export function useOnCallStatus(): OnCallStatus {
  const [status, setStatus] = useState<OnCallStatus>(() => calculateOnCallStatus());
  useEffect(() => {
    const interval = setInterval(() => setStatus(calculateOnCallStatus()), 60_000);
    return () => clearInterval(interval);
  }, []);
  return status;
}

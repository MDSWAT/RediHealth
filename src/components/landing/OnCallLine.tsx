"use client";

import { useOnCallStatus } from "@/components/telemed/OnCallStatusBanner";

/**
 * One plain line under the online doctor's lead: whether the on-call doctor is there now
 * (Bucharest hours). No dot or icon; the words carry the state. Refreshed once a minute.
 */
export function OnCallLine({ onDuty, offDuty }: { onDuty: string; offDuty: string }) {
  const { isOnDuty } = useOnCallStatus();
  return (
    <p
      suppressHydrationWarning
      className="mt-3 text-pretty text-body font-semibold text-sapphire dark:text-sapphire-border"
    >
      {isOnDuty ? onDuty : offDuty}
    </p>
  );
}

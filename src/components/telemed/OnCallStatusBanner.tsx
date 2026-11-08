"use client";

import { useEffect, useState } from "react";
import { ClockIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const START_HOUR = 8;
const END_HOUR = 20;
const DUTY_HOURS = "08:00–20:00";

interface OnCallStatus {
  isOnDuty: boolean;
  /** Minutes until the next shift starts (off duty only). */
  minutesUntilNextShift: number;
}

function calculateOnCallStatus(now = new Date()): OnCallStatus {
  // The on-call shift follows Bucharest time wherever the reader is.
  const [hourStr, minuteStr] = now
    .toLocaleTimeString("en-GB", { timeZone: "Europe/Bucharest", hour12: false, hour: "2-digit", minute: "2-digit" })
    .split(":");
  const minutesNow = parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
  const isOnDuty = minutesNow >= START_HOUR * 60 && minutesNow < END_HOUR * 60;
  const nextStart = START_HOUR * 60 + (minutesNow >= END_HOUR * 60 ? 24 * 60 : 0);
  return { isOnDuty, minutesUntilNextShift: isOnDuty ? 0 : nextStart - minutesNow };
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

function useSafeLanguage() {
  try {
    return useLanguage();
  } catch {
    return { lang: "ro" as Lang, t: translations.ro, setLang: () => {} };
  }
}

const onCallBannerCopy: Record<Lang, { activeTitle: string; activeSubtitle: string; inactiveTitle: string; inactiveSubtitle: (time: string) => string }> = {
  ro: {
    activeTitle: "Medicul de gardă este disponibil acum",
    activeSubtitle: `Medicul de gardă răspunde zilnic, ${DUTY_HOURS}.`,
    inactiveTitle: `Medicul de gardă răspunde zilnic, ${DUTY_HOURS}`,
    inactiveSubtitle: (time) => `Garda începe din nou peste ${time}. Până atunci, îți poți face o programare.`,
  },
  en: {
    activeTitle: "The on-call doctor is available now",
    activeSubtitle: `The on-call doctor answers every day, ${DUTY_HOURS}.`,
    inactiveTitle: `The on-call doctor answers every day, ${DUTY_HOURS}`,
    inactiveSubtitle: (time) => `The doctor is back in ${time}. Until then, you can book an appointment.`,
  },
  sq: {
    activeTitle: "Mjeku kujdestar është këtu tani",
    activeSubtitle: `Mjeku kujdestar përgjigjet çdo ditë, ${DUTY_HOURS}.`,
    inactiveTitle: `Mjeku kujdestar përgjigjet çdo ditë, ${DUTY_HOURS}`,
    inactiveSubtitle: (time) => `Mjeku kthehet pas ${time}. Deri atëherë mund të caktosh një vizitë.`,
  },
  it: {
    activeTitle: "Il medico di turno è disponibile ora",
    activeSubtitle: `Il medico di turno risponde tutti i giorni, ${DUTY_HOURS}.`,
    inactiveTitle: `Il medico di turno risponde tutti i giorni, ${DUTY_HOURS}`,
    inactiveSubtitle: (time) => `Il medico torna tra ${time}. Intanto puoi prenotare una visita.`,
  },
};

/**
 * On-call status line: whether the online doctor is on duty now (Bucharest time) and the hours.
 * Informational only; the action cards below carry the choices. No pulsing dot: a static marker
 * and the sentence itself state the status. Refreshes once a minute.
 */
export function OnCallStatusBanner() {
  const [status, setStatus] = useState<OnCallStatus>(() => calculateOnCallStatus());
  const { lang } = useSafeLanguage();
  const copy = onCallBannerCopy[lang] ?? onCallBannerCopy.ro;

  useEffect(() => {
    const interval = setInterval(() => setStatus(calculateOnCallStatus()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (status.isOnDuty) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 sm:px-5">
        <span aria-hidden="true" className="mt-[7px] inline-block h-2 w-2 shrink-0 rounded-full bg-live-sage" />
        <div>
          <p className="text-sm font-semibold text-foreground">{copy.activeTitle}</p>
          <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">{copy.activeSubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-care-border bg-amber-care-soft/40 px-4 py-3.5 dark:bg-amber-care/10 sm:px-5">
      <ClockIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-care dark:text-amber-care-border" />
      <div>
        <p className="text-sm font-semibold text-foreground tabular-nums">{copy.inactiveTitle}</p>
        <p className="mt-0.5 text-sm text-muted-foreground tabular-nums" suppressHydrationWarning>
          {copy.inactiveSubtitle(formatDuration(status.minutesUntilNextShift))}
        </p>
      </div>
    </div>
  );
}

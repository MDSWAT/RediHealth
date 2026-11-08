"use client";

import { PrinterIcon } from "@/components/ui/icons";
import { useAssistantCopy } from "@/components/health-assistant/assistant-copy";
import { MedicationSchedule } from "@/lib/prescription-parser";

interface MedicationScheduleTimelineProps {
  schedule: MedicationSchedule;
  heading?: string;
  className?: string;
}

/** Suggested windows, shown next to each part of the day. */
const BLOCKS: { id: keyof MedicationSchedule; time: string }[] = [
  { id: "morning", time: "08:00–09:00" },
  { id: "lunch", time: "13:00–14:00" },
  { id: "evening", time: "19:00–20:00" },
  { id: "bedtime", time: "22:00–23:00" },
];

export function MedicationScheduleTimeline({ schedule, heading, className = "" }: MedicationScheduleTimelineProps) {
  const { result } = useAssistantCopy();
  const t = result.timeline;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {heading ? <h3 className="text-sm font-semibold text-foreground">{heading}</h3> : <span />}
        <button
          type="button"
          onClick={() => window.print()}
          aria-label={t.printAria}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-semibold text-foreground transition-colors duration-[var(--dur-fast)] hover:bg-muted print:hidden"
        >
          <PrinterIcon className="h-4 w-4 text-muted-foreground" />
          <span>{t.print}</span>
        </button>
      </div>

      <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map((block) => {
          const items = schedule[block.id] ?? [];
          const hasMeds = items.length > 0;
          return (
            <li
              key={block.id}
              className={`rounded-lg border p-4 ${hasMeds ? "border-border bg-card" : "border-dashed border-border bg-transparent"}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-sm font-semibold ${hasMeds ? "text-foreground" : "text-muted-foreground"}`}>
                  {t[block.id]}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">{block.time}</span>
              </div>

              {hasMeds ? (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">{t.count(items.length)}</p>
                  <ul className="mt-3 space-y-2">
                    {items.map((med, idx) => (
                      <li key={`${med}-${idx}`} className="border-l border-sapphire/40 pl-2.5 text-sm leading-snug text-foreground">
                        {med}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t.none}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

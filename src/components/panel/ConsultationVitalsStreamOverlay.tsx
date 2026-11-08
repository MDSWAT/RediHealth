"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";
import { meetingWorkspaceTranslations } from "@/lib/i18n/meeting-workspace-translations";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { formatPanelDate, formatPanelNumber } from "@/lib/panel-dates";
import type { VitalsTelemetryRecord } from "@/lib/types/telemetry";
import { usePanelRuntime } from "./PanelRuntime";

interface ConsultationVitalsStreamOverlayProps {
  meetingId: string | number;
  patientId?: string | number | null;
  onInsertToNotes?: (vitalsSummary: string) => void;
}

const POLL_MS = 10_000;

/** Fictional reading shown only inside the browser-local demo, so the feature can be explored. */
function demoReading(meetingId: string | number, kit: string): VitalsTelemetryRecord {
  return {
    id: "demo", meetingId, deviceKitId: kit, recordedByWorkerName: "Alex Demo",
    bloodPressureSystolic: 128, bloodPressureDiastolic: 82, pulseBpm: 72, oxygenSaturationPct: 97,
    bloodGlucoseMgDl: 104, bodyTemperatureC: 36.8, recordedAt: new Date().toISOString(),
  };
}

/**
 * Latest vitals a community mediator recorded with the field kit for this consultation.
 * Renders nothing until a real reading exists; never shows placeholder numbers.
 */
export function ConsultationVitalsStreamOverlay({ meetingId, patientId, onInsertToNotes }: ConsultationVitalsStreamOverlayProps) {
  const { lang } = useLanguage();
  const t = meetingWorkspaceTranslations[lang].vitals;
  const locale = langToLocale[lang];
  const { request: fetch, demo } = usePanelRuntime();
  const [telemetry, setTelemetry] = useState<VitalsTelemetryRecord | null>(() => (demo ? demoReading(meetingId, demoPanelTranslations[lang].kit) : null));
  const [inserted, setInserted] = useState(false);

  useEffect(() => {
    if (demo) return;
    let active = true;
    const query = new URLSearchParams({ meetingId: String(meetingId) });
    if (patientId != null) query.set("patientId", String(patientId));
    async function fetchLatest() {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/telemetry?${query}`);
        if (!response.ok) return;
        const data = (await response.json()) as { telemetry?: VitalsTelemetryRecord };
        if (active && data.telemetry) setTelemetry(data.telemetry);
      } catch {
        // Keep the last reading; the next poll retries.
      }
    }
    void fetchLatest();
    const interval = window.setInterval(fetchLatest, POLL_MS);
    return () => { active = false; window.clearInterval(interval); };
  }, [meetingId, patientId, fetch, demo]);

  useEffect(() => {
    if (!inserted) return;
    const timeout = window.setTimeout(() => setInserted(false), 3000);
    return () => window.clearTimeout(timeout);
  }, [inserted]);

  if (!telemetry) return null;

  const number = (value: number | null | undefined, digits = 0) =>
    value == null ? "—" : formatPanelNumber(value, locale, digits);
  const bp = telemetry.bloodPressureSystolic != null || telemetry.bloodPressureDiastolic != null
    ? `${number(telemetry.bloodPressureSystolic)}/${number(telemetry.bloodPressureDiastolic)}` : "—";
  const readings = [
    { label: t.bp, value: bp, unit: "mmHg" },
    { label: t.pulse, value: number(telemetry.pulseBpm), unit: "bpm" },
    { label: t.spo2, value: number(telemetry.oxygenSaturationPct), unit: "%" },
    { label: t.glucose, value: number(telemetry.bloodGlucoseMgDl), unit: "mg/dL" },
    { label: t.temperature, value: number(telemetry.bodyTemperatureC, 1), unit: "°C" },
  ];
  const recordedAt = telemetry.recordedAt && !Number.isNaN(Date.parse(telemetry.recordedAt))
    ? formatPanelDate(telemetry.recordedAt, locale, "time") : null;
  const source = [telemetry.recordedByWorkerName, telemetry.deviceKitId].filter(Boolean).join(" · ");

  function handleInsert() {
    const summary = readings.map((r) => `${r.label}: ${r.value} ${r.unit}`).join("; ");
    onInsertToNotes?.(`[${t.title}: ${summary}${source ? ` | ${t.recordedBy}: ${source}` : ""}]`);
    setInserted(true);
  }

  return (
    <section aria-labelledby={`vitals-${meetingId}`} className="rounded-xl border border-border bg-card p-4 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`vitals-${meetingId}`} className="flex items-center gap-2 text-sm font-semibold">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-live-sage" />
            {t.title}
          </h2>
          {(source || recordedAt) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {source && <>{t.recordedBy} {source}</>}
              {source && recordedAt && " · "}
              {recordedAt && <time dateTime={telemetry.recordedAt}>{recordedAt}</time>}
            </p>
          )}
        </div>
        {onInsertToNotes && (
          <button type="button" onClick={handleInsert} className="crm-button min-h-10 shrink-0">
            {inserted ? <><CheckCircleIcon aria-hidden="true" className="h-4 w-4 text-live-sage" />{t.inserted}</> : t.insert}
          </button>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
        {readings.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{r.label}</dt>
            <dd className="text-base font-semibold tabular-nums">
              {r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="sr-only" role="status" aria-live="polite">{inserted ? t.inserted : ""}</p>
    </section>
  );
}

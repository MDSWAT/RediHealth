"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { PinIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_BYTES, MAX_PATIENT_DOCUMENTS, validatePatientIntake } from "@/lib/patient-intake";
import type { PatientDocument, PatientIntake } from "@/lib/types/patient";
import { usePanelRuntime } from "./PanelRuntime";

export function PatientIntakeFields({ value, onChange, disabled, onBusyChange }: {
  value: PatientIntake;
  onChange: (value: PatientIntake) => void;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const { lang } = useLanguage();
  const { demo } = usePanelRuntime();
  const t = patientIntakeTranslations[lang];
  const id = useId();
  const [reading, setReading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [category, setCategory] = useState<PatientDocument["category"]>("medical");
  const [fileError, setFileError] = useState("");
  const [gpsError, setGpsError] = useState("");
  const mounted = useRef(true);
  const currentValue = useRef(value);
  useEffect(() => { currentValue.current = value; }, [value]);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  function getLocation() {
    setGpsError("");
    if (demo) { onChange({ ...value, location: { latitude: 46.77, longitude: 23.59, accuracy: 10 } }); return; }
    if (!window.isSecureContext || !navigator.geolocation) { setGpsError(t.gpsUnsupported); return; }
    setLocating(true);
    onBusyChange(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!mounted.current) return;
        const next = { ...currentValue.current, location: { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy } };
        if (validatePatientIntake(next).ok) onChange(next);
        else setGpsError(t.gpsUnavailable);
        setLocating(false);
        onBusyChange(false);
      },
      (error) => {
        if (!mounted.current) return;
        setGpsError(error.code === 1 ? t.gpsDenied : error.code === 3 ? t.gpsTimeout : t.gpsUnavailable);
        setLocating(false);
        onBusyChange(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  async function readDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setFileError("");
    if (files.length + value.documents.length > MAX_PATIENT_DOCUMENTS
      || files.some((file) => !DOCUMENT_ACCEPT.split(",").includes(file.type) || file.size === 0 || file.size > MAX_DOCUMENT_BYTES || file.name.length > 200)) {
      setFileError(t.fileError);
      return;
    }
    setReading(true);
    onBusyChange(true);
    try {
      const documents = await Promise.all(files.map((file) => new Promise<PatientDocument>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(t.readError));
        reader.onabort = () => reject(new Error(t.readError));
        reader.onload = () => {
          if (typeof reader.result !== "string") { reject(new Error(t.readError)); return; }
          resolve({ id: crypto.randomUUID(), name: file.name, category, data_url: reader.result });
        };
        reader.readAsDataURL(file);
      })));
      if (!mounted.current) return;
      const next = { ...currentValue.current, documents: [...currentValue.current.documents, ...documents] };
      if (!validatePatientIntake(next).ok) setFileError(t.fileError);
      else onChange(next);
    } catch {
      if (mounted.current) setFileError(t.readError);
    } finally {
      if (mounted.current) { setReading(false); onBusyChange(false); }
    }
  }

  const busy = disabled || reading || locating;
  return <div className="space-y-5">
    <section className="space-y-3 border-t border-[var(--panel-line)] pt-5">
      <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.location}</h3>
      <p className="text-xs leading-relaxed text-[var(--panel-muted)]">{t.gpsHint}</p>
      <button type="button" disabled={busy} onClick={getLocation} className="crm-button whitespace-nowrap border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] text-[var(--panel-ink)] hover:bg-[var(--panel-selection)] disabled:border-[var(--panel-line)] disabled:bg-[var(--panel-subtle)] disabled:text-[var(--panel-muted)]">
        <PinIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span>{locating ? t.locating : t.useGps}</span>
      </button>
      {value.location && <div role="status" className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--panel-line)] pt-3 text-xs text-[var(--panel-ink)]">
        <span className="font-display tabular-nums">{value.location.latitude.toFixed(6)}, {value.location.longitude.toFixed(6)}<br /><span className="text-[var(--panel-muted)]">{t.accuracy}: {Math.round(value.location.accuracy)} m</span></span>
        <button type="button" disabled={busy} onClick={() => onChange({ ...value, location: null })} className="inline-flex min-h-11 items-center whitespace-nowrap px-2 font-semibold text-[#b91c1c] hover:underline dark:text-[#ffb4b4]">{t.remove}</button>
      </div>}
      {gpsError && <p role="alert" className="text-sm text-[#b91c1c] dark:text-[#ffb4b4]">{gpsError}</p>}
    </section>
    <section className="space-y-3 border-t border-[var(--panel-line)] pt-5">
      <h3 className="text-sm font-semibold text-[var(--panel-ink)]">{t.documents}</h3>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[var(--panel-line)] bg-[var(--panel-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--panel-ink)]">
        <input type="checkbox" checked={value.has_documents} disabled={busy} aria-controls={`${id}-uploads`} aria-expanded={value.has_documents}
          onChange={(event) => { setFileError(""); onChange({ ...value, has_documents: event.target.checked, documents: [] }); }}
          className="h-5 w-5 shrink-0 accent-primary" />{t.hasDocuments}
      </label>
      {value.has_documents && <div id={`${id}-uploads`} className="space-y-3 pt-1">
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-[var(--panel-muted)]">{t.documentHint}</p>
        <select aria-label={t.documents} disabled={busy} value={category} onChange={(event) => setCategory(event.target.value === "identity" ? "identity" : "medical")}
          className="min-h-11 w-full whitespace-nowrap rounded-lg border border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-surface)] px-3 text-sm text-[var(--panel-ink)]">
          <option value="medical">{t.medical}</option><option value="identity">{t.identity}</option>
        </select>
        <label className={`flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-control,#8a94a6)] bg-[var(--panel-subtle)] p-4 text-sm font-semibold text-primary focus-within:ring-2 focus-within:ring-ring dark:text-[#bad7fa] ${busy ? "opacity-50" : "cursor-pointer hover:bg-[var(--panel-selection)]"}`}>
          {reading ? t.reading : t.upload}
          <input type="file" multiple accept={DOCUMENT_ACCEPT} disabled={busy} aria-describedby={`${id}-hint`} onChange={(event) => void readDocuments(event)} className="sr-only" />
        </label>
        {value.documents.length > 0 && <ul className="divide-y divide-[var(--panel-line)] border-t border-[var(--panel-line)]">{value.documents.map((document) => <li key={document.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--panel-ink)]">{document.name}</p><p className="text-xs text-[var(--panel-muted)]">{document.category === "identity" ? t.identity : t.medical}</p></div>
          <button type="button" disabled={busy} aria-label={`${t.remove}: ${document.name}`} onClick={() => onChange({ ...value, documents: value.documents.filter((item) => item.id !== document.id) })} className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-xs font-semibold text-[#b91c1c] hover:underline dark:text-[#ffb4b4]">{t.remove}</button>
        </li>)}</ul>}
      </div>}
      {fileError && <p role="alert" className="text-sm text-[#b91c1c] dark:text-[#ffb4b4]">{fileError}</p>}
    </section>
  </div>;
}

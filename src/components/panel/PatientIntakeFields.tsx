"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { FileTextIcon, PinIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { patientIntakeTranslations } from "@/lib/i18n/patient-intake-translations";
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_BYTES, MAX_PATIENT_DOCUMENTS, validatePatientIntake } from "@/lib/patient-intake";
import type { PatientDocument, PatientIntake } from "@/lib/types/patient";

export function PatientIntakeFields({ value, onChange, disabled, onBusyChange }: {
  value: PatientIntake;
  onChange: (value: PatientIntake) => void;
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  const { lang } = useLanguage();
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
    <section className="rounded-2xl border border-border bg-muted/30 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><PinIcon className="h-5 w-5 text-primary" />{t.location}</h3>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{t.gpsHint}</p>
      <button type="button" disabled={busy} onClick={getLocation} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50">
        <PinIcon className="h-4 w-4" />{locating ? t.locating : t.useGps}
      </button>
      {value.location && <div role="status" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card p-3 text-xs">
        <span>{value.location.latitude.toFixed(6)}, {value.location.longitude.toFixed(6)}<br />{t.accuracy}: {Math.round(value.location.accuracy)} m</span>
        <button type="button" disabled={busy} onClick={() => onChange({ ...value, location: null })} className="min-h-11 px-2 font-semibold text-red-700">{t.remove}</button>
      </div>}
      {gpsError && <p role="alert" className="mt-3 text-sm text-red-700">{gpsError}</p>}
    </section>
    <section className="rounded-2xl border border-border bg-muted/30 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><FileTextIcon className="h-5 w-5 text-primary" />{t.documents}</h3>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm font-medium">
        <input type="checkbox" checked={value.has_documents} disabled={busy} aria-controls={`${id}-uploads`} aria-expanded={value.has_documents}
          onChange={(event) => { setFileError(""); onChange({ ...value, has_documents: event.target.checked, documents: [] }); }}
          className="h-5 w-5 accent-primary" />{t.hasDocuments}
      </label>
      {value.has_documents && <div id={`${id}-uploads`} className="mt-4 space-y-3">
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">{t.documentHint}</p>
        <select aria-label={t.documents} disabled={busy} value={category} onChange={(event) => setCategory(event.target.value === "identity" ? "identity" : "medical")}
          className="min-h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
          <option value="medical">{t.medical}</option><option value="identity">{t.identity}</option>
        </select>
        <label className={`flex min-h-20 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-card p-4 text-sm font-semibold text-primary focus-within:ring-2 focus-within:ring-ring ${busy ? "opacity-50" : "cursor-pointer hover:bg-primary-soft"}`}>
          {reading ? t.reading : t.upload}
          <input type="file" multiple accept={DOCUMENT_ACCEPT} disabled={busy} aria-describedby={`${id}-hint`} onChange={(event) => void readDocuments(event)} className="sr-only" />
        </label>
        <ul className="space-y-2">{value.documents.map((document) => <li key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
          <div className="min-w-0"><p className="truncate text-sm font-medium">{document.name}</p><p className="text-xs text-muted-foreground">{document.category === "identity" ? t.identity : t.medical}</p></div>
          <button type="button" disabled={busy} aria-label={`${t.remove}: ${document.name}`} onClick={() => onChange({ ...value, documents: value.documents.filter((item) => item.id !== document.id) })} className="min-h-11 px-2 text-xs font-semibold text-red-700">{t.remove}</button>
        </li>)}</ul>
      </div>}
      {fileError && <p role="alert" className="mt-3 text-sm text-red-700">{fileError}</p>}
    </section>
  </div>;
}

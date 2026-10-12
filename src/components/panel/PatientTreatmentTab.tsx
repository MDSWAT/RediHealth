"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";
import { getTreatmentEntries, sortTreatments, treatmentStatus } from "@/lib/treatments";
import { localDateKey } from "@/lib/panel-dates";
import type { TreatmentEntry, TreatmentPlan } from "@/lib/types/patient";
import { TreatmentPlanEditor } from "./TreatmentPlanEditor";

type Props = {
  treatmentPlan: TreatmentPlan;
  onChangeTreatmentPlan: (plan: TreatmentPlan) => void;
  treatmentSavedMsg: boolean;
  isSavingTreatment: boolean;
  onSaveTreatmentPlan: () => void;
  onPendingPhotoChange: (pending: boolean) => void;
};

export function PatientTreatmentTab(props: Props) {
  const { lang } = useLanguage();
  const t = treatmentTranslations[lang];
  const entries = getTreatmentEntries(props.treatmentPlan);
  const [selectedId, setSelectedId] = useState(entries[0]?.id);
  const [pendingPhoto, setPendingPhoto] = useState(false);
  const selected = entries.find((entry) => entry.id === selectedId) || entries[0];
  function update(entry: TreatmentEntry) {
    props.onChangeTreatmentPlan({ entries: entries.map((item) => item.id === entry.id ? entry : item) });
  }
  return <section className="space-y-4">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-semibold">{t.title} ({entries.length})</h2><p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p></div>
      <button type="button" className="crm-button crm-primary" disabled={props.isSavingTreatment} onClick={() => {
        if (pendingPhoto && !window.confirm(t.discardPhoto)) return;
        const entry: TreatmentEntry = { id: crypto.randomUUID(), title: "", start_date: localDateKey(), end_date: localDateKey() };
        props.onChangeTreatmentPlan({ entries: [...entries, entry] });
        setSelectedId(entry.id);
      }}>{t.add}</button>
    </header>
    {entries.length > 0 ? <div className="grid items-start gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
      <div className="space-y-2" aria-label={t.title}>
        {sortTreatments(entries).map((entry) => <div key={entry.id} className={`rounded-lg border p-3 ${selected?.id === entry.id ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
          <button type="button" className="w-full text-left" aria-pressed={selected?.id === entry.id} disabled={props.isSavingTreatment} onClick={() => {
            if (entry.id !== selected?.id && pendingPhoto && !window.confirm(t.discardPhoto)) return;
            setSelectedId(entry.id);
          }}>
            <span className="block break-words text-sm font-semibold">{entry.title || (entry.id === "legacy-treatment" ? t.legacy : t.newPlan)}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{entry.start_date ? `${entry.start_date} - ${entry.end_date || t.undated}` : t.undated}</span>
            <span className="mt-2 inline-block text-xs font-medium">{t[treatmentStatus(entry, localDateKey())]}</span>
          </button>
          <button type="button" className="mt-3 text-xs text-red-700" disabled={props.isSavingTreatment} onClick={() => {
            if (entry.id === selected?.id && pendingPhoto && !window.confirm(t.discardPhoto)) return;
            if (window.confirm(t.deleteConfirm)) props.onChangeTreatmentPlan({ entries: entries.filter((item) => item.id !== entry.id) });
          }}>{t.delete}</button>
        </div>)}
      </div>
      {selected && <EntryEditor key={selected.id} entry={selected} onChange={update} {...props} onLocalPendingChange={setPendingPhoto} />}
    </div> : <div className="crm-card"><p className="text-sm text-muted-foreground">{t.empty}</p></div>}
    {!entries.length && <button type="button" className="crm-button crm-primary" disabled={props.isSavingTreatment} onClick={props.onSaveTreatmentPlan}>{props.isSavingTreatment ? t.saving : t.save}</button>}
    {!entries.length && props.treatmentSavedMsg && <p role="status" className="text-sm text-emerald-700">{t.saved}</p>}
  </section>;
}

function EntryEditor({ entry, onChange, onPendingPhotoChange, onLocalPendingChange, ...props }: Props & {
  entry: TreatmentEntry;
  onChange: (entry: TreatmentEntry) => void;
  onLocalPendingChange: (pending: boolean) => void;
}) {
  const { lang } = useLanguage();
  const t = treatmentTranslations[lang];
  const [photoName, setPhotoName] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const pending = reading || !!photoData;
  useEffect(() => {
    onLocalPendingChange(pending);
    onPendingPhotoChange(pending);
    return () => { onLocalPendingChange(false); onPendingPhotoChange(false); };
  }, [pending, onLocalPendingChange, onPendingPhotoChange]);
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoData(null);
    setError("");
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError(t.imageError);
      event.target.value = "";
      return;
    }
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => { setPhotoData(String(reader.result)); setReading(false); };
    reader.onerror = () => { setError(t.uploadError); setReading(false); };
    reader.readAsDataURL(file);
    event.target.value = "";
  }
  return <div className="min-w-0">
    {error && <p role="alert" className="crm-error mb-3">{error}</p>}
    {photoData && <button type="button" className="crm-button mb-3" onClick={() => { setPhotoData(null); setError(""); }}>{t.clear}</button>}
    <fieldset disabled={props.isSavingTreatment || reading}>
      <TreatmentPlanEditor
        treatmentPlan={entry}
        onChangeTreatmentPlan={onChange}
        treatmentSavedMsg={props.treatmentSavedMsg}
        isSavingTreatment={props.isSavingTreatment || reading}
        onSaveTreatmentPlan={() => {
          if (photoData) { setError(t.pendingPhoto); return; }
          setError("");
          props.onSaveTreatmentPlan();
        }}
        tpPhotoName={photoName}
        onChangeTpPhotoName={setPhotoName}
        tpPhotoData={photoData}
        onTpPhotoUpload={upload}
        onAddTpPhoto={(event) => {
          event.preventDefault();
          if (!photoData) return;
          onChange({ ...entry, photos: [...(entry.photos || []), { id: crypto.randomUUID(), name: photoName.trim() || t.photos, data_url: photoData, date: localDateKey() }] });
          setPhotoData(null);
          setPhotoName("");
          setError("");
        }}
        onDeleteTpPhoto={(id) => onChange({ ...entry, photos: entry.photos?.filter((photo) => photo.id !== id) })}
      />
    </fieldset>
  </div>;
}

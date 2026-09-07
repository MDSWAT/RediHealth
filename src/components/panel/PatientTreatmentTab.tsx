/* eslint-disable @next/next/no-img-element */
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TreatmentPlan } from "@/lib/types/patient";

interface PatientTreatmentTabProps {
  treatmentPlan: TreatmentPlan;
  onChangeTreatmentPlan: (plan: TreatmentPlan) => void;
  treatmentSavedMsg: boolean;
  isSavingTreatment: boolean;
  onSaveTreatmentPlan: () => void;
  tpPhotoName: string;
  onChangeTpPhotoName: (name: string) => void;
  tpPhotoData: string | null;
  onTpPhotoUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddTpPhoto: (e: FormEvent) => void;
  onDeleteTpPhoto: (photoId: string) => void;
}

export function PatientTreatmentTab({
  treatmentPlan,
  onChangeTreatmentPlan,
  treatmentSavedMsg,
  isSavingTreatment,
  onSaveTreatmentPlan,
  tpPhotoName,
  onChangeTpPhotoName,
  tpPhotoData,
  onTpPhotoUpload,
  onAddTpPhoto,
  onDeleteTpPhoto,
}: PatientTreatmentTabProps) {
  const { lang } = useLanguage();
  const t = {
    en: {
      saved: "Treatment plan saved successfully!",
      diagnosis: "Primary Diagnosis & Clinical Findings",
      diagnosisPh: "Record primary clinical diagnosis, symptoms severity, or findings...",
      goals: "Care Goals & Objectives",
      goalsPh: "Short & long term health targets...",
      meds: "Prescribed Medications / Therapies",
      medsPh: "List medications, dosage, or recommended therapy...",
      instructions: "Care Instructions & Patient Directives",
      instructionsPh: "Specific lifestyle, diet, rest, or follow-up instructions...",
      attachTitle: "Attach Photo to Treatment Plan",
      attachHint: "Upload prescription scans, therapy diagrams, or treatment images directly to this plan.",
      selectImage: "Select Image File",
      photoLabel: "Photo Title / Description",
      photoPh: "e.g. Prescription Scan, Treatment Diagram",
      ready: "Photo ready to attach",
      attachButton: "Attach Photo to Treatment Plan",
      attached: "Attached Treatment Plan Photos",
      removePhoto: "Remove photo",
      saving: "Saving Plan...",
      save: "Save Treatment Plan",
    },
    ro: {
      saved: "Planul de tratament a fost salvat!",
      diagnosis: "Diagnostic principal si constatari clinice",
      diagnosisPh: "Noteaza diagnosticul principal, severitatea simptomelor sau constatarile...",
      goals: "Obiective de ingrijire",
      goalsPh: "Obiective de sanatate pe termen scurt si lung...",
      meds: "Medicamente / terapii prescrise",
      medsPh: "Listeaza medicamentele, dozele sau terapia recomandata...",
      instructions: "Instructiuni de ingrijire si recomandari pacient",
      instructionsPh: "Stil de viata, dieta, odihna sau instructiuni de follow-up...",
      attachTitle: "Ataseaza poza la planul de tratament",
      attachHint: "Incarca retete scanate, diagrame de terapie sau imagini medicale.",
      selectImage: "Selecteaza fisier imagine",
      photoLabel: "Titlu / descriere poza",
      photoPh: "ex. Reteta scanata, diagrama tratament",
      ready: "Poza este gata pentru atasare",
      attachButton: "Ataseaza poza",
      attached: "Poze atasate planului",
      removePhoto: "Sterge poza",
      saving: "Se salveaza planul...",
      save: "Salveaza planul de tratament",
    },
    sq: {
      saved: "Plani i trajtimit u ruajt me sukses!",
      diagnosis: "Diagnoza kryesore dhe gjetjet klinike",
      diagnosisPh: "Shkruaj diagnozen kryesore, ashpersine e simptomave ose gjetjet...",
      goals: "Qellimet e kujdesit",
      goalsPh: "Objektiva afatshkurtra dhe afatgjata...",
      meds: "Medikamente / terapi te pershkruara",
      medsPh: "Listo medikamentet, dozimin ose terapine e rekomanduar...",
      instructions: "Udhezime kujdesi dhe direktiva per pacientin",
      instructionsPh: "Udhezime per stil jete, diete, pushim ose ndjekje...",
      attachTitle: "Bashkengjit foto ne planin e trajtimit",
      attachHint: "Ngarko skanime recetash, diagrame terapie ose imazhe mjekesore.",
      selectImage: "Zgjidh imazh",
      photoLabel: "Titulli / pershkrimi i fotos",
      photoPh: "p.sh. Skanim recete, diagram trajtimi",
      ready: "Fotoja eshte gati per bashkengjitje",
      attachButton: "Bashkengjit foto",
      attached: "Foto te bashkengjitura ne plan",
      removePhoto: "Hiq foton",
      saving: "Duke ruajtur planin...",
      save: "Ruaj planin e trajtimit",
    },
    it: {
      saved: "Piano di trattamento salvato con successo!",
      diagnosis: "Diagnosi principale e riscontri clinici",
      diagnosisPh: "Registra diagnosi principale, gravita dei sintomi o riscontri...",
      goals: "Obiettivi di cura",
      goalsPh: "Obiettivi di salute a breve e lungo termine...",
      meds: "Farmaci / terapie prescritte",
      medsPh: "Elenca farmaci, dosaggi o terapia consigliata...",
      instructions: "Istruzioni di cura e direttive paziente",
      instructionsPh: "Indicazioni su stile di vita, dieta, riposo o follow-up...",
      attachTitle: "Allega foto al piano di trattamento",
      attachHint: "Carica ricette scannerizzate, schemi terapeutici o immagini mediche.",
      selectImage: "Seleziona file immagine",
      photoLabel: "Titolo / descrizione foto",
      photoPh: "es. Ricetta scannerizzata, schema trattamento",
      ready: "Foto pronta per l'allegato",
      attachButton: "Allega foto",
      attached: "Foto allegate al piano",
      removePhoto: "Rimuovi foto",
      saving: "Salvataggio piano...",
      save: "Salva piano di trattamento",
    },
  }[lang];
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      {treatmentSavedMsg ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircleIcon className="h-4 w-4" />
          <span>{t.saved}</span>
        </div>
      ) : null}

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          {t.diagnosis}
        </label>
        <textarea
          rows={3}
          value={treatmentPlan.diagnosis || ""}
          onChange={(e) =>
            onChangeTreatmentPlan({ ...treatmentPlan, diagnosis: e.target.value })
          }
          placeholder={t.diagnosisPh}
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            {t.goals}
          </label>
          <textarea
            rows={3}
            value={treatmentPlan.goals || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, goals: e.target.value })
            }
            placeholder={t.goalsPh}
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            {t.meds}
          </label>
          <textarea
            rows={3}
            value={treatmentPlan.medications || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, medications: e.target.value })
            }
            placeholder={t.medsPh}
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          {t.instructions}
        </label>
        <textarea
          rows={3}
          value={treatmentPlan.care_instructions || ""}
          onChange={(e) =>
            onChangeTreatmentPlan({
              ...treatmentPlan,
              care_instructions: e.target.value,
            })
          }
          placeholder={t.instructionsPh}
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>{t.attachTitle}</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.attachHint}
          </p>
        </div>

        <form
          onSubmit={onAddTpPhoto}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.selectImage}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={onTpPhotoUpload}
                className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                {t.photoLabel}
              </label>
              <input
                type="text"
                value={tpPhotoName}
                onChange={(e) => onChangeTpPhotoName(e.target.value)}
                placeholder={t.photoPh}
                className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {tpPhotoData ? (
            <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
              <img
                src={tpPhotoData}
                alt="Preview"
                className="h-12 w-12 object-cover rounded border border-border"
              />
              <span className="text-xs text-emerald-600 font-semibold">
                {t.ready}
              </span>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!tpPhotoData}
              className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              {t.attachButton}
            </button>
          </div>
        </form>

        {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
          <div>
            <p className="text-xs font-bold text-foreground mb-2">
              {t.attached} ({treatmentPlan.photos.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {treatmentPlan.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2 shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={photo.data_url}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteTpPhoto(photo.id)}
                      className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      title={t.removePhoto}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p
                    className="mt-1.5 text-xs font-bold text-foreground truncate"
                    title={photo.name}
                  >
                    {photo.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={isSavingTreatment}
          onClick={onSaveTreatmentPlan}
          className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 shadow-sm"
        >
          {isSavingTreatment ? t.saving : t.save}
        </button>
      </div>
    </div>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TreatmentEntry } from "@/lib/types/patient";
import { treatmentTranslations } from "@/lib/i18n/treatment-translations";

interface TreatmentPlanEditorProps {
  treatmentPlan: TreatmentEntry;
  onChangeTreatmentPlan: (plan: TreatmentEntry) => void;
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

export function TreatmentPlanEditor({
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
}: TreatmentPlanEditorProps) {
  const { lang } = useLanguage();
  const copy = treatmentTranslations[lang];
  const t = {
    en: {
      saved: "Treatment plan saved.",
      diagnosis: "Diagnosis and findings",
      diagnosisPh: "Main diagnosis, how severe the symptoms are, findings",
      goals: "Care goals",
      goalsPh: "Short- and long-term goals",
      meds: "Medicines and therapies",
      medsPh: "Medicines, doses or recommended therapy",
      instructions: "Instructions for the patient",
      instructionsPh: "Diet, rest, daily habits, next check-up",
      attachTitle: "Add a photo to the plan",
      attachHint: "For example a prescription scan or a therapy chart.",
      selectImage: "Choose image",
      photoLabel: "Photo title",
      photoPh: "e.g. Prescription, Therapy chart",
      ready: "Photo ready",
      attachButton: "Attach photo",
      attached: "Photos in this plan",
      removePhoto: "Remove photo",
      saving: "Saving...",
      save: "Save plan",
    },
    ro: {
      saved: "Planul de tratament a fost salvat.",
      diagnosis: "Diagnostic și constatări",
      diagnosisPh: "Diagnosticul principal, cât de grave sunt simptomele, constatări",
      goals: "Obiectivele îngrijirii",
      goalsPh: "Obiective pe termen scurt și lung",
      meds: "Medicamente și terapii",
      medsPh: "Medicamente, doze sau terapia recomandată",
      instructions: "Ce trebuie să facă pacientul",
      instructionsPh: "Alimentație, odihnă, obiceiuri, următorul control",
      attachTitle: "Adaugă o poză la plan",
      attachHint: "De exemplu o rețetă scanată sau o schemă de tratament.",
      selectImage: "Alege imaginea",
      photoLabel: "Titlul pozei",
      photoPh: "ex. rețetă scanată, schemă de tratament",
      ready: "Poza e pregătită",
      attachButton: "Atașează poza",
      attached: "Poze atașate planului",
      removePhoto: "Șterge poza",
      saving: "Se salvează...",
      save: "Salvează planul",
    },
    sq: {
      saved: "Plani i trajtimit u ruajt.",
      diagnosis: "Diagnoza dhe gjetjet",
      diagnosisPh: "Diagnoza kryesore, sa të rënda janë simptomat, gjetjet",
      goals: "Qëllimet e kujdesit",
      goalsPh: "Qëllime afatshkurtra dhe afatgjata",
      meds: "Ilaçe dhe terapi",
      medsPh: "Ilaçet, dozat ose terapia e rekomanduar",
      instructions: "Çfarë duhet të bëjë pacienti",
      instructionsPh: "Ushqimi, pushimi, zakonet, kontrolli i radhës",
      attachTitle: "Shto një foto në plan",
      attachHint: "Për shembull një recetë të skanuar ose një skemë terapie.",
      selectImage: "Zgjidh imazh",
      photoLabel: "Titulli i fotos",
      photoPh: "p.sh. Skanim recetë, diagram trajtimi",
      ready: "Fotoja është gati",
      attachButton: "Bashkëngjit foto",
      attached: "Foto të bashkëngjitura në plan",
      removePhoto: "Hiq foton",
      saving: "Duke ruajtur...",
      save: "Ruaj planin",
    },
    it: {
      saved: "Piano di trattamento salvato.",
      diagnosis: "Diagnosi e rilievi",
      diagnosisPh: "Diagnosi principale, gravità dei sintomi, rilievi",
      goals: "Obiettivi di cura",
      goalsPh: "Obiettivi a breve e lungo termine",
      meds: "Farmaci e terapie",
      medsPh: "Farmaci, dosi o terapia consigliata",
      instructions: "Cosa deve fare il paziente",
      instructionsPh: "Alimentazione, riposo, abitudini, prossimo controllo",
      attachTitle: "Aggiungi una foto al piano",
      attachHint: "Per esempio una ricetta scansionata o uno schema di terapia.",
      selectImage: "Scegli immagine",
      photoLabel: "Titolo della foto",
      photoPh: "es. Ricetta, Schema di terapia",
      ready: "Foto pronta",
      attachButton: "Allega foto",
      attached: "Foto allegate al piano",
      removePhoto: "Rimuovi foto",
      saving: "Salvataggio...",
      save: "Salva piano",
    },
    hr: {
      saved: "Plan liječenja je spremljen.",
      diagnosis: "Dijagnoza i nalazi",
      diagnosisPh: "Glavna dijagnoza, težina simptoma, nalazi",
      goals: "Ciljevi skrbi",
      goalsPh: "Kratkoročni i dugoročni ciljevi",
      meds: "Lijekovi i terapije",
      medsPh: "Lijekovi, doze ili preporučena terapija",
      instructions: "Upute za pacijenta",
      instructionsPh: "Prehrana, odmor, dnevne navike, sljedeći kontrolni pregled",
      attachTitle: "Dodaj fotografiju u plan",
      attachHint: "Na primjer presliku recepta ili shemu terapije.",
      selectImage: "Odaberi sliku",
      photoLabel: "Naslov fotografije",
      photoPh: "npr. Recept, shema terapije",
      ready: "Fotografija je spremna",
      attachButton: "Priloži fotografiju",
      attached: "Fotografije u ovom planu",
      removePhoto: "Ukloni fotografiju",
      saving: "Spremanje...",
      save: "Spremi plan",
    },
    rom: {
      saved: "O plano tratamentesko sas arakhlo.",
      diagnosis: "Diagnoza thaj dikhimata",
      diagnosisPh: "Sherutni diagnoza, sode phare si le simptomurya, dikhimata",
      goals: "Resa sastipnaske",
      goalsPh: "Kharne thaj bare vramake resa",
      meds: "Draba thaj terapiye",
      medsPh: "Draba, doze vay sikavdi terapiya",
      instructions: "Sikavimata vash o paciento",
      instructionsPh: "Xaben, hodina, svako dyeseske tabieturya, avutni kontrola",
      attachTitle: "Tho ekh tasviri ko plano",
      attachHint: "Misal ekh tasviri e recetako vay skema tratamenteski.",
      selectImage: "Alosar tasviri",
      photoLabel: "Anav e tasviresko",
      photoPh: "misal Receta, skema tratamenteski",
      ready: "O tasviri si gata",
      attachButton: "Phande o tasviri",
      attached: "Tasvirya and-o kadava plano",
      removePhoto: "Chude o tasviri",
      saving: "Arakhel...",
      save: "Arakh o plano",
    },
  }[lang];
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
      <fieldset disabled={isSavingTreatment} className="grid gap-4 sm:grid-cols-2">
        <label className="crm-label sm:col-span-2">
          {copy.name}
          <input className="crm-input" maxLength={200} value={treatmentPlan.title} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, title: e.target.value })} />
        </label>
        <label className="crm-label">
          {copy.start}
          <input type="date" className="crm-input" value={treatmentPlan.start_date || ""} max={treatmentPlan.end_date || undefined} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, start_date: e.target.value })} />
        </label>
        <label className="crm-label">
          {copy.end}
          <input type="date" className="crm-input" value={treatmentPlan.end_date || ""} min={treatmentPlan.start_date || undefined} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, end_date: e.target.value })} />
        </label>
      </fieldset>
      {treatmentSavedMsg ? (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-sapphire-soft/60 border border-sapphire/20 p-3.5 text-xs text-sapphire dark:text-blue-300">
          <CheckCircleIcon className="h-4 w-4 text-sapphire" />
          <span>{copy.saved}</span>
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
          className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="w-full rounded-lg border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
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
                alt=""
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
              className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:bg-muted disabled:text-muted-foreground"
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
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2"
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
                      className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1.5 text-white transition-opacity hover:bg-red-600 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                      title={t.removePhoto}
                      aria-label={`${t.removePhoto}: ${photo.name}`}
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
          className="rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground shadow-sm"
        >
          {isSavingTreatment ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  );
}

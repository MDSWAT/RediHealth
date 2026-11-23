"use client";

import type { ChangeEvent, FormEvent } from "react";
import { PatientPhotoGallery, PatientPhotoTrigger } from "./PatientMedia";
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
  ru: {
      saved: "План лечения сохранен.",
      diagnosis: "Диагностика и выводы",
      diagnosisPh: "Основной диагноз, степень тяжести симптомов, заключения",
      goals: "Цели ухода",
      goalsPh: "Краткосрочные и долгосрочные цели",
      meds: "Лекарства и методы лечения",
      medsPh: "Лекарственные средства, дозы или рекомендуемая терапия",
      instructions: "Инструкции для пациента",
      instructionsPh: "Диета, отдых, ежедневные привычки, следующий осмотр",
      attachTitle: "Добавьте фото в план",
      attachHint: "Например, скан рецепта или карта терапии.",
      selectImage: "Выбрать изображение",
      photoLabel: "Название фотографии",
      photoPh: "например Рецепт, схема терапии",
      ready: "Фото готово",
      attachButton: "Прикрепить фото",
      attached: "Фотографии в этом плане",
      removePhoto: "Удалить фото",
      saving: "Сохранение...",
      save: "Сохранить план",
    },

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
    <div className="crm-card space-y-5">
      <fieldset disabled={isSavingTreatment} className="grid gap-4 sm:grid-cols-2">
        <label className="crm-label sm:col-span-2">
          {copy.name}
          <input className="crm-input" maxLength={200} value={treatmentPlan.title} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, title: e.target.value })} />
        </label>
        <label className="crm-label">
          {copy.start}
          <input type="date" className="crm-input tabular-nums" value={treatmentPlan.start_date || ""} max={treatmentPlan.end_date || undefined} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, start_date: e.target.value })} />
        </label>
        <label className="crm-label">
          {copy.end}
          <input type="date" className="crm-input tabular-nums" value={treatmentPlan.end_date || ""} min={treatmentPlan.start_date || undefined} onChange={(e) => onChangeTreatmentPlan({ ...treatmentPlan, end_date: e.target.value })} />
        </label>
      </fieldset>
      {treatmentSavedMsg ? (
        <p role="status" className="rounded-lg border border-[var(--panel-line)] bg-[var(--panel-selection)] px-4 py-3 text-sm font-medium text-[var(--panel-ink)]">
          {copy.saved}
        </p>
      ) : null}

      <label className="crm-label">
        {t.diagnosis}
        <textarea
          rows={3}
          value={treatmentPlan.diagnosis || ""}
          onChange={(e) =>
            onChangeTreatmentPlan({ ...treatmentPlan, diagnosis: e.target.value })
          }
          placeholder={t.diagnosisPh}
          className="crm-input"
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="crm-label">
          {t.goals}
          <textarea
            rows={3}
            value={treatmentPlan.goals || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, goals: e.target.value })
            }
            placeholder={t.goalsPh}
            className="crm-input"
          />
        </label>

        <label className="crm-label">
          {t.meds}
          <textarea
            rows={3}
            value={treatmentPlan.medications || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, medications: e.target.value })
            }
            placeholder={t.medsPh}
            className="crm-input"
          />
        </label>
      </div>

      <label className="crm-label">
        {t.instructions}
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
          className="crm-input"
        />
      </label>

      <div className="space-y-4 border-t border-[var(--panel-line)] pt-5">
        <div>
          <h3 className="text-sm font-semibold text-[var(--panel-ink)]">
            {t.attachTitle}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--panel-muted)]">
            {t.attachHint}
          </p>
        </div>

        <form onSubmit={onAddTpPhoto} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="crm-label">
              {t.selectImage}
              <input
                type="file"
                accept="image/*"
                onChange={onTpPhotoUpload}
                className="patient-file-input"
              />
            </label>

            <label className="crm-label">
              {t.photoLabel}
              <input
                type="text"
                value={tpPhotoName}
                onChange={(e) => onChangeTpPhotoName(e.target.value)}
                placeholder={t.photoPh}
                className="crm-input"
              />
            </label>
          </div>

          {tpPhotoData ? (
            <div className="patient-pending-photo">
              <PatientPhotoTrigger photo={{ id: "pending-treatment", name: tpPhotoName || t.ready, data_url: tpPhotoData, date: "" }} />
              <span className="text-sm font-medium text-[var(--panel-ink)]">
                {t.ready}
              </span>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!tpPhotoData}
              className="crm-button whitespace-nowrap"
            >
              {t.attachButton}
            </button>
          </div>
        </form>

        {!!treatmentPlan.photos?.length && (
          <div className="mt-5 border-t border-[var(--panel-line)] pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--panel-ink)]">{t.attached}</p>
              <span className="text-sm tabular-nums [font-feature-settings:'zero'_0] text-[var(--panel-muted)]">{treatmentPlan.photos.length}</span>
            </div>
            <PatientPhotoGallery photos={treatmentPlan.photos} onDelete={onDeleteTpPhoto} busy={isSavingTreatment} />
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--panel-line)] pt-5">
        <button
          type="button"
          disabled={isSavingTreatment}
          onClick={onSaveTreatmentPlan}
          className="crm-button crm-primary whitespace-nowrap"
        >
          {isSavingTreatment ? copy.saving : copy.save}
        </button>
      </div>
    </div>
  );
}

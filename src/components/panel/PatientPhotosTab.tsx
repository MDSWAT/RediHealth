"use client";

import type { ChangeEvent, FormEvent } from "react";
import { ImageIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientPhoto } from "@/lib/types/patient";
import { PatientPhotoGallery, PatientPhotoTrigger } from "./PatientMedia";
import { patientDesignTranslations } from "@/lib/i18n/patient-design-translations";

interface PatientPhotosTabProps {
  busy?: boolean;
  hasOtherMedia?: boolean;
  photos: PatientPhoto[];
  newPhotoName: string;
  onChangeNewPhotoName: (value: string) => void;
  newPhotoNote: string;
  onChangeNewPhotoNote: (value: string) => void;
  newPhotoData: string | null;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddPhoto: (e: FormEvent) => void;
  onDeletePhoto: (id: string) => void;
}

export function PatientPhotosTab({
  busy = false,
  hasOtherMedia = false,
  photos,
  newPhotoName,
  onChangeNewPhotoName,
  newPhotoNote,
  onChangeNewPhotoNote,
  newPhotoData,
  onImageUpload,
  onAddPhoto,
  onDeletePhoto,
}: PatientPhotosTabProps) {
  const { lang } = useLanguage();
  const t = {
    ru: {
      title: "Фотографии и документы",
      subtitle: "Клинические фотографии, результаты анализов или рецепты.",
      attachNew: "Добавить фотографию или документ",
      selectImage: "Выбрать изображение",
      label: "Название",
      labelPh: "Например, кожная сыпь, анализ крови",
      notes: "Примечание",
      notesPh: "Что изображено на фото",
      ready: "Изображение готово",
      attach: "Прикрепить",
      empty: "Фото пока нет.",
      remove: "Удалить фото",
    },

    en: {
      title: "Photos and documents",
      subtitle: "Clinical photos, lab results or prescriptions.",
      attachNew: "Add a photo or document",
      selectImage: "Choose image",
      label: "Title",
      labelPh: "e.g. Skin rash, blood test result",
      notes: "Note",
      notesPh: "What the photo shows",
      ready: "Image ready",
      attach: "Attach",
      empty: "No photos yet.",
      remove: "Remove photo",
    },
    ro: {
      title: "Poze și documente",
      subtitle: "Poze clinice, rezultate de analize sau rețete.",
      attachNew: "Adaugă o poză sau un document",
      selectImage: "Alege imaginea",
      label: "Titlu",
      labelPh: "ex. Erupție pe piele, analize de sânge",
      notes: "Notă",
      notesPh: "Ce se vede în poză",
      ready: "Imagine pregătită",
      attach: "Atașează",
      empty: "Nu există poze încă.",
      remove: "Șterge poza",
    },
    sq: {
      title: "Foto dhe dokumente",
      subtitle: "Foto klinike, analiza ose receta.",
      attachNew: "Shto një foto ose dokument",
      selectImage: "Zgjidh imazh",
      label: "Titulli",
      labelPh: "p.sh. Skuqje lëkure, analiza gjaku",
      notes: "Shënim",
      notesPh: "Çfarë tregon fotoja",
      ready: "Imazhi është gati",
      attach: "Bashkëngjit",
      empty: "Ende nuk ka foto.",
      remove: "Hiq foton",
    },
    it: {
      title: "Foto e documenti",
      subtitle: "Foto cliniche, esami o ricette.",
      attachNew: "Aggiungi una foto o un documento",
      selectImage: "Scegli immagine",
      label: "Titolo",
      labelPh: "es. Eruzione cutanea, esame del sangue",
      notes: "Nota",
      notesPh: "Cosa mostra la foto",
      ready: "Immagine pronta",
      attach: "Allega",
      empty: "Ancora nessuna foto.",
      remove: "Rimuovi foto",
    },
    hr: {
      title: "Fotografije i dokumenti",
      subtitle: "Kliničke fotografije, laboratorijski nalazi ili recepti.",
      attachNew: "Dodaj fotografiju ili dokument",
      selectImage: "Odaberi sliku",
      label: "Naslov",
      labelPh: "npr. Osip na koži, nalaz krvi",
      notes: "Bilješka",
      notesPh: "Što prikazuje fotografija",
      ready: "Slika je spremna",
      attach: "Priloži",
      empty: "Još nema fotografija.",
      remove: "Ukloni fotografiju",
    },
    rom: {
      title: "Tasvirya thaj lila",
      subtitle: "Klinikane tasvirya, rengro dikhiben vay draba pe receta.",
      attachNew: "Tho ekh tasviri vay lil",
      selectImage: "Alosar tasviri",
      label: "Anav",
      labelPh: "misal Lolyipen pe morchi, rengro dikhiben",
      notes: "Noticya",
      notesPh: "So sikavel o tasviri",
      ready: "O tasviri si gata",
      attach: "Phande",
      empty: "Inke nay tasvirya.",
      remove: "Chude o tasviri",
    },
  }[lang];
  const design = patientDesignTranslations[lang];
  const showEmpty = photos.length === 0 && !hasOtherMedia;
  return <section className="crm-card patient-photo-section">
    {photos.length > 0 || !hasOtherMedia ? (
      <div className="patient-section-heading">
        <div>
          <h2>{t.title}</h2>
          <p>{design.photoHint}</p>
        </div>
        <span className="patient-section-count tabular-nums [font-feature-settings:'zero'_0]">{photos.length}</span>
      </div>
    ) : null}
    {photos.length > 0 ? (
      <PatientPhotoGallery photos={photos} onDelete={onDeletePhoto} busy={busy} />
    ) : showEmpty ? (
      <div className="patient-photos-empty">
        <ImageIcon className="h-7 w-7" aria-hidden="true" />
        <p>{t.empty}</p>
        <span>{t.subtitle}</span>
      </div>
    ) : null}
    <form onSubmit={onAddPhoto} className={photos.length > 0 || showEmpty ? "patient-photo-form" : ""}>
      <h3 className={photos.length > 0 || showEmpty ? undefined : "mb-4 text-base font-semibold text-[var(--panel-ink)]"}>{t.attachNew}</h3>
      <fieldset disabled={busy} className="patient-photo-fields">
        <label className="crm-label">{t.selectImage}<input required={!newPhotoData} type="file" accept="image/*" onChange={onImageUpload} className="patient-file-input" /></label>
        <label className="crm-label">{t.label}<input type="text" value={newPhotoName} onChange={(e) => onChangeNewPhotoName(e.target.value)} placeholder={t.labelPh} className="crm-input" /></label>
        <label className="crm-label patient-photo-note-field">{t.notes}<input type="text" value={newPhotoNote} onChange={(e) => onChangeNewPhotoNote(e.target.value)} placeholder={t.notesPh} className="crm-input" /></label>
        {newPhotoData && <div className="patient-pending-photo"><PatientPhotoTrigger photo={{ id: "pending", name: newPhotoName || t.ready, data_url: newPhotoData, date: "" }} /><span>{t.ready}</span></div>}
        <div className="patient-photo-submit"><button type="submit" disabled={!newPhotoData || busy} className="crm-button crm-primary whitespace-nowrap">{t.attach}</button></div>
      </fieldset>
    </form>
  </section>;
}

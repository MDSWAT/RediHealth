/* eslint-disable @next/next/no-img-element */
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { ImageIcon, TrashIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PatientPhoto } from "@/lib/types/patient";

interface PatientPhotosTabProps {
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
    en: {
      title: "Photos and documents",
      subtitle: "Clinical photos, lab results or prescriptions.",
      attachNew: "Add a photo or document",
      selectImage: "Choose image",
      label: "Title",
      labelPh: "e.g. Skin rash, Blood test result",
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
  }[lang];
  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          {t.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      <form
        onSubmit={onAddPhoto}
        className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
      >
        <h4 className="text-xs font-bold text-foreground">
          {t.attachNew}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.selectImage} <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              {t.label}
            </label>
            <input
              type="text"
              value={newPhotoName}
              onChange={(e) => onChangeNewPhotoName(e.target.value)}
              placeholder={t.labelPh}
              className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">
            {t.notes}
          </label>
          <input
            type="text"
            value={newPhotoNote}
            onChange={(e) => onChangeNewPhotoNote(e.target.value)}
            placeholder={t.notesPh}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {newPhotoData ? (
          <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
            <img
              src={newPhotoData}
              alt=""
              className="h-12 w-12 object-cover rounded border border-border"
            />
            <span className="text-xs text-emerald-600 font-semibold">
              {t.ready}
            </span>
          </div>
        ) : null}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!newPhotoData}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground"
          >
            {t.attach}
          </button>
        </div>
      </form>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
          <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <span>{t.empty}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2.5"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                <img
                  src={photo.data_url}
                  alt={photo.name}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onDeletePhoto(photo.id)}
                  className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1.5 text-white transition-opacity hover:bg-red-600 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                  title={t.remove}
                  aria-label={`${t.remove}: ${photo.name}`}
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 text-xs">
                <p className="font-bold text-foreground truncate" title={photo.name}>
                  {photo.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{photo.date}</p>
                {photo.notes ? (
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                    {photo.notes}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

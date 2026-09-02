/* eslint-disable @next/next/no-img-element */
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { ImageIcon, TrashIcon } from "@/components/ui/icons";
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
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Medical Photos & Document Attachments
        </h3>
        <p className="text-xs text-muted-foreground">
          Attach clinical photos, lab results, or prescribed documentation.
        </p>
      </div>

      <form
        onSubmit={onAddPhoto}
        className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
      >
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
          Attach New Photo / Document
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Select Image File <span className="text-red-500">*</span>
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
              Title / Label
            </label>
            <input
              type="text"
              value={newPhotoName}
              onChange={(e) => onChangeNewPhotoName(e.target.value)}
              placeholder="e.g. Skin Rash Photo, Blood Test Result"
              className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1 block">
            Caption / Staff Notes
          </label>
          <input
            type="text"
            value={newPhotoNote}
            onChange={(e) => onChangeNewPhotoNote(e.target.value)}
            placeholder="Short description or clinical findings regarding this photo..."
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {newPhotoData ? (
          <div className="flex items-center gap-3 bg-card p-2 rounded-lg border border-border">
            <img
              src={newPhotoData}
              alt="Preview"
              className="h-12 w-12 object-cover rounded border border-border"
            />
            <span className="text-xs text-emerald-600 font-semibold">
              Image ready to attach
            </span>
          </div>
        ) : null}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={!newPhotoData}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Attach Photo
          </button>
        </div>
      </form>

      {photos.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-xs text-muted-foreground">
          <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <span>No medical photos attached. Use the form above to upload images.</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-2.5 shadow-sm hover:shadow-md transition-all"
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
                  className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  title="Remove photo"
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

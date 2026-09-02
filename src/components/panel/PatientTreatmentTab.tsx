/* eslint-disable @next/next/no-img-element */
"use client";

import type { ChangeEvent, FormEvent } from "react";
import { CheckCircleIcon, ImageIcon, TrashIcon } from "@/components/ui/icons";
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
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      {treatmentSavedMsg ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircleIcon className="h-4 w-4" />
          <span>Treatment plan saved successfully!</span>
        </div>
      ) : null}

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Primary Diagnosis & Clinical Findings
        </label>
        <textarea
          rows={3}
          value={treatmentPlan.diagnosis || ""}
          onChange={(e) =>
            onChangeTreatmentPlan({ ...treatmentPlan, diagnosis: e.target.value })
          }
          placeholder="Record primary clinical diagnosis, symptoms severity, or findings..."
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Care Goals & Objectives
          </label>
          <textarea
            rows={3}
            value={treatmentPlan.goals || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, goals: e.target.value })
            }
            placeholder="Short & long term health targets..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Prescribed Medications / Therapies
          </label>
          <textarea
            rows={3}
            value={treatmentPlan.medications || ""}
            onChange={(e) =>
              onChangeTreatmentPlan({ ...treatmentPlan, medications: e.target.value })
            }
            placeholder="List medications, dosage, or recommended therapy..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground mb-1.5 block">
          Care Instructions & Patient Directives
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
          placeholder="Specific lifestyle, diet, rest, or follow-up instructions..."
          className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="border-t border-border pt-5 space-y-4">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-primary" />
            <span>Attach Photo to Treatment Plan</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload prescription scans, therapy diagrams, or treatment images directly to this plan.
          </p>
        </div>

        <form
          onSubmit={onAddTpPhoto}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">
                Select Image File
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
                Photo Title / Description
              </label>
              <input
                type="text"
                value={tpPhotoName}
                onChange={(e) => onChangeTpPhotoName(e.target.value)}
                placeholder="e.g. Prescription Scan, Treatment Diagram"
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
                Photo ready to attach
              </span>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!tpPhotoData}
              className="rounded-lg bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
            >
              Attach Photo to Treatment Plan
            </button>
          </div>
        </form>

        {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
          <div>
            <p className="text-xs font-bold text-foreground mb-2">
              Attached Treatment Plan Photos ({treatmentPlan.photos.length})
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
                      title="Remove photo"
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
          {isSavingTreatment ? "Saving Plan..." : "Save Treatment Plan"}
        </button>
      </div>
    </div>
  );
}

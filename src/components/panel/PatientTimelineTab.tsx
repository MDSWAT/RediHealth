/* eslint-disable @next/next/no-img-element */
"use client";

import { CalendarIcon, ImageIcon, UserIcon } from "@/components/ui/icons";
import type { FollowupItem, PatientItem, PatientPhoto } from "@/lib/types/patient";

interface PatientTimelineTabProps {
  patient: PatientItem;
  followups: FollowupItem[];
  photos: PatientPhoto[];
}

export function PatientTimelineTab({ patient, followups, photos }: PatientTimelineTabProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Unified Medical History & Activity Log
        </h3>
        <p className="text-xs text-muted-foreground">
          Chronological record of patient enquiries, care plans, follow-ups, and attachments.
        </p>
      </div>

      <div className="relative pl-6 border-l-2 border-border space-y-6 pt-2">
        <div className="relative">
          <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs">
            <UserIcon className="h-3.5 w-3.5" />
          </span>
          <div className="rounded-xl border border-border bg-background p-4 text-xs">
            <p className="font-bold text-foreground text-sm">
              Initial Request / Enquiry Received
            </p>
            <p className="text-muted-foreground text-[11px] mt-0.5">
              {new Date(patient.created_at).toLocaleString()}
            </p>
            <div className="mt-2 p-2.5 rounded-lg bg-muted/40 text-foreground whitespace-pre-wrap">
              {patient.condition_notes || "No initial enquiry text recorded."}
            </div>
          </div>
        </div>

        {followups.map((item) => (
          <div key={item.id} className="relative">
            <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs">
              <CalendarIcon className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-xl border border-border bg-background p-4 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground text-sm">{item.title}</p>
                <span className="capitalize font-bold text-amber-600 dark:text-amber-400">
                  {item.status}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Scheduled Date: {item.date}
              </p>
              {item.notes ? (
                <p className="mt-2 text-foreground">{item.notes}</p>
              ) : null}
            </div>
          </div>
        ))}

        {photos.map((photo) => (
          <div key={photo.id} className="relative">
            <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-white text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
            </span>
            <div className="rounded-xl border border-border bg-background p-4 text-xs flex gap-3">
              <img
                src={photo.data_url}
                alt={photo.name}
                className="h-14 w-14 object-cover rounded border border-border flex-none"
              />
              <div>
                <p className="font-bold text-foreground text-sm">{photo.name}</p>
                <p className="text-muted-foreground text-[11px]">Attached on {photo.date}</p>
                {photo.notes ? <p className="mt-1 text-foreground">{photo.notes}</p> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

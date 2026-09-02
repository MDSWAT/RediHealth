/* eslint-disable @next/next/no-img-element */
"use client";

import { PrinterIcon } from "@/components/ui/icons";
import type {
  FollowupItem,
  PatientItem,
  PatientPhoto,
  PatientStatus,
  TreatmentPlan,
} from "@/lib/types/patient";

interface PatientPrintReportProps {
  patient: PatientItem;
  status: PatientStatus;
  treatmentPlan: TreatmentPlan;
  followups: FollowupItem[];
  photos: PatientPhoto[];
  onClose: () => void;
}

export function PatientPrintReport({
  patient,
  status,
  treatmentPlan,
  followups,
  photos,
  onClose,
}: PatientPrintReportProps) {
  return (
    <div className="min-h-screen bg-background p-6 print:p-0 print:static">
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <PrinterIcon className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground text-sm">
            Printable Medical Report
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
          >
            Back to Profile
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-white p-8 sm:p-12 text-slate-900 shadow-lg print:border-none print:shadow-none print:p-0">
        <div className="flex items-start justify-between border-b-2 border-primary pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              RediHealth Clinical Center
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Official Patient Medical Profile & Health History Report
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-slate-800">CONFIDENTIAL MEDICAL RECORD</p>
            <p className="mt-0.5">
              Report Date: {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
            </p>
            <p>Patient Record ID: #{patient.id}</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            1. Patient Identification & Demographics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-slate-500 font-semibold">Full Name:</p>
              <p className="font-bold text-slate-900 text-sm">{patient.full_name}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Phone Number:</p>
              <p className="font-medium text-slate-800">{patient.phone}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Email Address:</p>
              <p className="font-medium text-slate-800">{patient.email}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Date of Birth:</p>
              <p className="font-medium text-slate-800">{patient.date_of_birth || "Not specified"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Gender:</p>
              <p className="font-medium text-slate-800">{patient.gender || "Not specified"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-semibold">Care Status:</p>
              <p className="font-bold uppercase text-primary">{status} Care</p>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <p className="text-slate-500 font-semibold">Location / Address:</p>
              <p className="font-medium text-slate-800">{patient.address || "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            2. Clinical Treatment Plan & Directives
          </h2>
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 mb-0.5">Primary Diagnosis / Clinical Findings:</p>
              <p className="text-slate-700 whitespace-pre-wrap">
                {treatmentPlan.diagnosis || "No primary diagnosis recorded."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-0.5">Treatment Goals:</p>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {treatmentPlan.goals || "No goals recorded."}
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-0.5">Prescribed Medications:</p>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {treatmentPlan.medications || "No medications specified."}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 mb-0.5">Care Instructions & Advice:</p>
              <p className="text-slate-700 whitespace-pre-wrap">
                {treatmentPlan.care_instructions || "No specific instructions specified."}
              </p>
            </div>
            {treatmentPlan.photos && treatmentPlan.photos.length > 0 ? (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-2">Attached Treatment Plan Photos / Prescriptions ({treatmentPlan.photos.length}):</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {treatmentPlan.photos.map((photo) => (
                    <div key={photo.id} className="border border-slate-200 rounded p-1.5 bg-white">
                      <img
                        src={photo.data_url}
                        alt={photo.name}
                        className="h-20 w-full object-cover rounded border border-slate-200 mb-1"
                      />
                      <p className="font-semibold text-[10px] text-slate-800 truncate">{photo.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            3. Scheduled Follow-ups & Care Log
          </h2>
          {followups.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No follow-ups recorded.</p>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b">Scheduled Date</th>
                  <th className="p-2 border-b">Follow-up Goal</th>
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">Clinical Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followups.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2 font-medium">{item.date}</td>
                    <td className="p-2 font-semibold">{item.title}</td>
                    <td className="p-2 capitalize font-bold text-slate-700">{item.status}</td>
                    <td className="p-2 text-slate-600">{item.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
            4. Patient Symptoms & Medical History
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <p className="font-bold text-slate-800 mb-1">Initial Enquiry / Symptoms Notes:</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                {patient.condition_notes || "None recorded."}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-1">Medical History & Allergies:</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap">
                {patient.medical_history || "None recorded."}
              </div>
            </div>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-3">
              5. Attached Medical Images & Documentation ({photos.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50">
                  <img
                    src={photo.data_url}
                    alt={photo.name}
                    className="h-28 w-full object-cover rounded border border-slate-200 mb-1.5"
                  />
                  <p className="font-bold text-[11px] text-slate-800 truncate">{photo.name}</p>
                  <p className="text-[10px] text-slate-500">{photo.date}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-12 border-t border-slate-300 pt-6 flex items-end justify-between text-xs text-slate-500">
          <div>
            <p className="font-bold text-slate-700">RediHealth Staff Signature:</p>
            <div className="mt-6 border-b border-slate-400 w-48" />
            <p className="mt-1 text-[10px]">Authorized Healthcare Worker</p>
          </div>
          <div className="text-right text-[10px] text-slate-400">
            <p>Generated by RediHealth Platform</p>
            <p>Document strictly confidential</p>
          </div>
        </div>
      </div>
    </div>
  );
}

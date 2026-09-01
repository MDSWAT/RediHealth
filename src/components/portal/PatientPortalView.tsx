/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircleIcon,
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  ImageIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/ui/icons";
import type { PatientItem, PatientPriority } from "@/lib/types/patient";
import { Container } from "@/components/ui/Container";
import { usePatientPortal } from "@/components/portal/usePatientPortal";

interface PatientPortalViewProps {
  initialPatient: PatientItem;
  token: string;
}

export function PatientPortalView({
  initialPatient,
  token,
}: PatientPortalViewProps) {
  const { patient, priorityMeta, errorMessage, symptoms, followup, photo } =
    usePatientPortal({ initialPatient, token });

  const {
    text: symptomsText,
    setText: setSymptomsText,
    priority: selectedPriority,
    setPriority: setSelectedPriority,
    isSaving: isSavingSymptoms,
    savedMessage: symptomsSavedMsg,
    submit: handleUpdateSymptoms,
  } = symptoms;

  const {
    showForm: showAddFollowup,
    setShowForm: setShowAddFollowup,
    title: newFollowupTitle,
    setTitle: setNewFollowupTitle,
    date: newFollowupDate,
    setDate: setNewFollowupDate,
    notes: newFollowupNotes,
    setNotes: setNewFollowupNotes,
    isSaving: isSavingFollowup,
    submit: handleAddFollowup,
  } = followup;

  const {
    name: newPhotoName,
    setName: setNewPhotoName,
    note: newPhotoNote,
    setNote: setNewPhotoNote,
    data: newPhotoData,
    isSaving: isSavingPhoto,
    onFileChange: handlePhotoFileChange,
    submit: handleUploadPhoto,
  } = photo;

  return (
    <div className="min-h-screen bg-muted py-8 sm:py-12">
      <Container>
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-600 p-4 text-white shadow-sm">
          <AlertCircleIcon className="h-5 w-5 flex-none mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold">Medical Emergency Notice:</strong>{" "}
            This portal is for routine communication and care management. If you are experiencing a life-threatening medical emergency, please call <strong>112</strong> or visit your nearest emergency room immediately.
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary font-bold text-xl">
                <UserIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {patient.full_name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">
                    {patient.status} Care
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${priorityMeta.badgeClass}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${priorityMeta.dotClass}`} />
                    <span>{priorityMeta.label}</span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  RediHealth Patient Portal &bull; Record ID #{patient.id}
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground sm:text-right">
              <p className="font-semibold text-foreground">Assigned Healthcare Staff:</p>
              <p className="text-primary font-bold mt-0.5">
                {patient.assigned_worker_name || "RediHealth Clinical Team"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Phone:</span>
              <strong className="text-foreground">{patient.phone}</strong>
            </div>
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Email:</span>
              <strong className="text-foreground">{patient.email}</strong>
            </div>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Location:</span>
              <strong className="text-foreground">{patient.address || "Not specified"}</strong>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 dark:text-red-400">
            {errorMessage}
          </div>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <EditIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Your Clinical Treatment Plan & Care Directives
            </h2>
          </div>

          {patient.treatment_plan ? (
            <div className="space-y-4 text-xs leading-relaxed">
              {patient.treatment_plan.diagnosis ? (
                <div className="rounded-xl border border-primary/20 bg-primary-soft/30 p-4">
                  <p className="font-bold text-primary uppercase text-[10px] tracking-wider">
                    Primary Diagnosis / Findings
                  </p>
                  <p className="mt-1 font-semibold text-foreground text-sm whitespace-pre-wrap">
                    {patient.treatment_plan.diagnosis}
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patient.treatment_plan.goals ? (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">
                      Care Goals
                    </p>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">
                      {patient.treatment_plan.goals}
                    </p>
                  </div>
                ) : null}

                {patient.treatment_plan.medications ? (
                  <div className="rounded-xl border border-border bg-background p-4">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">
                      Prescribed Medications / Therapies
                    </p>
                    <p className="mt-1 text-foreground whitespace-pre-wrap">
                      {patient.treatment_plan.medications}
                    </p>
                  </div>
                ) : null}
              </div>

              {patient.treatment_plan.care_instructions ? (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">
                    Care Instructions & Lifestyle Advice
                  </p>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">
                    {patient.treatment_plan.care_instructions}
                  </p>
                </div>
              ) : null}

              {patient.treatment_plan.photos && patient.treatment_plan.photos.length > 0 ? (
                <div>
                  <p className="font-bold text-foreground text-xs mb-2">
                    Attached Treatment Scans & Prescriptions ({patient.treatment_plan.photos.length}):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {patient.treatment_plan.photos.map((photo) => (
                      <div key={photo.id} className="rounded-xl border border-border bg-background p-2 text-xs">
                        <img
                          src={photo.data_url}
                          alt={photo.name}
                          className="h-24 w-full object-cover rounded-lg border border-border mb-1"
                        />
                        <p className="font-bold text-foreground truncate" title={photo.name}>
                          {photo.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No formal treatment plan has been issued yet. Our medical staff will update this section after reviewing your condition.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <BellIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">
              Report Symptoms & Urgency Status
            </h2>
          </div>

          {symptomsSavedMsg ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="h-4 w-4" />
              <span>Symptoms & status updated! Our healthcare team has been notified.</span>
            </div>
          ) : null}

          <form onSubmit={handleUpdateSymptoms} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground mb-1 block">
                How are you feeling? Update your symptoms or enquiry notes:
              </label>
              <textarea
                rows={4}
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                placeholder="Describe any new symptoms, pain levels, side effects, or changes in how you feel..."
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Symptom Urgency / Care Priority Level
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) =>
                    setSelectedPriority(e.target.value as PatientPriority)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="critical">🔴 Critical Priority (Severe Symptoms / Immediate Care)</option>
                  <option value="high">🟠 High Priority (Urgent Attention Needed)</option>
                  <option value="moderate">🟡 Moderate Priority (Routine Progress Check)</option>
                  <option value="low">🟢 Low Priority (General Update)</option>
                </select>
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  disabled={isSavingSymptoms}
                  className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 shadow-sm transition-colors"
                >
                  {isSavingSymptoms ? "Saving..." : "Update Symptoms & Priority"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm mb-8 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Follow-ups & Care Appointments ({patient.followups?.length || 0})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFollowup(!showAddFollowup)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Request Follow-up</span>
            </button>
          </div>

          {showAddFollowup ? (
            <form
              onSubmit={handleAddFollowup}
              className="rounded-xl border border-border bg-muted/40 p-4 space-y-3 text-xs"
            >
              <h3 className="font-bold text-foreground uppercase tracking-wide">
                Request New Follow-Up Check-in
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">
                    Follow-up Reason / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFollowupTitle}
                    onChange={(e) => setNewFollowupTitle(e.target.value)}
                    placeholder="e.g. Follow-up check on recovery progress"
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground mb-1 block">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newFollowupDate}
                    onChange={(e) => setNewFollowupDate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Additional Notes for Staff
                </label>
                <input
                  type="text"
                  value={newFollowupNotes}
                  onChange={(e) => setNewFollowupNotes(e.target.value)}
                  placeholder="Any details on your availability or questions..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddFollowup(false)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFollowup}
                  className="rounded-lg bg-primary px-4 py-1.5 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSavingFollowup ? "Scheduling..." : "Submit Follow-up Request"}
                </button>
              </div>
            </form>
          ) : null}

          {patient.followups && patient.followups.length > 0 ? (
            <div className="space-y-2.5">
              {patient.followups.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border bg-background p-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-primary font-bold">
                      <ClockIcon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground text-sm">{item.title}</p>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
                            item.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Date: <strong className="text-foreground">{item.date}</strong>
                        {item.notes ? ` &bull; ${item.notes}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No follow-ups requested yet. Click &quot;Request Follow-up&quot; above to add a check-in date.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Your Attached Medical Photos & Documents ({patient.photos?.length || 0})
              </h2>
            </div>
          </div>

          <form
            onSubmit={handleUploadPhoto}
            className="rounded-xl border border-border bg-muted/40 p-4 space-y-3 text-xs"
          >
            <h3 className="font-bold text-foreground uppercase tracking-wide">
              Upload New Medical Photo / Document
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Select Image File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="w-full text-xs text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Photo Title / Label
                </label>
                <input
                  type="text"
                  value={newPhotoName}
                  onChange={(e) => setNewPhotoName(e.target.value)}
                  placeholder="e.g. Skin Rash Photo, Blood Test Report"
                  className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">
                Caption / Notes for Doctor
              </label>
              <input
                type="text"
                value={newPhotoNote}
                onChange={(e) => setNewPhotoNote(e.target.value)}
                placeholder="Describe what is shown in this image..."
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
                  Photo ready to attach
                </span>
              </div>
            ) : null}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!newPhotoData || isSavingPhoto}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50 shadow-sm"
              >
                {isSavingPhoto ? "Uploading..." : "Attach Photo"}
              </button>
            </div>
          </form>

          {patient.photos && patient.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {patient.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-background p-2.5 shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={photo.data_url}
                      alt={photo.name}
                      className="h-full w-full object-cover"
                    />
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
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No medical photos uploaded. Use the form above to upload images for your medical team.
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "./AdminShell";
import { CheckCircleIcon, ClockIcon, CopyIcon, FileTextIcon, GlobeIcon, MailIcon, PlusIcon, UserIcon } from "@/components/ui/icons";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

type AssignedPatient = {
  id: string;
  full_name: string;
  priority?: string | null;
};

type MeetItem = {
  id: string;
  title: string;
  meeting_url: string;
  transcript: string | null;
  notes: string | null;
  patient_id: string | null;
  patient_name: string | null;
  created_at: string;
};

type MeetDashboardProps = {
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  pendingRequestsCount?: number;
  databaseAvailable: boolean;
  assignedPatients: AssignedPatient[];
  initialMeetings: MeetItem[];
};

function toStableMeetingUrl(rawUrl: string, meetingId: string) {
  const fallback = `https://meet.jit.si/redihealth-${meetingId}`;
  const value = rawUrl.trim();
  if (!value) return fallback;

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("8x8.vc") || value.includes("vpaas-magic-cookie")) {
      return fallback;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return fallback;
  }
}

const copy = {
  en: {
    title: "Meet",
    subtitle: "Create and manage video consultations with your assigned patients.",
    noDatabase: "Connect MySQL and apply meeting migrations (009 and 010) to manage video meets.",
    assignedPatients: "Assigned patients",
    noAssignedPatients: "No assigned patients are available yet.",
    createMeet: "Create new meet",
    meetTitle: "Meeting title",
    meetTitlePlaceholder: "Example: Weekly treatment follow-up",
    pickPatient: "Patient",
    pickPatientPlaceholder: "Select a patient",
    transcript: "Transcript with patient",
    transcriptPlaceholder: "Add transcript text now or capture it inside the meeting workspace.",
    notes: "Doctor-only notes",
    notesHint: "Private notes for clinical decisions and follow-up actions.",
    notesPlaceholder: "Example: Medication adjusted; review lab values next session.",
    createButton: "Create meet",
    creatingButton: "Creating...",
    openWorkspace: "Open workspace",
    openRoom: "Open video room",
    quickCreate: "Create meet",
    historyTitle: "Meeting history",
    emptyMeetings: "No meetings yet. Create one to begin.",
    createdAt: "Created",
    saveError: "Could not create the meet. Try again.",
    saveSuccess: "Meet created successfully.",
    inviteSent: "Meet created and invitation email sent to patient.",
    inviteSkipped: "Meet created, but invitation email was not sent.",
    linkCopied: "Meeting link copied",
    patientLabel: "Patient",
    transcriptLabel: "Transcript",
    notesLabel: "Doctor notes",
  },
  ro: {
    title: "Meet",
    subtitle: "Creeaza si gestioneaza consultatii video cu pacientii asignati.",
    noDatabase: "Conecteaza MySQL si aplica migrarile 009 si 010 pentru a gestiona intalnirile video.",
    assignedPatients: "Pacienti asignati",
    noAssignedPatients: "Nu exista inca pacienti asignati.",
    createMeet: "Creeaza intalnire noua",
    meetTitle: "Titlul intalnirii",
    meetTitlePlaceholder: "Exemplu: Monitorizare saptamanala tratament",
    pickPatient: "Pacient",
    pickPatientPlaceholder: "Selecteaza un pacient",
    transcript: "Transcriere cu pacientul",
    transcriptPlaceholder: "Adauga acum transcrierea sau capteaz-o in spatiul intalnirii.",
    notes: "Note doar pentru doctor",
    notesHint: "Note private pentru decizii clinice si actiuni de urmarire.",
    notesPlaceholder: "Exemplu: Tratament ajustat; revizuire analize la urmatoarea sesiune.",
    createButton: "Creeaza intalnire",
    creatingButton: "Se creeaza...",
    openWorkspace: "Deschide spatiul",
    openRoom: "Deschide camera video",
    quickCreate: "Creeaza intalnire",
    historyTitle: "Istoric intalniri",
    emptyMeetings: "Nu exista inca intalniri. Creeaza una pentru a incepe.",
    createdAt: "Creat",
    saveError: "Nu s-a putut crea intalnirea. Incearca din nou.",
    saveSuccess: "Intalnirea a fost creata.",
    inviteSent: "Intalnirea a fost creata si invitatia a fost trimisa pacientului.",
    inviteSkipped: "Intalnirea a fost creata, dar invitatia pe email nu a fost trimisa.",
    linkCopied: "Link-ul intalnirii a fost copiat",
    patientLabel: "Pacient",
    transcriptLabel: "Transcriere",
    notesLabel: "Note doctor",
  },
  sq: {
    title: "Meet",
    subtitle: "Krijo dhe menaxho konsultatat video me pacientet e caktuar.",
    noDatabase: "Lidhe MySQL dhe apliko migrimet 009 dhe 010 per menaxhimin e takimeve video.",
    assignedPatients: "Pacientet e caktuar",
    noAssignedPatients: "Nuk ka paciente te caktuar ende.",
    createMeet: "Krijo takim te ri",
    meetTitle: "Titulli i takimit",
    meetTitlePlaceholder: "Shembull: Ndjekje javore e trajtimit",
    pickPatient: "Pacienti",
    pickPatientPlaceholder: "Zgjidh pacient",
    transcript: "Transkripti me pacientin",
    transcriptPlaceholder: "Shto transkriptin tani ose regjistroje ne hapesiren e takimit.",
    notes: "Shenime vetem per doktorin",
    notesHint: "Shenime private per vendime klinike dhe hapa pasues.",
    notesPlaceholder: "Shembull: Mjekimi u ndryshua; kontrollo analizat ne sesionin tjeter.",
    createButton: "Krijo takim",
    creatingButton: "Duke krijuar...",
    openWorkspace: "Hap hapesiren",
    openRoom: "Hap dhomen video",
    quickCreate: "Krijo takim",
    historyTitle: "Historiku i takimeve",
    emptyMeetings: "Nuk ka takime ende. Krijo nje per te filluar.",
    createdAt: "Krijuar",
    saveError: "Nuk u krijua takimi. Provo perseri.",
    saveSuccess: "Takimi u krijua me sukses.",
    inviteSent: "Takimi u krijua dhe emaili i fteses iu dergua pacientit.",
    inviteSkipped: "Takimi u krijua, por emaili i fteses nuk u dergua.",
    linkCopied: "Lidhja e takimit u kopjua",
    patientLabel: "Pacienti",
    transcriptLabel: "Transkripti",
    notesLabel: "Shenime doktori",
  },
  it: {
    title: "Meet",
    subtitle: "Crea e gestisci consulenze video con i pazienti assegnati.",
    noDatabase: "Collega MySQL e applica le migrazioni 009 e 010 per gestire le riunioni video.",
    assignedPatients: "Pazienti assegnati",
    noAssignedPatients: "Non ci sono ancora pazienti assegnati.",
    createMeet: "Crea nuova riunione",
    meetTitle: "Titolo riunione",
    meetTitlePlaceholder: "Esempio: Follow-up settimanale della terapia",
    pickPatient: "Paziente",
    pickPatientPlaceholder: "Seleziona un paziente",
    transcript: "Trascrizione con il paziente",
    transcriptPlaceholder: "Aggiungi ora la trascrizione o registrala nell'area riunione.",
    notes: "Note solo per il medico",
    notesHint: "Note private per decisioni cliniche e azioni successive.",
    notesPlaceholder: "Esempio: Terapia aggiornata; rivedere esami nel prossimo incontro.",
    createButton: "Crea riunione",
    creatingButton: "Creazione...",
    openWorkspace: "Apri area",
    openRoom: "Apri stanza video",
    quickCreate: "Crea riunione",
    historyTitle: "Storico riunioni",
    emptyMeetings: "Nessuna riunione ancora. Creane una per iniziare.",
    createdAt: "Creata",
    saveError: "Impossibile creare la riunione. Riprova.",
    saveSuccess: "Riunione creata con successo.",
    inviteSent: "Riunione creata e invito inviato al paziente via email.",
    inviteSkipped: "Riunione creata, ma l'invito email non e stato inviato.",
    linkCopied: "Link della riunione copiato",
    patientLabel: "Paziente",
    transcriptLabel: "Trascrizione",
    notesLabel: "Note medico",
  },
} as const;

export function MeetDashboard({
  userEmail,
  userRole,
  isAdmin,
  pendingRequestsCount = 0,
  databaseAvailable,
  assignedPatients,
  initialMeetings,
}: MeetDashboardProps) {
  const { lang } = useLanguage();
  const t = copy[lang];

  const [meetings, setMeetings] = useState<MeetItem[]>(initialMeetings);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(assignedPatients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patientsById = useMemo(() => {
    const map = new Map<string, AssignedPatient>();
    for (const patient of assignedPatients) {
      map.set(patient.id, patient);
    }
    return map;
  }, [assignedPatients]);

  function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  }

  function preselectPatient(patientId: string) {
    setSelectedPatientId(patientId);
    if (!title.trim()) {
      const name = patientsById.get(patientId)?.full_name || "Patient";
      setTitle(`Consultation - ${name}`);
    }
  }

  async function handleCreateMeet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPatientId || !title.trim()) return;

    setIsSaving(true);
    setStatus(null);
    setError(null);

    try {
      const createResponse = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          patientId: selectedPatientId,
          transcript: transcript.trim(),
          notes: notes.trim(),
        }),
      });

      const createData = (await createResponse.json()) as {
        id?: string;
        meetingUrl?: string;
        email_sent?: boolean;
        error?: string;
      };

      if (!createResponse.ok || !createData.id || !createData.meetingUrl) {
        setError(createData.error || t.saveError);
        return;
      }

      const patientName = patientsById.get(selectedPatientId)?.full_name || null;
      const createdMeet: MeetItem = {
        id: createData.id,
        title: title.trim(),
        meeting_url: createData.meetingUrl,
        transcript: transcript.trim() || null,
        notes: notes.trim() || null,
        patient_id: selectedPatientId,
        patient_name: patientName,
        created_at: new Date().toISOString(),
      };

      setMeetings((current) => [createdMeet, ...current]);
      setTitle("");
      setTranscript("");
      setNotes("");
      setStatus(createData.email_sent === false ? t.inviteSkipped : t.inviteSent);
    } catch {
      setError(t.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function copyMeetingLink(url: string) {
    await navigator.clipboard.writeText(url);
    setStatus(t.linkCopied);
  }

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
    >
      <main id="main-content" className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="mx-auto w-full max-w-7xl space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{t.title}</p>
            <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{t.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-2xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDatabase}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              <aside className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <UserIcon className="h-4 w-4" /> {t.assignedPatients}
                </h2>
                {assignedPatients.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">{t.noAssignedPatients}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {assignedPatients.map((patient) => (
                      <li key={patient.id} className="rounded-xl border border-border bg-white p-3">
                        <p className="text-sm font-semibold text-foreground">{patient.full_name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">#{patient.id}</p>
                        <button
                          type="button"
                          onClick={() => preselectPatient(patient.id)}
                          className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <PlusIcon className="h-4 w-4" /> {t.quickCreate}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>

              <div className="space-y-6">
                <form onSubmit={handleCreateMeet} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <GlobeIcon className="h-4 w-4" /> {t.createMeet}
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.pickPatient}</span>
                      <select
                        value={selectedPatientId}
                        onChange={(event) => setSelectedPatientId(event.target.value)}
                        className="min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        {assignedPatients.length === 0 ? <option value="">{t.pickPatientPlaceholder}</option> : null}
                        {assignedPatients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.meetTitle}</span>
                      <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder={t.meetTitlePlaceholder}
                        className="min-h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        maxLength={200}
                        required
                      />
                    </label>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <FileTextIcon className="h-4 w-4" /> {t.transcript}
                      </span>
                      <textarea
                        value={transcript}
                        onChange={(event) => setTranscript(event.target.value)}
                        placeholder={t.transcriptPlaceholder}
                        rows={6}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <MailIcon className="h-4 w-4" /> {t.notes}
                      </span>
                      <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder={t.notesPlaceholder}
                        rows={6}
                        maxLength={4000}
                        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <span className="mt-1 block text-xs text-muted-foreground">{t.notesHint}</span>
                    </label>
                  </div>

                  {error ? <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">{error}</p> : null}
                  {status ? <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">{status}</p> : null}

                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving || assignedPatients.length === 0}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                    >
                      <CheckCircleIcon className="h-4 w-4" /> {isSaving ? t.creatingButton : t.createButton}
                    </button>
                  </div>
                </form>

                <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <ClockIcon className="h-4 w-4" /> {t.historyTitle}
                  </h2>

                  {meetings.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">{t.emptyMeetings}</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {meetings.map((meeting) => (
                        <article key={meeting.id} className="rounded-xl border border-border bg-white p-3 sm:p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {t.patientLabel}: {meeting.patient_name || "-"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t.createdAt}: {formatDate(meeting.created_at)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {meeting.patient_id ? (
                                <Link
                                  href={withLangPrefix(`/panel/patients/${meeting.patient_id}/meet/${meeting.id}`, lang)}
                                  className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
                                >
                                  {t.openWorkspace}
                                </Link>
                              ) : null}
                              <a
                                href={toStableMeetingUrl(meeting.meeting_url, meeting.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                {t.openRoom}
                              </a>
                              <button
                                type="button"
                                onClick={() => void copyMeetingLink(toStableMeetingUrl(meeting.meeting_url, meeting.id))}
                                className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
                              >
                                <CopyIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t.transcriptLabel}</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{meeting.transcript?.trim() || "-"}</p>
                            </div>
                            <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{t.notesLabel}</p>
                              <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{meeting.notes?.trim() || "-"}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </section>
      </main>
    </AdminShell>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/ui/icons";
import type {
  FollowupItem,
  PatientItem,
  PatientPriority,
} from "@/lib/types/patient";
import {
  getFollowupState,
  getPriorityMeta,
  getRecommendedFollowupDate,
} from "@/lib/patient-helpers";
import { useLanguage } from "@/lib/i18n/language-context";
import { langToLocale } from "@/lib/i18n/panel-translations";
import { withLangPrefix } from "@/lib/i18n/routing";
import { AdminShell } from "./AdminShell";
import { Container } from "@/components/ui/Container";

interface CalendarDashboardProps {
  initialPatients: PatientItem[];
  userEmail: string;
  userRole?: string;
  isAdmin?: boolean;
  databaseAvailable: boolean;
  pendingRequestsCount?: number;
}

type CalendarViewMode = "month" | "week" | "day";

type CalendarEvent = {
  patient: PatientItem;
  followup: FollowupItem;
};

export function CalendarDashboard({
  initialPatients,
  userEmail,
  userRole,
  isAdmin,
  databaseAvailable,
  pendingRequestsCount = 0,
}: CalendarDashboardProps) {
  const { lang } = useLanguage();
  const locale = langToLocale[lang];
  const t = {
    en: {
      errSelectPatient: "Please select a valid patient.",
      errSchedule: "Failed to schedule follow-up.",
      errSave: "An error occurred while saving follow-up.",
      errUpdate: "Failed to update status.",
      errDelete: "Failed to delete follow-up.",
      scheduleDefault: "Follow-up Consultation",
      eyebrow: "Calendar Schedule",
      title: "Interactive Follow-up Calendar",
      subtitle: "View, manage, and schedule client follow-ups across day, week, and month views.",
      scheduleBtn: "Schedule Follow-up",
      noDb: "Connect MySQL to view and schedule patient follow-ups.",
      prev: "Previous period",
      today: "Today",
      next: "Next period",
      refresh: "Refresh calendar data",
      search: "Search by client name, title, or notes...",
      filter: "Filter",
      allEvents: "All Events",
      scheduled: "Scheduled",
      overdue: "OVERDUE",
      completed: "Completed",
      weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      addOnDate: (date: string) => `Schedule follow-up for ${date}`,
      dayAdd: "Add",
      dayScheduleFor: "Schedule for",
      dayEvents: (count: number) => `${count} follow-up events`,
      addToday: "Add Event for Today",
      noEventsTitle: "No follow-ups scheduled for this date",
      noEventsHint: "Click \"Add Event for Today\" to schedule a check-in.",
      prioritySuffix: "Priority",
      client: "Client",
      profile: "Profile",
      callPatient: "Call patient",
      eventDetails: "Follow-up Event Details",
      clientName: "Client Name",
      eventTitle: "Title / Purpose",
      scheduledDate: "Scheduled Date",
      staffNotes: "Staff Notes",
      call: "Call",
      email: "Email",
      deleteEvent: "Delete Event",
      markPending: "Mark Pending",
      markComplete: "Mark Complete",
      viewProfile: "View Profile",
      scheduleEvent: "Schedule Follow-Up Event",
      selectPatient: "Select Patient / Client",
      choosePatient: "-- Choose a patient --",
      priorityText: "priority",
      followupTitle: "Follow-Up Title / Purpose",
      followupTitlePh: "e.g. Call to review symptom recovery",
      dateLabel: "Scheduled Date",
      notesLabel: "Staff Instructions / Notes",
      notesPh: "Instructions or phone script for staff member...",
      reminder: "Set active notification reminder",
      cancel: "Cancel",
      scheduling: "Scheduling...",
      month: "Month",
      week: "Week",
      day: "Day",
    },
    ro: {
      errSelectPatient: "Te rugam sa selectezi un pacient valid.",
      errSchedule: "Programarea monitorizarii a esuat.",
      errSave: "A aparut o eroare la salvarea monitorizarii.",
      errUpdate: "Actualizarea statusului a esuat.",
      errDelete: "Stergerea monitorizarii a esuat.",
      scheduleDefault: "Consultatie de monitorizare",
      eyebrow: "Program calendar",
      title: "Calendar interactiv de monitorizare",
      subtitle: "Vezi, gestioneaza si programeaza monitorizarile clientilor in vizualizari zi, saptamana si luna.",
      scheduleBtn: "Programeaza monitorizare",
      noDb: "Conecteaza MySQL pentru a vedea si programa monitorizari.",
      prev: "Perioada anterioara",
      today: "Astazi",
      next: "Perioada urmatoare",
      refresh: "Reimprospateaza calendarul",
      search: "Cauta dupa client, titlu sau notite...",
      filter: "Filtru",
      allEvents: "Toate evenimentele",
      scheduled: "Programate",
      overdue: "INTARZIATE",
      completed: "Finalizate",
      weekDays: ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"],
      addOnDate: (date: string) => `Programeaza monitorizare pentru ${date}`,
      dayAdd: "Adauga",
      dayScheduleFor: "Program pentru",
      dayEvents: (count: number) => `${count} evenimente de monitorizare`,
      addToday: "Adauga eveniment pentru astazi",
      noEventsTitle: "Nu exista monitorizari programate pentru aceasta data",
      noEventsHint: "Apasa \"Adauga eveniment pentru astazi\" pentru programare.",
      prioritySuffix: "Prioritate",
      client: "Client",
      profile: "Profil",
      callPatient: "Suna pacientul",
      eventDetails: "Detalii eveniment monitorizare",
      clientName: "Nume client",
      eventTitle: "Titlu / scop",
      scheduledDate: "Data programata",
      staffNotes: "Notite personal",
      call: "Apeleaza",
      email: "Email",
      deleteEvent: "Sterge eveniment",
      markPending: "Marcheaza in asteptare",
      markComplete: "Marcheaza finalizat",
      viewProfile: "Vezi profil",
      scheduleEvent: "Programeaza eveniment",
      selectPatient: "Selecteaza pacient / client",
      choosePatient: "-- Alege un pacient --",
      priorityText: "prioritate",
      followupTitle: "Titlu / scop monitorizare",
      followupTitlePh: "ex. Apel pentru verificarea recuperarii",
      dateLabel: "Data programata",
      notesLabel: "Instructiuni / notite",
      notesPh: "Instructiuni sau script telefonic pentru personal...",
      reminder: "Seteaza notificare activa",
      cancel: "Anuleaza",
      scheduling: "Se programeaza...",
      month: "Luna",
      week: "Saptamana",
      day: "Zi",
    },
    sq: {
      errSelectPatient: "Ju lutem zgjidhni nje pacient te vlefshem.",
      errSchedule: "Planifikimi i ndjekjes deshtoi.",
      errSave: "Ndodhi nje gabim gjate ruajtjes se ndjekjes.",
      errUpdate: "Perditesimi i statusit deshtoi.",
      errDelete: "Fshirja e ndjekjes deshtoi.",
      scheduleDefault: "Konsulte ndjekjeje",
      eyebrow: "Orari i kalendarit",
      title: "Kalendari interaktiv i ndjekjeve",
      subtitle: "Shiko, menaxho dhe planifiko ndjekjet e klienteve ne pamjet ditore, javore dhe mujore.",
      scheduleBtn: "Planifiko ndjekje",
      noDb: "Lidh MySQL per te pare dhe planifikuar ndjekjet.",
      prev: "Periudha e meparshme",
      today: "Sot",
      next: "Periudha tjeter",
      refresh: "Perditeso kalendarin",
      search: "Kerko sipas klientit, titullit ose shenimeve...",
      filter: "Filter",
      allEvents: "Te gjitha ngjarjet",
      scheduled: "Te planifikuara",
      overdue: "VONUAR",
      completed: "Te perfunduara",
      weekDays: ["Hen", "Mar", "Mer", "Enj", "Pre", "Sht", "Die"],
      addOnDate: (date: string) => `Planifiko ndjekje per ${date}`,
      dayAdd: "Shto",
      dayScheduleFor: "Orari per",
      dayEvents: (count: number) => `${count} ngjarje ndjekjeje`,
      addToday: "Shto ngjarje per sot",
      noEventsTitle: "Nuk ka ndjekje te planifikuara per kete date",
      noEventsHint: "Kliko \"Shto ngjarje per sot\" per te planifikuar.",
      prioritySuffix: "Prioritet",
      client: "Klient",
      profile: "Profili",
      callPatient: "Telefono pacientin",
      eventDetails: "Detajet e ngjarjes se ndjekjes",
      clientName: "Emri i klientit",
      eventTitle: "Titulli / qellimi",
      scheduledDate: "Data e planifikuar",
      staffNotes: "Shenime stafi",
      call: "Telefono",
      email: "Email",
      deleteEvent: "Fshij ngjarjen",
      markPending: "Sheno ne pritje",
      markComplete: "Sheno te perfunduar",
      viewProfile: "Shiko profilin",
      scheduleEvent: "Planifiko ngjarje ndjekjeje",
      selectPatient: "Zgjidh pacient / klient",
      choosePatient: "-- Zgjidh pacient --",
      priorityText: "prioritet",
      followupTitle: "Titulli / qellimi i ndjekjes",
      followupTitlePh: "p.sh. Telefonate per kontrollin e rikuperimit",
      dateLabel: "Data e planifikuar",
      notesLabel: "Udhezime / shenime",
      notesPh: "Udhezime ose skript telefoni per stafin...",
      reminder: "Vendos kujtues aktiv",
      cancel: "Anulo",
      scheduling: "Duke planifikuar...",
      month: "Muaj",
      week: "Jave",
      day: "Dite",
    },
    it: {
      errSelectPatient: "Seleziona un paziente valido.",
      errSchedule: "Pianificazione follow-up non riuscita.",
      errSave: "Si e verificato un errore durante il salvataggio del follow-up.",
      errUpdate: "Aggiornamento stato non riuscito.",
      errDelete: "Eliminazione follow-up non riuscita.",
      scheduleDefault: "Consulto di follow-up",
      eyebrow: "Programma calendario",
      title: "Calendario interattivo follow-up",
      subtitle: "Visualizza, gestisci e pianifica i follow-up dei clienti nelle viste giorno, settimana e mese.",
      scheduleBtn: "Pianifica follow-up",
      noDb: "Connetti MySQL per visualizzare e pianificare i follow-up.",
      prev: "Periodo precedente",
      today: "Oggi",
      next: "Periodo successivo",
      refresh: "Aggiorna calendario",
      search: "Cerca per cliente, titolo o note...",
      filter: "Filtro",
      allEvents: "Tutti gli eventi",
      scheduled: "Pianificati",
      overdue: "IN RITARDO",
      completed: "Completati",
      weekDays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
      addOnDate: (date: string) => `Pianifica follow-up per ${date}`,
      dayAdd: "Aggiungi",
      dayScheduleFor: "Programma per",
      dayEvents: (count: number) => `${count} eventi follow-up`,
      addToday: "Aggiungi evento per oggi",
      noEventsTitle: "Nessun follow-up pianificato per questa data",
      noEventsHint: "Clicca \"Aggiungi evento per oggi\" per pianificare.",
      prioritySuffix: "Priorita",
      client: "Cliente",
      profile: "Profilo",
      callPatient: "Chiama paziente",
      eventDetails: "Dettagli evento follow-up",
      clientName: "Nome cliente",
      eventTitle: "Titolo / obiettivo",
      scheduledDate: "Data pianificata",
      staffNotes: "Note staff",
      call: "Chiama",
      email: "Email",
      deleteEvent: "Elimina evento",
      markPending: "Segna in attesa",
      markComplete: "Segna completato",
      viewProfile: "Vedi profilo",
      scheduleEvent: "Pianifica evento follow-up",
      selectPatient: "Seleziona paziente / cliente",
      choosePatient: "-- Scegli un paziente --",
      priorityText: "priorita",
      followupTitle: "Titolo / obiettivo follow-up",
      followupTitlePh: "es. Chiamata per verificare recupero sintomi",
      dateLabel: "Data pianificata",
      notesLabel: "Istruzioni / note staff",
      notesPh: "Istruzioni o script telefonico per l'operatore...",
      reminder: "Imposta promemoria attivo",
      cancel: "Annulla",
      scheduling: "Pianificazione...",
      month: "Mese",
      week: "Settimana",
      day: "Giorno",
    },
  }[lang];
  const [patients, setPatients] = useState<PatientItem[]>(initialPatients);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "scheduled" | "completed" | "overdue"
  >("all");

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [scheduleTitle, setScheduleTitle] = useState<string>("");
  const [scheduleNotes, setScheduleNotes] = useState<string>("");
  const [scheduleReminder, setScheduleReminder] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/patients");
      if (response.ok) {
        const data = (await response.json()) as { patients?: Record<string, unknown>[] };
        if (Array.isArray(data.patients)) {
          const formatted: PatientItem[] = data.patients.map((p) => ({
            id: String(p.id),
            request_id: p.request_id ? String(p.request_id) : null,
            full_name: String(p.full_name || ""),
            phone: String(p.phone || ""),
            email: String(p.email || ""),
            date_of_birth: typeof p.date_of_birth === "string" ? p.date_of_birth : null,
            gender: typeof p.gender === "string" ? p.gender : null,
            address: typeof p.address === "string" ? p.address : null,
            condition_notes: typeof p.condition_notes === "string" ? p.condition_notes : null,
            medical_history: typeof p.medical_history === "string" ? p.medical_history : null,
            treatment_plan: typeof p.treatment_plan === "object" ? (p.treatment_plan as PatientItem["treatment_plan"]) : null,
            followups: Array.isArray(p.followups) ? (p.followups as FollowupItem[]) : [],
            photos: Array.isArray(p.photos) ? (p.photos as PatientItem["photos"]) : [],
            status: (p.status as PatientItem["status"]) || "active",
            priority: (p.priority as PatientPriority) || "moderate",
            created_at: typeof p.created_at === "string" ? p.created_at : new Date().toISOString(),
          }));
          setPatients(formatted);
        }
      }
    } catch (err) {
      console.error("Failed to refresh patients", err);
    } finally {
      setIsRefreshing(false);
    }
  }

  const allEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const patient of patients) {
      if (!patient.followups) continue;
      for (const followup of patient.followups) {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = patient.full_name.toLowerCase().includes(q);
          const titleMatch = followup.title.toLowerCase().includes(q);
          const notesMatch = followup.notes?.toLowerCase().includes(q);
          if (!nameMatch && !titleMatch && !notesMatch) continue;
        }

        const fDateStr = followup.date.slice(0, 10);
        const isOverdue =
          followup.status === "scheduled" && fDateStr < todayStr;

        if (statusFilter === "scheduled" && followup.status !== "scheduled")
          continue;
        if (statusFilter === "completed" && followup.status !== "completed")
          continue;
        if (statusFilter === "overdue" && !isOverdue) continue;

        list.push({ patient, followup });
      }
    }

    return list;
  }, [patients, searchQuery, statusFilter]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of allEvents) {
      const dateKey = ev.followup.date.slice(0, 10);
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(ev);
    }
    return map;
  }, [allEvents]);

  const overdueCount = useMemo(() => {
    let count = 0;
    for (const p of patients) {
      if (getFollowupState(p.followups).state === "overdue") count++;
    }
    return count;
  }, [patients]);

  function handlePrev() {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  }

  function handleNext() {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleOpenScheduleForDate(dateStr: string) {
    setScheduleDate(dateStr);
    setScheduleTitle(t.scheduleDefault);
    setScheduleNotes("");
    setScheduleReminder(true);
    if (patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }
    setShowScheduleModal(true);
  }

  async function handleSaveNewFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatientId || !scheduleTitle.trim() || !scheduleDate.trim()) return;

    setIsSaving(true);
    setErrorMessage(null);

    const targetPatient = patients.find((p) => p.id === selectedPatientId);
    if (!targetPatient) {
      setErrorMessage(t.errSelectPatient);
      setIsSaving(false);
      return;
    }

    const newFollowup: FollowupItem = {
      id: String(Date.now()),
      title: scheduleTitle.trim(),
      date: scheduleDate,
      notes: scheduleNotes.trim() || undefined,
      status: "scheduled",
      reminder_set: scheduleReminder,
    };

    const nextFollowups = [newFollowup, ...(targetPatient.followups || [])];

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetPatient.id,
          followups: nextFollowups,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error || t.errSchedule);
        return;
      }

      setPatients((prev) =>
        prev.map((p) =>
          p.id === targetPatient.id ? { ...p, followups: nextFollowups } : p,
        ),
      );

      setShowScheduleModal(false);
      setScheduleTitle("");
      setScheduleNotes("");
    } catch {
      setErrorMessage(t.errSave);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleCompletion(ev: CalendarEvent) {
    const newStatus: FollowupItem["status"] =
      ev.followup.status === "completed" ? "scheduled" : "completed";
    const nextFollowups = (ev.patient.followups || []).map((f) =>
      f.id === ev.followup.id ? { ...f, status: newStatus } : f,
    );

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ev.patient.id,
          followups: nextFollowups,
        }),
      });

      if (response.ok) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === ev.patient.id ? { ...p, followups: nextFollowups } : p,
          ),
        );
        setSelectedEvent({
          patient: ev.patient,
          followup: { ...ev.followup, status: newStatus },
        });
      }
    } catch {
      setErrorMessage(t.errUpdate);
    }
  }

  async function handleDeleteFollowup(ev: CalendarEvent) {
    const nextFollowups = (ev.patient.followups || []).filter(
      (f) => f.id !== ev.followup.id,
    );

    try {
      const response = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ev.patient.id,
          followups: nextFollowups,
        }),
      });

      if (response.ok) {
        setPatients((prev) =>
          prev.map((p) =>
            p.id === ev.patient.id ? { ...p, followups: nextFollowups } : p,
          ),
        );
        setSelectedEvent(null);
      }
    } catch {
      setErrorMessage(t.errDelete);
    }
  }

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        isCurrentMonth: true,
      });
    }

    const totalSoFar = days.length;
    const remaining = totalSoFar <= 35 ? 35 - totalSoFar : 42 - totalSoFar;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: d.toISOString().slice(0, 10),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    let dayOfWeek = d.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start

    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push({
        date: day,
        dateStr: day.toISOString().slice(0, 10),
      });
    }
    return days;
  }, [currentDate]);

  const calendarTitle = useMemo(() => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString(locale, {
        month: "long",
        year: "numeric",
      });
    } else if (viewMode === "week") {
      const start = weekDays[0].date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
      const end = weekDays[6].date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} - ${end}`;
    } else {
      return currentDate.toLocaleDateString(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }, [currentDate, viewMode, weekDays]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      isAdmin={isAdmin}
      pendingCount={pendingRequestsCount}
      overdueCount={overdueCount}
    >
      <main id="main-content" className="min-h-screen py-8 sm:py-10">
        <Container>
          <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                {t.eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenScheduleForDate(todayStr)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span>{t.scheduleBtn}</span>
              </button>
            </div>
          </div>

          {!databaseAvailable ? (
            <p className="rounded-xl border border-primary/20 bg-primary-soft p-6 text-sm leading-relaxed text-foreground">
              {t.noDb}
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-border bg-background p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="rounded-lg p-1.5 text-foreground hover:bg-muted"
                        title={t.prev}
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToday}
                        className="px-3 py-1 text-xs font-bold text-foreground hover:bg-muted rounded-lg"
                      >
                        {t.today}
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="rounded-lg p-1.5 text-foreground hover:bg-muted"
                        title={t.next}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {calendarTitle}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-xl border border-border bg-background p-1">
                      {(["month", "week", "day"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setViewMode(mode)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                            viewMode === mode
                              ? "bg-primary text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {mode === "month" ? t.month : mode === "week" ? t.week : t.day}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background p-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                      title={t.refresh}
                    >
                      <RefreshIcon
                        className={`h-4 w-4 text-primary ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="relative flex-1 max-w-md">
                    <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.search}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs overflow-x-auto">
                    <span className="text-muted-foreground font-semibold flex items-center gap-1">
                      {t.filter}:
                    </span>
                    {(
                      [
                        { id: "all", label: t.allEvents },
                        { id: "scheduled", label: t.scheduled },
                        { id: "overdue", label: t.overdue },
                        { id: "completed", label: t.completed },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setStatusFilter(f.id)}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors whitespace-nowrap ${
                          statusFilter === f.id
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </div>
              ) : null}

              {viewMode === "month" ? (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="grid grid-cols-7 border-b border-border bg-muted/60 text-center text-xs font-bold uppercase text-muted-foreground py-2.5">
                    {t.weekDays.map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 divide-x divide-y divide-border bg-border">
                    {monthDays.map((cell) => {
                      const dayEvents = eventsByDate.get(cell.dateStr) || [];
                      const isToday = cell.dateStr === todayStr;

                      return (
                        <div
                          key={cell.dateStr}
                          className={`min-h-[110px] bg-card p-2 flex flex-col justify-between group hover:bg-muted/30 transition-colors ${
                            !cell.isCurrentMonth ? "bg-muted/20 opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isToday
                                  ? "bg-primary text-white"
                                  : "text-foreground"
                              }`}
                            >
                              {cell.date.getDate()}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenScheduleForDate(cell.dateStr)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary rounded"
                              title={t.addOnDate(cell.dateStr)}
                            >
                              <PlusIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px]">
                            {dayEvents.map((ev) => {
                              const isOverdue =
                                ev.followup.status === "scheduled" &&
                                cell.dateStr < todayStr;
                              const isDone = ev.followup.status === "completed";

                              return (
                                <button
                                  key={ev.followup.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(ev);
                                  }}
                                  className={`w-full text-left rounded p-1 text-[10px] font-semibold leading-tight truncate transition-colors border ${
                                    isDone
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 line-through"
                                      : isOverdue
                                      ? "bg-red-600 text-white border-red-600 animate-pulse font-bold"
                                      : "bg-primary-soft text-primary border-primary/20 hover:bg-primary/20"
                                  }`}
                                  title={`${ev.patient.full_name}: ${ev.followup.title}`}
                                >
                                  <span className="block truncate font-bold">
                                    {ev.patient.full_name}
                                  </span>
                                  <span className="block truncate opacity-90">
                                    {ev.followup.title}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {viewMode === "week" ? (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="grid grid-cols-7 border-b border-border bg-muted/60 text-center text-xs font-bold text-foreground divide-x divide-border">
                    {weekDays.map((w) => {
                      const isToday = w.dateStr === todayStr;
                      return (
                        <div key={w.dateStr} className="py-3 px-2">
                          <p className="uppercase text-[10px] text-muted-foreground">
                            {w.date.toLocaleDateString(locale, {
                              weekday: "short",
                            })}
                          </p>
                          <p
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full mt-1 text-sm ${
                              isToday
                                ? "bg-primary text-white font-bold"
                                : "font-bold text-foreground"
                            }`}
                          >
                            {w.date.getDate()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-7 divide-x divide-border bg-card min-h-[400px]">
                    {weekDays.map((w) => {
                      const dayEvents = eventsByDate.get(w.dateStr) || [];

                      return (
                        <div
                          key={w.dateStr}
                          className="p-2 flex flex-col justify-between group hover:bg-muted/30 transition-colors"
                        >
                          <div className="space-y-2 flex-1">
                            {dayEvents.map((ev) => {
                              const isOverdue =
                                ev.followup.status === "scheduled" &&
                                w.dateStr < todayStr;
                              const isDone = ev.followup.status === "completed";

                              return (
                                <div
                                  key={ev.followup.id}
                                  onClick={() => setSelectedEvent(ev)}
                                  className={`rounded-xl border p-2.5 text-xs shadow-sm cursor-pointer transition-all ${
                                    isDone
                                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                      : isOverdue
                                      ? "bg-red-600 text-white border-red-600 font-bold"
                                      : "bg-card border-border hover:border-primary"
                                  }`}
                                >
                                  <p className="font-bold truncate">
                                    {ev.patient.full_name}
                                  </p>
                                  <p className="mt-1 font-semibold truncate opacity-90">
                                    {ev.followup.title}
                                  </p>
                                  {ev.followup.notes ? (
                                    <p className="mt-1 text-[11px] opacity-80 line-clamp-2">
                                      {ev.followup.notes}
                                    </p>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenScheduleForDate(w.dateStr)}
                            className="mt-4 w-full py-1.5 rounded-lg border border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-1"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                            <span>{t.dayAdd}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {viewMode === "day" ? (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {t.dayScheduleFor} {currentDate.toLocaleDateString(locale, { dateStyle: "full" })}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.dayEvents(eventsByDate.get(currentDate.toISOString().slice(0, 10))?.length || 0)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenScheduleForDate(
                          currentDate.toISOString().slice(0, 10),
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>{t.addToday}</span>
                    </button>
                  </div>

                  {(() => {
                    const dayKey = currentDate.toISOString().slice(0, 10);
                    const dayEvents = eventsByDate.get(dayKey) || [];

                    if (dayEvents.length === 0) {
                      return (
                        <div className="p-12 text-center text-xs text-muted-foreground">
                          <CalendarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                          <p className="font-semibold text-foreground text-sm">
                            {t.noEventsTitle}
                          </p>
                          <p className="mt-1">
                            {t.noEventsHint}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {dayEvents.map((ev) => {
                          const pMeta = getPriorityMeta(ev.patient.priority);
                          const isDone = ev.followup.status === "completed";

                          return (
                            <div
                              key={ev.followup.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCompletion(ev)}
                                  className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                    isDone
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-border hover:border-primary"
                                  }`}
                                >
                                  {isDone ? (
                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                  ) : null}
                                </button>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-foreground text-sm">
                                      {ev.followup.title}
                                    </span>
                                    <span
                                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pMeta.badgeClass}`}
                                    >
                                      {pMeta.shortLabel} {t.prioritySuffix}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-primary mt-1">
                                    {t.client}: {ev.patient.full_name} &bull; {ev.patient.phone}
                                  </p>
                                  {ev.followup.notes ? (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {ev.followup.notes}
                                    </p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <Link
                                  href={withLangPrefix(`/panel/patients/${ev.patient.id}`, lang)}
                                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
                                >
                                  {t.profile}
                                </Link>
                                <a
                                  href={`tel:${ev.patient.phone}`}
                                  className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title={t.callPatient}
                                >
                                  <PhoneIcon className="h-4 w-4" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </main>

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {t.eventDetails}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-muted/40 p-4 space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {t.clientName}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {selectedEvent.patient.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {t.eventTitle}
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {selectedEvent.followup.title}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {t.scheduledDate}
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {selectedEvent.followup.date}
                  </p>
                </div>
                {selectedEvent.followup.notes ? (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {t.staffNotes}
                    </p>
                    <p className="text-xs text-foreground whitespace-pre-wrap">
                      {selectedEvent.followup.notes}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${selectedEvent.patient.phone}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{t.call} {selectedEvent.patient.phone}</span>
                </a>
                <a
                  href={`mailto:${selectedEvent.patient.email}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <MailIcon className="h-3.5 w-3.5 text-primary" />
                  <span>{t.email}</span>
                </a>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteFollowup(selectedEvent)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded px-2 py-1"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                  <span>{t.deleteEvent}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleCompletion(selectedEvent)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-xs ${
                      selectedEvent.followup.status === "completed"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <CheckCircleIcon className="h-3.5 w-3.5" />
                    <span>
                      {selectedEvent.followup.status === "completed"
                        ? t.markPending
                        : t.markComplete}
                    </span>
                  </button>
                  <Link
                    href={withLangPrefix(`/panel/patients/${selectedEvent.patient.id}`, lang)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover"
                  >
                    {t.viewProfile}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showScheduleModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  {t.scheduleEvent}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewFollowup} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  {t.selectPatient} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const p = patients.find((item) => item.id === e.target.value);
                    if (p) {
                      setScheduleDate(getRecommendedFollowupDate(p.priority));
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t.choosePatient}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.phone}) - {p.priority.toUpperCase()} {t.priorityText}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  {t.followupTitle} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder={t.followupTitlePh}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  {t.dateLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={3}
                  value={scheduleNotes}
                  onChange={(e) => setScheduleNotes(e.target.value)}
                  placeholder={t.notesPh}
                  className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <label className="inline-flex items-center gap-2 font-medium text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduleReminder}
                  onChange={(e) => setScheduleReminder(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>{t.reminder}</span>
              </label>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
                >
                  {isSaving ? t.scheduling : t.scheduleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}

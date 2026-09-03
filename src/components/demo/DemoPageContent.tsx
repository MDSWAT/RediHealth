"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { StethoscopeIcon, FileTextIcon, UsersIcon, ClockIcon, CalendarIcon, CheckCircleIcon } from "@/components/ui/icons";

const userMessageDelay = 0.3;
const typingStartDelay = userMessageDelay + 0.5;
const typingDurationSeconds = 1.3;
const replyDelay = typingStartDelay + typingDurationSeconds + 0.15;

const decodedLines = [
  { label: "Medication", value: "Amoxicillin 500mg" },
  { label: "Dosage", value: "1 capsule, 3x per day" },
  { label: "Duration", value: "7 days" },
  { label: "Notes", value: "Take with food" },
];
const decodedLineStepSeconds = 0.25;

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative aspect-[9/19] w-full max-w-[15rem] overflow-hidden rounded-[3rem] border-[10px] border-foreground/90 bg-foreground/90 shadow-2xl [-webkit-mask-image:-webkit-radial-gradient(white,black)] sm:max-w-[18rem]">
      <div className="absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-foreground/90" />
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] bg-card [-webkit-mask-image:-webkit-radial-gradient(white,black)]">
        {children}
      </div>
    </div>
  );
}

function PhoneHeader({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-3 pb-3 pt-8">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold leading-tight text-foreground">{title}</p>
          <p className="text-[0.65rem] leading-tight text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
    </div>
  );
}

function PhoneInputBar({ placeholder }: { placeholder: string }) {
  return (
    <div className="border-t border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2">
        <span className="flex-1 truncate text-[0.65rem] text-muted-foreground">{placeholder}</span>
        <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function AssistantPhoneShowcase() {
  return (
    <PhoneFrame>
      <PhoneHeader icon={<StethoscopeIcon className="h-4 w-4" />} title="RediHealth assistant" subtitle="Available" />

      <div className="flex flex-1 flex-col gap-2 overflow-hidden bg-muted/30 px-3 py-4">
        <div
          className="hero-chat-message ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-foreground px-3 py-2 text-xs text-white shadow-sm"
          style={{ animationDelay: `${userMessageDelay}s` }}
        >
          I have a headache and mild fever since yesterday.
        </div>

        <div className="grid">
          <div
            className="hero-typing-bubble col-start-1 row-start-1 flex w-12 items-center gap-1 rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 shadow-sm"
            style={{ "--hero-anim-duration": `${typingDurationSeconds}s`, "--hero-anim-delay": `${typingStartDelay}s` } as CSSProperties}
          >
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
          </div>
          <div
            className="hero-chat-message col-start-1 row-start-1 max-w-[90%] rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 text-xs leading-relaxed text-foreground shadow-sm"
            style={{ animationDelay: `${replyDelay}s` }}
          >
            <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-border/70 pb-2">
              <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">Assessment</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-950">Routine care</span>
            </div>
            <p className="font-medium text-foreground">Possible cause: common viral infection</p>
            <p className="mt-1">Rest, fluids, and monitor your temperature. Seek care if symptoms worsen.</p>
          </div>
        </div>
      </div>

      <PhoneInputBar placeholder="Describe your symptoms..." />
    </PhoneFrame>
  );
}

function HandwrittenPrescriptionPhoto() {
  return (
    <svg viewBox="0 0 160 110" className="block h-auto w-full" role="img" aria-label="Photo of a handwritten prescription">
      <rect width="160" height="110" fill="#f6f1e3" />
      <text x="10" y="22" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic" fill="#a8332c">Rx</text>
      <path d="M14 36 Q 30 28 46 36 T 78 34 T 110 38 T 142 32" stroke="#2b3a52" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M14 50 Q 26 44 40 50 T 70 48 T 100 52 T 130 46 T 150 50" stroke="#2b3a52" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M14 64 Q 24 58 36 64 T 60 62 T 88 66 T 116 60" stroke="#2b3a52" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M14 78 Q 30 72 50 78 T 90 76 T 130 80" stroke="#2b3a52" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M14 92 Q 22 88 34 92 T 56 90 T 84 94" stroke="#2b3a52" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function PrescriptionPhoneShowcase() {
  return (
    <PhoneFrame>
      <PhoneHeader icon={<FileTextIcon className="h-4 w-4" />} title="Prescription review" subtitle="Available" />

      <div className="flex flex-1 flex-col gap-2 overflow-hidden bg-muted/30 px-3 py-4">
        <div
          className="hero-chat-message ml-auto w-28 overflow-hidden rounded-lg rounded-tr-none shadow-sm"
          style={{ animationDelay: `${userMessageDelay}s` }}
        >
          <HandwrittenPrescriptionPhoto />
        </div>

        <div className="grid">
          <div
            className="hero-typing-bubble col-start-1 row-start-1 flex w-12 items-center gap-1 rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 shadow-sm"
            style={{ "--hero-anim-duration": `${typingDurationSeconds}s`, "--hero-anim-delay": `${typingStartDelay}s` } as CSSProperties}
          >
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
            <span className="hero-typing-dot h-1.5 w-1.5 rounded-full bg-current text-primary" />
          </div>
          <div
            className="hero-chat-message col-start-1 row-start-1 max-w-[90%] rounded-lg rounded-tl-none bg-primary-soft px-3 py-2 text-xs leading-relaxed text-foreground shadow-sm"
            style={{ animationDelay: `${replyDelay}s` }}
          >
            <p className="mb-2 border-b border-border/70 pb-2 font-medium text-foreground">Here&apos;s what I read from the photo:</p>
            <div className="space-y-1">
              {decodedLines.map((line, index) => (
                <p
                  key={line.label}
                  className="demo-decoded-line"
                  style={{ animationDelay: `${replyDelay + 0.3 + index * decodedLineStepSeconds}s` }}
                >
                  <span className="font-semibold">{line.label}: </span>
                  {line.value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <PhoneInputBar placeholder="Upload prescription photo..." />
    </PhoneFrame>
  );
}

type TabKey = "requests" | "patients" | "workers" | "followups" | "calendar" | "mediator";

const workspaceNavItems: { key: TabKey; label: string; icon: typeof FileTextIcon }[] = [
  { key: "requests", label: "Requests", icon: FileTextIcon },
  { key: "patients", label: "Patients", icon: UsersIcon },
  { key: "workers", label: "Workers", icon: StethoscopeIcon },
  { key: "followups", label: "Follow-ups", icon: ClockIcon },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
  { key: "mediator", label: "New mediator case", icon: FileTextIcon },
];

const demoCounties = ["Cluj", "Bucuresti", "Iasi", "Timis", "Constanta", "Brasov"];
const demoCategories = ["General practitioner registration", "Dental care", "Vaccination", "Specialist consultation", "Maternal care", "Mental health support", "Other"];
const demoBarriers = ["No GP / family doctor", "No insurance / unclear entitlement", "Missing documents", "Language barrier", "Transport problem", "Financial barrier", "Unstable housing", "Other"];

type DemoRequestStatus = "pending" | "in_progress" | "resolved";

const requestStatusOrder: DemoRequestStatus[] = ["pending", "in_progress", "resolved"];
const requestStatusLabels: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  resolved: "Resolved",
};
const requestStatusStyles: Record<DemoRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-emerald-100 text-emerald-950",
};

const initialDemoRequests: { id: string; name: string; phone: string; description: string; status: DemoRequestStatus; urgent: boolean }[] = [
  { id: "r1", name: "Alexandra Neagu", phone: "+40 727 666 777", description: "Persistent cough and mild fever for three days.", status: "pending", urgent: false },
  { id: "r2", name: "Bogdan Ilie", phone: "+40 728 777 888", description: "Sharp chest pain that started this morning.", status: "pending", urgent: true },
  { id: "r3", name: "Cristina Voicu", phone: "+40 729 888 999", description: "Needs help finding a specialist for mobility issues.", status: "in_progress", urgent: false },
  { id: "r4", name: "Doru Anghel", phone: "+40 730 999 000", description: "Follow-up on a recent prescription renewal.", status: "resolved", urgent: false },
];

function DemoRequestsTab() {
  const [requests, setRequests] = useState(initialDemoRequests);

  function cycleStatus(id: string) {
    setRequests((current) =>
      current.map((request) => {
        if (request.id !== id) return request;
        const nextIndex = (requestStatusOrder.indexOf(request.status) + 1) % requestStatusOrder.length;
        return { ...request, status: requestStatusOrder[nextIndex] };
      }),
    );
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => (
        <div key={request.id} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {request.name}
                {request.urgent ? <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-red-700">Urgent</span> : null}
              </p>
              <p className="text-[0.65rem] text-muted-foreground">{request.phone}</p>
              <p className="mt-1 text-xs text-foreground">{request.description}</p>
            </div>
            <button
              type="button"
              onClick={() => cycleStatus(request.id)}
              className={`flex-none rounded-full px-2.5 py-1 text-[0.65rem] font-semibold transition-colors ${requestStatusStyles[request.status]}`}
              title="Click to update status (demo only)"
            >
              {requestStatusLabels[request.status]}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type DemoPriority = "critical" | "high" | "moderate" | "low";
const priorityStyles: Record<DemoPriority, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  moderate: "bg-blue-100 text-blue-800",
  low: "bg-slate-100 text-slate-700",
};

const demoPatients: { id: string; name: string; condition: string; priority: DemoPriority; worker: string }[] = [
  { id: "p1", name: "Vasile Constantin", condition: "Type 2 diabetes, hypertension. Monitor blood sugar daily, low-carb diet.", priority: "high", worker: "Mihai Popescu" },
  { id: "p2", name: "Elena Marinescu", condition: "Post-surgery recovery, mobility limited. Physical therapy 3x/week.", priority: "moderate", worker: "Mihai Popescu" },
  { id: "p3", name: "Gheorghe Radu", condition: "Congestive heart failure. Weigh daily, low-sodium diet.", priority: "critical", worker: "Ana Ionescu" },
  { id: "p4", name: "Ioana Stanciu", condition: "Seasonal allergies, otherwise healthy.", priority: "low", worker: "Unassigned" },
];

function DemoPatientsTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {demoPatients.map((patient) => {
        const expanded = expandedId === patient.id;
        return (
          <div key={patient.id} className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : patient.id)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{patient.name}</p>
                <p className="truncate text-[0.65rem] text-muted-foreground">Assigned to {patient.worker}</p>
              </div>
              <span className={`flex-none rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${priorityStyles[patient.priority]}`}>
                {patient.priority}
              </span>
            </button>
            {expanded ? (
              <div className="border-t border-border px-3 py-2 text-xs text-foreground">{patient.condition}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

const demoWorkers = [
  { name: "Demo Administrator", role: "Administrator", department: "Administration", patients: 2 },
  { name: "Mihai Popescu", role: "Healthcare Worker", department: "Community Care", patients: 2 },
  { name: "Ana Ionescu", role: "Mediator", department: "Social Support", patients: 1 },
];

function DemoWorkersTab() {
  return (
    <div className="space-y-2">
      {demoWorkers.map((worker) => (
        <div key={worker.name} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{worker.name}</p>
            <p className="truncate text-[0.65rem] text-muted-foreground">{worker.role} · {worker.department}</p>
          </div>
          <span className="flex-none rounded-full bg-primary-soft px-2.5 py-1 text-[0.65rem] font-semibold text-primary">
            {worker.patients} patient{worker.patients === 1 ? "" : "s"}
          </span>
        </div>
      ))}
    </div>
  );
}

const initialDemoFollowups = [
  { id: "f1", patient: "Vasile Constantin", title: "Blood sugar check-up", date: "In 3 days", overdue: false, done: false },
  { id: "f2", patient: "Elena Marinescu", title: "Physical therapy review", date: "Tomorrow", overdue: false, done: false },
  { id: "f3", patient: "Gheorghe Radu", title: "Cardiology check-up", date: "2 days overdue", overdue: true, done: false },
];

function DemoFollowupsTab() {
  const [followups, setFollowups] = useState(initialDemoFollowups);

  function toggleDone(id: string) {
    setFollowups((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  return (
    <div className="space-y-2">
      {followups.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <div className="min-w-0">
            <p className={`truncate text-xs font-semibold ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.title}</p>
            <p className="truncate text-[0.65rem] text-muted-foreground">
              {item.patient} · <span className={item.overdue && !item.done ? "font-semibold text-red-600" : ""}>{item.date}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleDone(item.id)}
            className={`flex-none rounded-full px-2.5 py-1 text-[0.65rem] font-semibold transition-colors ${
              item.done ? "bg-emerald-100 text-emerald-950" : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {item.done ? "Completed" : "Mark done"}
          </button>
        </div>
      ))}
    </div>
  );
}

const demoCalendarDays = [
  { label: "Mon", date: 1, followups: [] as string[] },
  { label: "Tue", date: 2, followups: ["Physical therapy review — Elena Marinescu"] },
  { label: "Wed", date: 3, followups: [] },
  { label: "Thu", date: 4, followups: ["Blood sugar check-up — Vasile Constantin"] },
  { label: "Fri", date: 5, followups: [] },
  { label: "Sat", date: 6, followups: [] },
  { label: "Sun", date: 7, followups: ["Cardiology check-up — Gheorghe Radu"] },
];

function DemoCalendarTab() {
  const [selectedDate, setSelectedDate] = useState(2);
  const selectedDay = demoCalendarDays.find((day) => day.date === selectedDate) ?? demoCalendarDays[0];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {demoCalendarDays.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setSelectedDate(day.date)}
            className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[0.65rem] font-semibold transition-colors ${
              day.date === selectedDate ? "bg-primary text-white" : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>{day.label}</span>
            <span>{day.date}</span>
            {day.followups.length > 0 ? (
              <span className={`h-1.5 w-1.5 rounded-full ${day.date === selectedDate ? "bg-white" : "bg-primary"}`} />
            ) : (
              <span className="h-1.5 w-1.5" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-border bg-card p-3">
        {selectedDay.followups.length > 0 ? (
          <ul className="space-y-1.5">
            {selectedDay.followups.map((followup) => (
              <li key={followup} className="text-xs text-foreground">{followup}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No follow-ups scheduled for this day.</p>
        )}
      </div>
    </div>
  );
}

function DemoMediatorForm() {
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleBarrier(barrier: string) {
    setSaved(false);
    setSelectedBarriers((current) =>
      current.includes(barrier) ? current.filter((item) => item !== barrier) : [...current, barrier],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setSaved(false);

    // Demo only: nothing is sent to a server or stored anywhere.
    setTimeout(() => {
      formElement.reset();
      setSelectedBarriers([]);
      setIsSubmitting(false);
      setSaved(true);
    }, 500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {saved ? (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-700" role="status">
          <CheckCircleIcon className="h-4 w-4 flex-none" />
          Case saved (demo only — nothing was actually submitted).
        </p>
      ) : null}

      <section className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 sm:p-4">
        <label className="text-xs font-semibold text-foreground">
          County
          <select name="county" defaultValue="" className="mt-1.5 block h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-normal text-foreground">
            <option value="" disabled>Select a county</option>
            {demoCounties.map((county) => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-foreground">
          Full name
          <input name="fullName" maxLength={200} placeholder="e.g. Elena Radu" className="mt-1.5 block h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-normal text-foreground" />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Care category
          <select name="careCategory" defaultValue="" className="mt-1.5 block h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-normal text-foreground">
            <option value="" disabled>Select a category</option>
            {demoCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-semibold text-foreground">
          Urgency
          <select name="urgency" defaultValue="moderate" className="mt-1.5 block h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-normal text-foreground">
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
      </section>

      <fieldset className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <legend className="px-1 text-xs font-semibold text-foreground">Barriers identified</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {demoBarriers.map((barrier) => (
            <label key={barrier} className="flex items-start gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={selectedBarriers.includes(barrier)}
                onChange={() => toggleBarrier(barrier)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
              />
              {barrier}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block rounded-lg border border-border bg-card p-3 text-xs font-semibold text-foreground sm:p-4">
        Notes
        <textarea name="notes" rows={2} maxLength={4000} placeholder="Add relevant context, requested support, or follow-up details." className="mt-1.5 block w-full rounded-lg border border-border bg-background p-2 text-xs font-normal text-foreground" />
      </label>

      <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 sm:w-auto">
        {isSubmitting ? "Saving case..." : "Save case"}
      </button>
    </form>
  );
}

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-[0.65rem] text-muted-foreground">
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

const tabContent: Record<TabKey, { eyebrow: string; title: string; description: string; render: () => ReactNode }> = {
  requests: {
    eyebrow: "Requests",
    title: "Medical help requests",
    description: "Click a status pill to see it update instantly — nothing here is sent anywhere.",
    render: () => <DemoRequestsTab />,
  },
  patients: {
    eyebrow: "Patients",
    title: "Patient roster",
    description: "Click a patient to expand their condition notes and care plan.",
    render: () => <DemoPatientsTab />,
  },
  workers: {
    eyebrow: "Staff Management",
    title: "Workers",
    description: "Healthcare workers and mediators, with their current patient load.",
    render: () => <DemoWorkersTab />,
  },
  followups: {
    eyebrow: "Follow-ups Queue",
    title: "Upcoming follow-ups",
    description: "Mark a follow-up done and watch it update in real time (demo only).",
    render: () => <DemoFollowupsTab />,
  },
  calendar: {
    eyebrow: "Calendar Schedule",
    title: "This week",
    description: "Pick a day to see the follow-ups scheduled for it.",
    render: () => <DemoCalendarTab />,
  },
  mediator: {
    eyebrow: "Mediator workspace",
    title: "New support case",
    description: "This is a live form for demo purposes — it is not connected to a database.",
    render: () => <DemoMediatorForm />,
  },
};

function PanelWorkspaceShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>("requests");
  const content = tabContent[activeTab];

  return (
    <BrowserFrame url={`redihealth.org/panel${activeTab === "requests" ? "" : `/${activeTab === "mediator" ? "mediator" : activeTab}`}`}>
      <div className="flex h-[34rem]">
        <div className="hidden w-40 flex-none flex-col border-r border-border bg-card px-2 py-4 sm:flex">
          <ul className="space-y-1">
            {workspaceNavItems.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[0.7rem] font-semibold transition-colors ${
                    item.key === activeTab ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile tab switcher, shown when the sidebar is hidden below sm. */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 sm:hidden">
            {workspaceNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`flex-none rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${
                  item.key === activeTab ? "bg-primary-soft text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-muted/30 px-4 py-4 sm:px-6 sm:py-5">
            <p className="text-[0.65rem] font-bold uppercase text-primary">{content.eyebrow}</p>
            <h3 className="mt-0.5 text-base font-bold text-foreground sm:text-lg">{content.title}</h3>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">{content.description}</p>

            <div className="mt-3">{content.render()}</div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

export function DemoPageContent() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/40">
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            See RediHealth in action
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Live-style previews: the AI health assistant answering a question, the prescription decipher turning a
            photo into clear instructions, and the mediator workspace used by our staff panel.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-8">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">AI Agent</h2>
            <AssistantPhoneShowcase />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Prescription Decipher</h2>
            <PrescriptionPhoneShowcase />
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-4xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Staff Panel (Live Preview)
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted-foreground">
            Click around the sidebar below — requests, patients, workers, follow-ups, and calendar all respond
            instantly. It&apos;s a self-contained preview, so nothing you do here is saved anywhere.
          </p>
          <div className="mt-4">
            <PanelWorkspaceShowcase />
          </div>
        </div>
      </Container>
    </section>
  );
}


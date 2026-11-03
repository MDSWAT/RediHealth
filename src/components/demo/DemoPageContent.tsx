"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { CalendarDashboard } from "@/components/panel/CalendarDashboard";
import { MeetDashboard } from "@/components/panel/MeetDashboard";
import { FollowupMeetingWorkspace } from "@/components/panel/FollowupMeetingWorkspace";
import { AdminShell, PersistentPanelShell } from "@/components/panel/AdminShell";
import { PanelRuntimeProvider } from "@/components/panel/PanelRuntime";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { createDemoData, DEMO_STORAGE_KEY, DEMO_WORKERS, DemoPanelStore, demoInbox, parseDemoData, type DemoRole } from "@/lib/demo-panel";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";

const DemoScreenContext = createContext<ReactNode>(null);

export function DemoPanelScreen() {
  return useContext(DemoScreenContext);
}

export function DemoPageContent({ children }: { children: ReactNode }) {
  const { lang } = useLanguage();
  const t = demoPanelTranslations[lang];
  const pathname = usePathname();
  const router = useRouter();
  const [store, setStore] = useState<DemoPanelStore | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
    if (cancelled) return;
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      const data = raw ? parseDemoData(raw) : createDemoData();
      if (!raw) localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
      setStore(new DemoPanelStore(data, (next) => {
        try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)); }
        catch (cause) { console.error("Demo browser storage failed", cause); throw new Error(t.storageError); }
      }));
    } catch (cause) {
      console.error("Could not load demo browser storage", cause);
      setError(t.storageError);
    }
    setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [t.storageError]);

  function reset() {
    if (!window.confirm(t.resetConfirm)) return;
    try {
      const data = createDemoData();
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
      setStore(new DemoPanelStore(data, (next) => {
        try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)); }
        catch (cause) { console.error("Demo browser storage failed", cause); throw new Error(t.storageError); }
      }));
      setError(""); setRevision((value) => value + 1);
      router.push(withLangPrefix("/demo", lang));
    } catch (cause) { console.error("Could not reset demo", cause); setError(t.storageError); }
  }

  function changeRole(role: DemoRole) {
    if (!store) return;
    try {
      store.commit({ ...store.data, role });
      setRevision((value) => value + 1);
      router.push(withLangPrefix("/demo", lang));
    } catch (cause) { console.error("Could not change demo role", cause); setError(t.storageError); }
  }

  const runtime = useMemo(() => store ? {
    request: store.request, demo: true,
    navigate: (href: string, replace = false) => replace ? router.replace(href) : router.push(href),
  } : null, [store, router]);

  const toolbar = <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-bold">{t.title}</p><p className="max-w-3xl text-xs leading-relaxed">{t.notice}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold">{t.role}
          <select className="ml-2 min-h-10 rounded-lg border border-amber-300 bg-white px-3 text-sm" value={store?.data.role || "mediator"} disabled={!store}
            onChange={(event) => changeRole(event.target.value === "doctor" ? "doctor" : "mediator")}>
            <option value="mediator">{t.mediator}</option><option value="doctor">{t.doctor}</option>
          </select>
        </label>
        <button type="button" onClick={reset} className="min-h-10 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold">{t.reset}</button>
        <Link href={withLangPrefix("/", lang)} className="min-h-10 rounded-lg px-3 py-3 text-xs font-semibold underline">{t.exit}</Link>
      </div>
    </div>
    {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
  </div>;
  if (!loaded || !store || !runtime) return <>{toolbar}<p role="status" className="p-6">{loaded ? t.resetToContinue : t.loading}</p></>;

  const data = store.data;
  const role = data.role;
  const worker = DEMO_WORKERS[role === "mediator" ? 0 : 1];
  const props = { userEmail: worker.email, userRole: worker.role, isAdmin: false, databaseAvailable: true };
  const patients = data.patients.filter((p) => p.assigned_worker_ids?.includes(worker.id));
  const pendingRequestsCount = data.requests.filter((r) => r.status === "pending").length;
  const path = stripLangFromPathname(pathname).slice("/demo".length) || "/";
  const patientMatch = /^\/patients\/(\d+)$/.exec(path);
  const meetingMatch = /^\/patients\/(\d+)\/meet\/(\d+)$/.exec(path);
  let content;
  if (path === "/") content = <WorkerDashboard {...props} initialInbox={demoInbox(data)} isRomania />;
  else if (path === "/patients") content = <PatientsDashboard {...props} initialPatients={patients} pendingRequestsCount={pendingRequestsCount} isRomania />;
  else if (patientMatch && patients.find((p) => p.id === patientMatch[1])) content = <AdminShell {...props} pendingCount={pendingRequestsCount} mobilePatientCreation={{ isRomania: true }}><main id="main-content" className="crm-page"><PatientProfileView initialPatient={patients.find((p) => p.id === patientMatch[1])!} isRomania /></main></AdminShell>;
  else if (path === "/calendar" && role === "doctor") content = <CalendarDashboard {...props} initialPatients={patients} pendingRequestsCount={pendingRequestsCount} />;
  else if (path === "/meet" && role === "doctor") content = <MeetDashboard {...props} assignedPatients={patients} pendingRequestsCount={pendingRequestsCount} initialMeetings={data.meetings.filter((m) => patients.some((p) => p.id === m.patient_id))} />;
  else if (meetingMatch && data.meetings.some((m) => m.id === meetingMatch[2] && m.patient_id === meetingMatch[1] && patients.some((p) => p.id === m.patient_id))) content = <FollowupMeetingWorkspace {...props} meetingId={meetingMatch[2]} patientId={meetingMatch[1]} />;
  else content = <AdminShell {...props}><main id="main-content" className="crm-page"><p role="alert">{t.notFound}</p><Link href={withLangPrefix("/demo", lang)} className="crm-button mt-4">{t.back}</Link></main></AdminShell>;

  return <PanelRuntimeProvider value={runtime}>{toolbar}<div onClickCapture={(event) => {
    const target = event.target;
    if (target instanceof Element) {
      const anchor = target.closest("a");
      if (anchor && /^(tel:|mailto:)/.test(anchor.getAttribute("href") || "")) {
        event.preventDefault();
        window.alert(t.notice);
      }
    }
  }}><PersistentPanelShell {...props}>
    <DemoScreenContext.Provider value={<div key={`${pathname}:${revision}`}>{content}</div>}>
      {children}
    </DemoScreenContext.Provider>
  </PersistentPanelShell></div></PanelRuntimeProvider>;
}

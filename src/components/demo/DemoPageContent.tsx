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
import PanelLoading from "@/components/panel/PanelLoading";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { createDemoData, DEMO_STORAGE_KEY, DEMO_WORKERS, DemoPanelStore, demoInbox, parseDemoData, type DemoRole } from "@/lib/demo-panel";
import { demoPanelTranslations } from "@/lib/i18n/demo-panel-translations";
import { PatientPortalView } from "@/components/portal/PatientPortalView";

const DemoScreenContext = createContext<ReactNode>(null);

/**
 * The sample records live in English in browser storage. Show them in the reader's language:
 * replace exact matches of known sample strings (and demo-store messages), leave anything the
 * visitor typed untouched. Keys such as status or gender are never sample text, so values match exactly.
 */
function localizeDemo<T>(value: T, seed: Record<string, string>): T {
  if (typeof value === "string") return (seed[value] ?? value) as T;
  if (Array.isArray(value)) return value.map((item) => localizeDemo(item, seed)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeDemo(item, seed)])) as T;
  }
  return value;
}

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

  const seed = t.seed;
  const runtime = useMemo(() => {
    if (!store) return null;
    const request: typeof fetch = async (input, init) => {
      const response = await store.request(input, init);
      if (!Object.keys(seed).length || !response.headers.get("content-type")?.includes("json")) return response;
      return Response.json(localizeDemo(await response.json(), seed), { status: response.status });
    };
    // The demo mediator has no calendar or meetings screen, so the menu does not offer them (read at call time: the role changes in place).
    const canOpen = (href: string) => store.data.role === "doctor" || !["/panel/calendar", "/panel/meet"].includes(href);
    return { request, demo: true, canOpen, navigate: (href: string, replace = false) => replace ? router.replace(href) : router.push(href) };
  }, [store, router, seed]);

  const toolbar = <div className="border-b border-amber-care-border bg-amber-care-soft px-4 py-3 text-foreground dark:border-amber-care/40 dark:bg-amber-care/15 dark:text-paper">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
      <div><p className="text-body font-bold">{t.title}</p><p className="max-w-3xl text-meta">{t.notice}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-body font-semibold">{t.role}
          <select className="ml-2 min-h-10 rounded-lg border border-amber-care-border bg-card px-3 text-body text-foreground dark:border-amber-care/50 dark:bg-ink-900 dark:text-paper" value={store?.data.role || "mediator"} disabled={!store}
            onChange={(event) => changeRole(event.target.value === "doctor" ? "doctor" : "mediator")}>
            <option value="mediator">{t.mediator}</option><option value="doctor">{t.doctor}</option>
          </select>
        </label>
        <button type="button" onClick={reset} className="min-h-11 whitespace-nowrap rounded-lg border border-amber-care-border bg-card px-3 text-body font-semibold text-foreground dark:border-amber-care/50 dark:bg-ink-900 dark:text-paper">{t.reset}</button>
        <Link href={withLangPrefix("/", lang)} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2 text-body font-semibold underline underline-offset-2">{t.exit}</Link>
      </div>
    </div>
    {error && <p role="alert" className="mt-2 text-body font-semibold text-primary dark:text-ruby-300">{error}</p>}
  </div>;
  if (!loaded) return <>{toolbar}<PanelLoading /></>;
  if (!store || !runtime) return <>{toolbar}<p role="status" className="p-6">{t.resetToContinue}</p></>;

  const data = localizeDemo(store.data, seed);
  const role = data.role;
  const worker = DEMO_WORKERS[role === "mediator" ? 0 : 1];
  const props = { userEmail: worker.email, userRole: worker.role, isAdmin: false, databaseAvailable: true };
  const patients = data.patients.filter((p) => p.assigned_worker_ids?.includes(worker.id));
  // Same set as the inbox's first folder, so the menu badge and "Needs attention" agree.
  const pendingRequestsCount = data.requests.filter((r) => r.status === "pending" || r.status === "in_progress").length;
  const path = stripLangFromPathname(pathname).slice("/demo".length) || "/";
  // The patient cabinet demo uses local view state. Production portal writes still require its token and captcha.
  if (path === "/cabinet" && data.patients[0]) return <>{toolbar}<DemoScreenContext.Provider value={<PatientPortalView initialPatient={data.patients[0]} token="" country="RO" onPatch={async () => undefined} />}>{children}</DemoScreenContext.Provider></>;
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

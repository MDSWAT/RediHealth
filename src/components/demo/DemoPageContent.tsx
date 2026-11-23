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

  const toolbar = (
    <div className="border-b border-amber-200/90 bg-amber-50/90 px-4 py-2.5 text-ink-950 dark:border-amber-400/25 dark:bg-[#1e1b13] dark:text-[#f8f3e6]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="min-w-0 max-w-3xl text-xs leading-snug text-ink-950/85 dark:text-[#e6dcc6] sm:text-[13px]">
          <strong className="font-semibold text-ink-950 dark:text-[#f8f3e6]">{t.title}.</strong>{" "}
          {t.notice}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink-950 dark:text-[#f8f3e6] sm:text-[13px]">
            <span className="whitespace-nowrap">{t.role}</span>
            <select
              className="min-h-11 whitespace-nowrap rounded-lg border border-[#b59f6e] bg-white px-2.5 text-[13px] font-medium text-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-[#5b4d31] dark:bg-[#141a24] dark:text-[#f4f6f8]"
              value={store?.data.role || "mediator"}
              disabled={!store}
              onChange={(event) => changeRole(event.target.value === "doctor" ? "doctor" : "mediator")}
            >
              <option value="mediator">{t.mediator}</option>
              <option value="doctor">{t.doctor}</option>
            </select>
          </label>
          <button
            type="button"
            onClick={reset}
            className="min-h-11 whitespace-nowrap rounded-lg border border-[#b59f6e] bg-white px-3 text-[13px] font-semibold text-ink-950 transition-colors hover:bg-amber-100/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:border-[#5b4d31] dark:bg-[#141a24] dark:text-[#f4f6f8] dark:hover:bg-[#1f2937]"
          >
            {t.reset}
          </button>
          <Link
            href={withLangPrefix("/", lang)}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-2 text-[13px] font-semibold text-ink-950 underline underline-offset-4 transition-colors hover:text-sapphire focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:text-[#f8f3e6] dark:hover:text-[#bad7fa]"
          >
            {t.exit}
          </Link>
        </div>
      </div>
      {error && (
        <p role="alert" className="mx-auto mt-2 max-w-7xl text-[13px] font-semibold text-[#b91c1c] dark:text-[#ffb4b4]">
          {error}
        </p>
      )}
    </div>
  );
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
  else if (patientMatch && patients.find((p) => p.id === patientMatch[1])) content = <AdminShell {...props} pendingCount={pendingRequestsCount}><main id="main-content" className="crm-page"><PatientProfileView initialPatient={patients.find((p) => p.id === patientMatch[1])!} isRomania /></main></AdminShell>;
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

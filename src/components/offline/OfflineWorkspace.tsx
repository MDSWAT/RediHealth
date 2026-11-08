"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { OfflineStore } from "@/lib/offline-store";
import { createOfflineVault, deleteOfflineVault, openOfflineData, readOfflineEnvelope, saveOfflineVault } from "@/lib/offline-vault";
import type { OfflineData, OfflineOperation, OfflineSnapshot } from "@/lib/offline-types";
import { OFFLINE_CACHE_LIMIT } from "@/lib/offline-types";
import { Button } from "@/components/ui/Button";
import { PanelRuntimeProvider } from "@/components/panel/PanelRuntime";
import { AdminShell, PersistentPanelShell } from "@/components/panel/AdminShell";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { CalendarDashboard } from "@/components/panel/CalendarDashboard";
import { filterLocalInbox } from "@/lib/request-inbox";
import { offlineCopy, offlineDateLocale, type OfflineCopy } from "./offline-copy";

async function prepareShell(lang: string, errors: OfflineCopy["errors"]) {
  if (!isSecureContext || !("serviceWorker" in navigator)) throw new Error(errors.needsHttps);
  await navigator.serviceWorker.register("/offline-worker.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error(errors.prepareTimeout)), 60_000);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      channel.port1.close();
      if (event.data.ok) resolve(); else reject(new Error(event.data.error));
    };
    const assets = performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => new URL(name).pathname.startsWith("/_next/static/"));
    registration.active!.postMessage({ type: "PREPARE_OFFLINE", lang, assets }, [channel.port2]);
  });
}
async function getSnapshot(errors: OfflineCopy["errors"]): Promise<OfflineSnapshot> {
  const response = await fetch("/api/offline/snapshot", { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || errors.authFailed);
  return result;
}

export function OfflineWorkspace() {
  const { lang } = useLanguage();
  const copy = offlineCopy[lang] ?? offlineCopy.en;
  const errors = copy.errors;
  const [store, setStore] = useState<OfflineStore | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [legacy, setLegacy] = useState(false);
  const [trustedDevice, setTrustedDevice] = useState(false);
  const [path, setPath] = useState("/");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(true);
  const [revision, setRevision] = useState(0);
  const [screenRevision, setScreenRevision] = useState(0);
  const release = useRef<(() => void) | null>(null);
  const current = useRef<OfflineStore | null>(null);
  const syncing = useRef(false);
  const opening = useRef(false);
  const alive = useRef(true);
  const [review, setReview] = useState<{ op: OfflineOperation; snapshot: OfflineSnapshot } | null>(null);

  const lock = useCallback(() => {
    const active = current.current;
    if (active) active.locked = true;
    const held = release.current;
    current.current = null;
    setStore(null); setPassphrase(""); setReview(null);
    if (!opening.current) release.current = null;
    if (active) void active.exclusive(async () => { held?.(); });
    else if (!opening.current) held?.();
  }, []);

  useEffect(() => {
    alive.current = true;
    const readPath = () => {
      const bare = stripLangFromPathname(location.pathname);
      setPath(bare.replace(/^\/(?:offline|panel)/, "") || "/");
    };
    readPath();
    const connection = () => setOnline(navigator.onLine);
    connection();
    readOfflineEnvelope().then((envelope) => {
      if (!alive.current) return;
      setLegacy(Boolean(envelope && !envelope.key));
      setExists(Boolean(envelope));
    }).catch((cause) => setError(String(cause.message)));
    window.addEventListener("popstate", readPath);
    window.addEventListener("online", connection); window.addEventListener("offline", connection);
    const beforeUnload = (event: BeforeUnloadEvent) => { if (current.current?.data.queue.length) event.preventDefault(); };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      alive.current = false;
      const active = current.current;
      if (active) active.locked = true;
      const held = release.current;
      current.current = null;
      if (!opening.current) release.current = null;
      if (active) void active.exclusive(async () => { held?.(); });
      else if (!opening.current) held?.();
      window.removeEventListener("popstate", readPath);
      window.removeEventListener("online", connection); window.removeEventListener("offline", connection);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  useEffect(() => {
    if (exists && !legacy) void openVault();
    // Automatically open a prepared device only on initial storage detection, not after pausing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exists, legacy]);

  useEffect(() => {
    if (!store) return;
    let activity = Date.now();
    const touch = () => { activity = Date.now(); };
    const timer = setInterval(() => { if (Date.now() - activity > 10 * 60_000 || Date.now() >= store.data.expiresAt) lock(); }, 10_000);
    window.addEventListener("pointerdown", touch); window.addEventListener("keydown", touch);
    return () => { clearInterval(timer); window.removeEventListener("pointerdown", touch); window.removeEventListener("keydown", touch); };
  }, [store, lock]);

  async function acquireDeviceLock() {
    if (!navigator.locks) throw new Error(errors.noLocks);
    await new Promise<void>((resolve, reject) => {
      void navigator.locks.request("redihealth-offline-vault", { ifAvailable: true }, async (held) => {
        if (!held) { reject(new Error(errors.otherTab)); return; }
        await new Promise<void>((done) => { release.current = done; resolve(); });
      }).catch(reject);
    });
  }
  async function openVault() {
    if (busy || opening.current || current.current) return;
    opening.current = true;
    setBusy(true); setError(""); setNotice("");
    try {
      if ((!exists || legacy) && !trustedDevice) throw new Error(errors.confirmTrusted);
      await acquireDeviceLock();
      let data: OfflineData; let key: CryptoKey; let salt: string;
      if (exists) {
        const envelope = await readOfflineEnvelope();
        if (!envelope) throw new Error(errors.storageRemoved);
        ({ data, key, salt } = await openOfflineData(envelope, passphrase));
      } else {
        const snapshot = await getSnapshot(errors);
        await prepareShell(lang, errors);
        data = { ...snapshot, version: 1, queue: [], deviceId: crypto.randomUUID() };
        ({ key, salt } = await createOfflineVault(data));
        const persisted = await navigator.storage?.persist?.();
        if (!persisted) setNotice(errors.evictionWarning);
      }
      let renewal: OfflineSnapshot | null = null;
      if (Date.now() >= data.expiresAt) {
        const snapshot = await getSnapshot(errors);
        if (snapshot.identity.email !== data.identity.email || snapshot.identity.workerId !== data.identity.workerId || snapshot.identity.country !== data.identity.country) throw new Error(errors.renewMismatch);
        renewal = snapshot;
      }
      if (!alive.current) throw new Error(errors.workspaceClosed);
      const next = new OfflineStore(data, (value) => saveOfflineVault(value, key, salt), () => { setNotice(""); setRevision((value) => value + 1); });
      if (renewal) await next.refresh(renewal);
      else if (legacy) await saveOfflineVault(data, key, salt);
      if (!alive.current) throw new Error(errors.workspaceClosed);
      current.current = next;
      setStore(next);
      setExists(true); setLegacy(false);
      setPassphrase("");
    } catch (cause) {
      release.current?.(); release.current = null;
      setError(cause instanceof Error ? cause.message : errors.openFailed);
    } finally { opening.current = false; setBusy(false); }
  }
  async function sync() {
    const active = current.current;
    if (!active || syncing.current) return;
    syncing.current = true; setBusy(true); setError("");
    try {
      const mappings = await active.sync();
      const snapshot = await getSnapshot(errors);
      await active.exclusive(() => active.refresh(snapshot));
      await prepareShell(lang, errors);
      const match = /\/patients\/(-\d+)$/.exec(location.pathname);
      if (match && mappings[match[1]]) navigate(withLangPrefix(`/offline/patients/${mappings[match[1]]}`, lang), true);
      setNotice(active.data.queue.length ? errors.needsReview : errors.synced);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors.syncFailed);
    } finally { syncing.current = false; setBusy(false); }
  }
  useEffect(() => {
    if (store && online) void sync();
    // Sync only on unlock/reconnect, not after every local state notification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, online]);
  useEffect(() => {
    if (!store || !online || busy || error || !store.data.queue.some((op) => !op.error)) return;
    const timer = setTimeout(() => { void sync(); }, 1500);
    return () => clearTimeout(timer);
    // Queue notifications debounce synchronization while connected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, online, busy, revision, error]);
  async function logout(discard = false) {
    const active = current.current;
    if (busy) return;
    if (discard && !window.confirm(errors.discardConfirm)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (active) {
        await active.exclusive(async () => {
          if (active.data.queue.length && !discard) throw new Error(errors.signOutBlocked);
          await deleteOfflineVault();
          active.locked = true;
        });
      } else {
        await acquireDeviceLock();
        await deleteOfflineVault();
      }
      lock(); setExists(false); setLegacy(false); setTrustedDevice(false);
      if (navigator.onLine) { await signOut({ redirect: false }); location.assign(withLangPrefix("/sign-in", lang)); }
      else setNotice(errors.deviceDataRemoved);
    } catch (cause) {
      if (!active) { release.current?.(); release.current = null; }
      setError(cause instanceof Error ? cause.message : errors.removeFailed);
    }
    finally { setBusy(false); }
  }
  function navigate(href: string, replace = false) {
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;
    const bare = stripLangFromPathname(url.pathname);
    if (!bare.startsWith("/offline")) { location.assign(href); return; }
    history[replace ? "replaceState" : "pushState"](null, "", href);
    window.scrollTo(0, 0);
    setPath(bare.slice("/offline".length) || "/");
    setScreenRevision((value) => value + 1);
  }
  const runtime = useMemo(() => store ? {
    request: store.request, demo: false, offline: true, pathname: `/panel${path === "/" ? "" : path}`,
    navigate, signOut: () => { void logout(); },
    // Navigation and sign-out read current refs; revision ensures current busy state is respected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  } : null, [store, path, busy]);

  const title = copy.title;
  // Locked screen: the same measure and type scale as the report form, an ink action (red is
  // kept for 112), the site checkbox, and the destructive option as a quiet text button.
  if (!store || !runtime) return <main id="main-content" className="flex-1 px-4 py-10 sm:py-16">
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <div className="mt-3 space-y-3 text-base leading-relaxed text-muted-foreground">
        <p>{copy.intro}</p>
        <p>{copy.limits(OFFLINE_CACHE_LIMIT)}</p>
      </div>
      {exists === null ? <p role="status" className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">{copy.checkingStorage}</p> : <form className="mt-8 space-y-5 border-t border-border pt-6" onSubmit={(event) => { event.preventDefault(); void openVault(); }}>
        {legacy && <div>
          <label htmlFor="offline-passphrase" className="mb-1.5 block text-sm font-semibold text-foreground">{copy.legacyPassphrase}</label>
          <input id="offline-passphrase" className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm" type="password" autoComplete="off" required value={passphrase} onChange={(event) => setPassphrase(event.target.value)} disabled={busy} />
        </div>}
        {(!exists || legacy) && <label className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-border accent-sapphire" required checked={trustedDevice} onChange={(event) => setTrustedDevice(event.target.checked)} disabled={busy} />
          <span>{copy.trustedDevice}</span>
        </label>}
        <Button type="submit" variant="secondary" disabled={busy} className="disabled:bg-muted disabled:text-muted-foreground">{busy ? copy.wait : legacy ? copy.migrate : exists ? copy.reopen : copy.enable}</Button>
      </form>}
      {error && <p role="alert" className="fhs-fade mt-5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm text-foreground">{error}</p>}
      {notice && <p role="status" className="fhs-fade mt-5 rounded-lg border border-border bg-muted/60 px-3 py-2 text-sm text-foreground">{notice}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-5 text-sm">
        <a className="font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire" href={withLangPrefix("/panel", lang)}>{copy.backToPanel}</a>
        {exists && <button type="button" className="min-h-9 rounded-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed" disabled={busy} onClick={() => void logout(true)}>{copy.discardAndRemove}</button>}
      </div>
    </div>
  </main>;

  const data = store.data;
  const pending = data.queue.length;
  const props = { userEmail: data.identity.email, userRole: data.identity.role, isAdmin: false, databaseAvailable: true };
  const isRomania = data.identity.country === "RO";
  const patientMatch = /^\/patients\/(-?\d+)$/.exec(path);
  const patient = data.patients.find((p) => p.id === patientMatch?.[1]);
  const pendingRequestsCount = data.requests.filter((r) => r.status === "pending").length;
  let content;
  if (path === "/") content = <WorkerDashboard {...props} isRomania={isRomania} initialInbox={filterLocalInbox(data.requests)} />;
  else if (path === "/patients") content = <PatientsDashboard {...props} isRomania={isRomania} initialPatients={data.patients} pendingRequestsCount={pendingRequestsCount} />;
  else if (patient) content = <AdminShell {...props} pendingCount={pendingRequestsCount} mobilePatientCreation={{ isRomania }}><main id="main-content" className="crm-page"><PatientProfileView initialPatient={patient} isRomania={isRomania} /></main></AdminShell>;
  else if (path === "/calendar" && data.identity.role.toLowerCase() === "doctor") content = <CalendarDashboard {...props} initialPatients={data.patients} pendingRequestsCount={pendingRequestsCount} />;
  else content = <main id="main-content" className="crm-page"><p role="alert">{copy.onlineOnlyPage}</p></main>;

  return <PanelRuntimeProvider value={runtime}><PersistentPanelShell {...props}>
    <section className="space-y-3 border-b border-amber-300 bg-amber-50 p-4 text-amber-950" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{title} · {online ? copy.online : copy.offline}</p><p className="text-xs">{data.identity.workerName} · {data.identity.country} · {copy.pendingChanges(pending)} · {copy.expires} {new Date(data.expiresAt).toLocaleDateString(offlineDateLocale[lang])}</p></div>
        <div className="flex flex-wrap gap-2"><button className="crm-button" disabled={busy || !online} onClick={() => void sync()}>{busy ? copy.syncing : copy.syncNow}</button><button className="crm-button" disabled={busy} onClick={lock}>{copy.pause}</button><button className="crm-button" disabled={busy} onClick={() => void logout()}>{copy.signOut}</button></div>
      </div>
      <p className="text-xs">{copy.editsNote}</p>
      <p className="text-xs">{copy.autoAccessNote}</p>
      {online && <a className="inline-block text-xs font-semibold underline" href={withLangPrefix("/panel", lang)}>{copy.openPanel}</a>}
      {error && <p role="alert" className="crm-error">{error}</p>}{notice && <p role="status" className="text-sm">{notice}</p>}
      {pending > 0 && <button type="button" className="text-xs font-semibold underline underline-offset-4" disabled={busy} onClick={() => void logout(true)}>{copy.discardAndRemove}</button>}
      {data.queue.filter((op) => op.error).map((op) => <div key={op.operationId} className="rounded border border-amber-300 bg-white p-3 text-sm">
        <p>{op.entity} #{op.id}: {op.error}</p>
        <button className="crm-button mt-2" disabled={!online || busy} onClick={() => { void getSnapshot(errors).then((snapshot) => {
          if (snapshot.identity.email !== data.identity.email || snapshot.identity.country !== data.identity.country || snapshot.identity.workerId !== data.identity.workerId) throw new Error(errors.sameAccount);
          setReview({ op, snapshot });
        }).catch((cause) => setError(cause.message)); }}>{copy.compareResolve}</button>
      </div>)}
      {review && <section className="space-y-3 rounded border border-border bg-white p-4">
        <h2 className="font-semibold">{copy.reviewTitle} · {review.op.entity} #{review.op.id}</h2>
        <p className="text-sm">{copy.reviewBody}</p>
        <div className="max-h-80 space-y-2 overflow-auto text-xs">{Object.entries(review.op.changes).map(([field, local]) => {
          const remote = review.op.entity === "patient" ? review.snapshot.patients.find((p) => p.id === review.op.id) : review.snapshot.requests.find((r) => r.id === review.op.id);
          const readable = (value: unknown) => JSON.stringify(value, (key, entry) => key === "data_url" || key === "profile_photo" ? "[image/document]" : entry)?.slice(0, 4000) || copy.empty;
          return <div key={field} className="border-b border-border p-2"><strong>{field}</strong><p className="break-all">{copy.deviceValue}: {field === "profile_photo" ? "[image]" : readable(local)}</p><p className="break-all">{copy.onlineValue}: {remote ? readable(Reflect.get(remote, field)) : copy.notInSnapshot}</p></div>;
        })}</div>
        <div className="flex flex-wrap gap-2"><button className="crm-button" onClick={() => void resolveConflict(false)}>{copy.useOnline}</button><button className="crm-button" disabled={!review.op.create && !review.snapshot.revisions[`${review.op.entity}:${review.op.id}`]} onClick={() => void resolveConflict(true)}>{review.op.create ? copy.retryCreate : copy.keepMine}</button><button className="crm-button" onClick={() => setReview(null)}>{copy.cancel}</button></div>
      </section>}
    </section>
    <div key={`${path}:${screenRevision}`} onClickCapture={(event) => {
      if (event.target instanceof Element) {
        const href = event.target.closest("a")?.getAttribute("href") || "";
        if (/^(tel:|mailto:|https?:)/.test(href) && !online) { event.preventDefault(); setError(errors.needsConnection); }
      }
    }}>{content}</div>
  </PersistentPanelShell></PanelRuntimeProvider>;

  async function resolveConflict(keepLocal: boolean) {
    if (!review || !current.current || busy) return;
    if (keepLocal && !window.confirm(errors.retryConfirm)) return;
    setBusy(true); setError("");
    try {
      const { op, snapshot } = review;
      await current.current.exclusive(async () => {
        const draft = structuredClone(current.current!.data);
        const pendingOp = draft.queue.find((item) => item.operationId === op.operationId);
        if (!pendingOp) throw new Error(errors.alreadyProcessed);
        if (keepLocal) {
          pendingOp.revision = op.create ? null : snapshot.revisions[`${op.entity}:${op.id}`];
          pendingOp.operationId = crypto.randomUUID(); delete pendingOp.error; delete pendingOp.submitted;
        } else {
          draft.queue = draft.queue.filter((item) => item.operationId !== op.operationId);
          if (op.entity === "patient") draft.patients = [...draft.patients.filter((p) => p.id !== op.id), ...snapshot.patients.filter((p) => p.id === op.id)];
          else draft.requests = [...draft.requests.filter((r) => r.id !== op.id), ...snapshot.requests.filter((r) => r.id === op.id)];
          if (op.create) draft.requests.forEach((request) => { if (request.patient_id === op.id) request.patient_id = null; });
          draft.revisions = { ...draft.revisions, ...snapshot.revisions };
        }
        await current.current!.commit(draft);
      });
      setReview(null); setScreenRevision((value) => value + 1);
    } catch (cause) { setError(cause instanceof Error ? cause.message : errors.conflictFailed); }
    finally { setBusy(false); }
  }
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { OfflineStore } from "@/lib/offline-store";
import { createOfflineVault, deleteOfflineVault, openOfflineData, readOfflineEnvelope, saveOfflineVault } from "@/lib/offline-vault";
import type { OfflineData, OfflineOperation, OfflineSnapshot } from "@/lib/offline-types";
import { OFFLINE_CACHE_LIMIT } from "@/lib/offline-types";
import { PanelRuntimeProvider } from "@/components/panel/PanelRuntime";
import { AdminShell, PersistentPanelShell } from "@/components/panel/AdminShell";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { CalendarDashboard } from "@/components/panel/CalendarDashboard";
import { filterLocalInbox } from "@/lib/request-inbox";

async function prepareShell(lang: string) {
  if (!isSecureContext || !("serviceWorker" in navigator)) throw new Error("Offline access requires HTTPS and a browser with service worker support.");
  await navigator.serviceWorker.register("/offline-worker.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;
  await new Promise<void>((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error("Timed out preparing the offline app. Stay online and try again.")), 60_000);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      channel.port1.close();
      if (event.data.ok) resolve(); else reject(new Error(event.data.error));
    };
    const assets = performance.getEntriesByType("resource").map((entry) => entry.name).filter((name) => new URL(name).pathname.startsWith("/_next/static/"));
    registration.active!.postMessage({ type: "PREPARE_OFFLINE", lang, assets }, [channel.port2]);
  });
}
async function getSnapshot(): Promise<OfflineSnapshot> {
  const response = await fetch("/api/offline/snapshot", { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Online authorization failed.");
  return result;
}

export function OfflineWorkspace() {
  const { lang } = useLanguage();
  const ro = lang === "ro";
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
    if (!navigator.locks) throw new Error("This browser cannot safely lock offline storage across tabs. Use a current Chrome, Edge, Firefox or Safari.");
    await new Promise<void>((resolve, reject) => {
      void navigator.locks.request("redihealth-offline-vault", { ifAvailable: true }, async (held) => {
        if (!held) { reject(new Error("Offline data is already open in another tab. Pause that tab first.")); return; }
        await new Promise<void>((done) => { release.current = done; resolve(); });
      }).catch(reject);
    });
  }
  async function openVault() {
    if (busy || opening.current || current.current) return;
    opening.current = true;
    setBusy(true); setError(""); setNotice("");
    try {
      if ((!exists || legacy) && !trustedDevice) throw new Error(ro ? "Confirmă că acesta este un dispozitiv privat și de încredere." : "Confirm this is a private, trusted device.");
      await acquireDeviceLock();
      let data: OfflineData; let key: CryptoKey; let salt: string;
      if (exists) {
        const envelope = await readOfflineEnvelope();
        if (!envelope) throw new Error("Encrypted device storage was removed.");
        ({ data, key, salt } = await openOfflineData(envelope, passphrase));
      } else {
        const snapshot = await getSnapshot();
        await prepareShell(lang);
        data = { ...snapshot, version: 1, queue: [], deviceId: crypto.randomUUID() };
        ({ key, salt } = await createOfflineVault(data));
        const persisted = await navigator.storage?.persist?.();
        if (!persisted) setNotice("Encrypted storage is available, but this browser may evict it. Synchronize frequently and do not clear site data.");
      }
      let renewal: OfflineSnapshot | null = null;
      if (Date.now() >= data.expiresAt) {
        const snapshot = await getSnapshot();
        if (snapshot.identity.email !== data.identity.email || snapshot.identity.workerId !== data.identity.workerId || snapshot.identity.country !== data.identity.country) throw new Error("Sign in to the original staff account and country to renew this expired device.");
        renewal = snapshot;
      }
      if (!alive.current) throw new Error("Offline workspace closed.");
      const next = new OfflineStore(data, (value) => saveOfflineVault(value, key, salt), () => { setNotice(""); setRevision((value) => value + 1); });
      if (renewal) await next.refresh(renewal);
      else if (legacy) await saveOfflineVault(data, key, salt);
      if (!alive.current) throw new Error("Offline workspace closed.");
      current.current = next;
      setStore(next);
      setExists(true); setLegacy(false);
      setPassphrase("");
    } catch (cause) {
      release.current?.(); release.current = null;
      setError(cause instanceof Error ? cause.message : "Could not open encrypted device storage.");
    } finally { opening.current = false; setBusy(false); }
  }
  async function sync() {
    const active = current.current;
    if (!active || syncing.current) return;
    syncing.current = true; setBusy(true); setError("");
    try {
      const mappings = await active.sync();
      const snapshot = await getSnapshot();
      await active.exclusive(() => active.refresh(snapshot));
      await prepareShell(lang);
      const match = /\/patients\/(-\d+)$/.exec(location.pathname);
      if (match && mappings[match[1]]) navigate(withLangPrefix(`/offline/patients/${mappings[match[1]]}`, lang), true);
      setNotice(active.data.queue.length
        ? ro ? "Unele modificări necesită verificare mai jos. Datele online nu au fost suprascrise." : "Some changes need review below. They have not overwritten online records."
        : ro ? "Toate modificările au fost sincronizate. Nu s-au trimis automat emailuri sau invitații video." : "All changes synchronized. No emails or video invitations were sent automatically.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sync failed. Changes remain encrypted on this device.");
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
    if (discard && !window.confirm(ro ? "Renunți definitiv la toate modificările nesincronizate și ștergi datele medicale criptate de pe dispozitiv? Nu mai poți reveni." : "Permanently discard all unsynced changes and delete the encrypted medical data on this device? This cannot be undone.")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      if (active) {
        await active.exclusive(async () => {
          if (active.data.queue.length && !discard) throw new Error("Sign-out blocked: synchronize pending changes, or explicitly discard them and remove this device's data.");
          await deleteOfflineVault();
          active.locked = true;
        });
      } else {
        await acquireDeviceLock();
        await deleteOfflineVault();
      }
      lock(); setExists(false); setLegacy(false); setTrustedDevice(false);
      if (navigator.onLine) { await signOut({ redirect: false }); location.assign(withLangPrefix("/sign-in", lang)); }
      else setNotice("Encrypted device data removed. Connect online to finish signing out of the web session.");
    } catch (cause) {
      if (!active) { release.current?.(); release.current = null; }
      setError(cause instanceof Error ? cause.message : "Could not remove encrypted data.");
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

  const title = ro ? "Spațiu offline criptat" : "Encrypted offline workspace";
  if (!store || !runtime) return <main id="main-content" className="mx-auto w-full max-w-xl space-y-5 p-6">
    <h1 className="text-2xl font-semibold">{title}</h1>
    <p className="text-sm">{ro ? "Datele medicale și documentele rămân criptate, dar cheia este salvată în acest browser pentru deschidere automată, fără parolă. Oricine folosește acest profil de browser poate accesa datele. Folosește doar un dispozitiv privat, protejat prin blocarea ecranului." : "Medical records and attachments remain encrypted, but the key is stored in this browser for automatic access without a password. Anyone using this browser profile can access the records. Use only a private device protected by a screen lock."}</p>
    <p className="text-sm">{ro ? `Pregătește online maximum ${OFFLINE_CACHE_LIMIT} de pacienți alocați recent și ${OFFLINE_CACHE_LIMIT} de cereri recente. Accesul expiră după 30 de zile; pauză după 10 minute de inactivitate. Redeschiderea nu cere parolă. Nu este autentificare offline.` : `Prepare up to ${OFFLINE_CACHE_LIMIT} recent assigned patients and ${OFFLINE_CACHE_LIMIT} recent requests while online. Access expires after 30 days; pauses after 10 idle minutes. Reopening does not require a password. This is not offline sign-in.`}</p>
    {exists === null ? <p role="status">{ro ? "Se verifică stocarea criptată…" : "Checking encrypted device storage…"}</p> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void openVault(); }}>
      {legacy && <label className="crm-label">{ro ? "Parola offline existentă (o singură dată, pentru migrare)" : "Existing offline passphrase (once, to migrate)"}<input className="crm-input" type="password" autoComplete="off" required value={passphrase} onChange={(event) => setPassphrase(event.target.value)} disabled={busy} /></label>}
      {(!exists || legacy) && <label className="flex items-start gap-2 text-sm"><input type="checkbox" required checked={trustedDevice} onChange={(event) => setTrustedDevice(event.target.checked)} disabled={busy} />{ro ? "Confirm că acesta este un dispozitiv privat și accept că oricine folosește acest profil de browser poate deschide datele offline fără parolă." : "This is a private device. I understand anyone using this browser profile can open offline records without a password."}</label>}
      <button className="crm-button crm-primary" disabled={busy}>{busy ? (ro ? "Așteaptă…" : "Please wait…") : legacy ? (ro ? "Migrează la acces automat" : "Migrate to automatic access") : exists ? (ro ? "Redeschide spațiul offline" : "Reopen offline workspace") : (ro ? "Activează offline pe acest dispozitiv" : "Enable offline on this device")}</button>
    </form>}
    {error && <p role="alert" className="crm-error">{error}</p>}{notice && <p role="status" className="crm-notice">{notice}</p>}
    {exists && <button className="crm-button text-red-700" disabled={busy} onClick={() => void logout(true)}>{ro ? "Renunță la modificări și șterge datele dispozitivului" : "Discard pending changes and remove device data"}</button>}
    <a className="block text-primary" href={withLangPrefix("/panel", lang)}>{ro ? "Înapoi la panoul online" : "Back to online panel"}</a>
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
  else content = <main id="main-content" className="crm-page"><p role="alert">{ro ? "Această pagină necesită internet sau pacientul nu este salvat pe acest dispozitiv." : "This page is online-only or the patient is not cached on this device."}</p></main>;

  return <PanelRuntimeProvider value={runtime}><PersistentPanelShell {...props}>
    <section className="space-y-3 border-b border-amber-300 bg-amber-50 p-4 text-amber-950" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{title} · {online ? "Online" : "Offline"}</p><p className="text-xs">{data.identity.workerName} · {data.identity.country} · {pending} {ro ? "modificări în așteptare" : "pending changes"} · {ro ? "Expiră" : "Expires"} {new Date(data.expiresAt).toLocaleDateString()}</p></div>
        <div className="flex flex-wrap gap-2"><button className="crm-button" disabled={busy || !online} onClick={() => void sync()}>{busy ? (ro ? "Se sincronizează…" : "Syncing…") : ro ? "Sincronizează" : "Sync now"}</button><button className="crm-button" disabled={busy} onClick={lock}>{ro ? "Pauză" : "Pause"}</button><button className="crm-button" disabled={busy} onClick={() => void logout()}>{ro ? "Deconectare" : "Sign out"}</button></div>
      </div>
      <p className="text-xs">{ro ? "Modificările sunt salvate criptat local și trimise la reconectare, cât timp spațiul este deblocat. Emailurile, invitațiile și video necesită panoul online." : "Edits save encrypted locally and sync on reconnect while unlocked. Email, invitations and video require the online panel."}</p>
      <p className="text-xs">{ro ? "Acces automat: cheia este salvată în browser. Pauza nu blochează accesul; redeschiderea nu cere parolă." : "Automatic access: the key is stored in this browser. Pausing is not an access lock; reopening requires no password."}</p>
      {online && <a className="inline-block text-xs font-semibold underline" href={withLangPrefix("/panel", lang)}>{ro ? "Deschide panoul online" : "Open online panel"}</a>}
      {error && <p role="alert" className="crm-error">{error}</p>}{notice && <p role="status" className="text-sm">{notice}</p>}
      {pending > 0 && <button className="text-xs font-semibold text-red-700 underline" disabled={busy} onClick={() => void logout(true)}>{ro ? "Renunță la modificări și șterge datele dispozitivului" : "Discard pending changes and remove device data"}</button>}
      {data.queue.filter((op) => op.error).map((op) => <div key={op.operationId} className="rounded border border-amber-300 bg-white p-3 text-sm">
        <p>{op.entity} #{op.id}: {op.error}</p>
        <button className="crm-button mt-2" disabled={!online || busy} onClick={() => { void getSnapshot().then((snapshot) => {
          if (snapshot.identity.email !== data.identity.email || snapshot.identity.country !== data.identity.country || snapshot.identity.workerId !== data.identity.workerId) throw new Error("Sign in to the original staff account and country.");
          setReview({ op, snapshot });
        }).catch((cause) => setError(cause.message)); }}>{ro ? "Compară și rezolvă" : "Compare and resolve"}</button>
      </div>)}
      {review && <section className="space-y-3 rounded border border-border bg-white p-4">
        <h2 className="font-semibold">{ro ? "Verifică diferențele" : "Review conflict"} · {review.op.entity} #{review.op.id}</h2>
        <p className="text-sm">{ro ? "Compară câmpurile modificate cu datele online. Pentru conținutul documentelor și imaginilor, deschide pacientul în panoul online. Datele nu sunt suprascrise fără alegerea ta explicită." : "Compare your changed fields with the current online record. Open the patient online to inspect attachment and image content. No overwrite occurs until you explicitly choose."}</p>
        <div className="max-h-80 space-y-2 overflow-auto text-xs">{Object.entries(review.op.changes).map(([field, local]) => {
          const remote = review.op.entity === "patient" ? review.snapshot.patients.find((p) => p.id === review.op.id) : review.snapshot.requests.find((r) => r.id === review.op.id);
          const readable = (value: unknown) => JSON.stringify(value, (key, entry) => key === "data_url" || key === "profile_photo" ? "[image/document]" : entry)?.slice(0, 4000) || "(empty)";
          return <div key={field} className="border-b border-border p-2"><strong>{field}</strong><p className="break-all">{ro ? "Dispozitiv" : "Device"}: {field === "profile_photo" ? "[image]" : readable(local)}</p><p className="break-all">Online: {remote ? readable(Reflect.get(remote, field)) : ro ? "(nu este disponibil în datele autorizate actuale)" : "(not in current authorized snapshot)"}</p></div>;
        })}</div>
        <div className="flex flex-wrap gap-2"><button className="crm-button" onClick={() => void resolveConflict(false)}>{ro ? "Folosește datele online / renunță la modificare" : "Use online / discard this pending edit"}</button><button className="crm-button" disabled={!review.op.create && !review.snapshot.revisions[`${review.op.entity}:${review.op.id}`]} onClick={() => void resolveConflict(true)}>{review.op.create ? (ro ? "Reîncearcă adăugarea pacientului" : "Retry creating this patient") : (ro ? "Păstrează câmpurile mele (reîncearcă pe această versiune)" : "Keep my changed fields (retry against this version)")}</button><button className="crm-button" onClick={() => setReview(null)}>{ro ? "Anulează" : "Cancel"}</button></div>
      </section>}
    </section>
    <div key={`${path}:${screenRevision}`} onClickCapture={(event) => {
      if (event.target instanceof Element) {
        const href = event.target.closest("a")?.getAttribute("href") || "";
        if (/^(tel:|mailto:|https?:)/.test(href) && !online) { event.preventDefault(); setError("Calls, email and external links require connectivity."); }
      }
    }}>{content}</div>
  </PersistentPanelShell></PanelRuntimeProvider>;

  async function resolveConflict(keepLocal: boolean) {
    if (!review || !current.current || busy) return;
    if (keepLocal && !window.confirm(ro ? "Reîncerci modificările tale peste versiunea online verificată? Dacă datele se modifică din nou, sincronizarea se va opri pentru o nouă verificare." : "Retry your changed fields over the reviewed online version? If it changes again, sync will stop for another review.")) return;
    setBusy(true); setError("");
    try {
      const { op, snapshot } = review;
      await current.current.exclusive(async () => {
        const draft = structuredClone(current.current!.data);
        const pendingOp = draft.queue.find((item) => item.operationId === op.operationId);
        if (!pendingOp) throw new Error("This pending change has already been processed.");
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
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Conflict resolution failed."); }
    finally { setBusy(false); }
  }
}

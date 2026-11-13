"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/language-context";
import { stripLangFromPathname, withLangPrefix } from "@/lib/i18n/routing";
import { OfflineStore } from "@/lib/offline-store";
import {
  createOfflineVault,
  deleteOfflineVault,
  openOfflineData,
  readOfflineEnvelope,
  saveOfflineVault,
} from "@/lib/offline-vault";
import type { OfflineData, OfflineOperation, OfflineSnapshot } from "@/lib/offline-types";
import { OFFLINE_CACHE_LIMIT } from "@/lib/offline-types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PanelRuntimeProvider } from "@/components/panel/PanelRuntime";
import { AdminShell, PersistentPanelShell } from "@/components/panel/AdminShell";
import { WorkerDashboard } from "@/components/panel/WorkerDashboard";
import { PatientsDashboard } from "@/components/panel/PatientsDashboard";
import { PatientProfileView } from "@/components/panel/PatientProfileView";
import { CalendarDashboard } from "@/components/panel/CalendarDashboard";
import { filterLocalInbox } from "@/lib/request-inbox";
import { offlineCopy, offlineDateLocale, type OfflineCopy } from "./offline-copy";

const IDLE_TIMEOUT_MS = 10 * 60_000;
const IDLE_WARNING_SECONDS = 120;

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
      if (event.data.ok) resolve();
      else reject(new Error(event.data.error));
    };
    const assets = performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => new URL(name).pathname.startsWith("/_next/static/"));
    registration.active!.postMessage({ type: "PREPARE_OFFLINE", lang, assets }, [channel.port2]);
  });
}

async function getSnapshot(errors: OfflineCopy["errors"]): Promise<OfflineSnapshot> {
  const response = await fetch("/api/offline/snapshot", {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || errors.authFailed);
  return result;
}

function formatIdleClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function formatMegabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 100 ? Math.round(mb).toString() : mb.toFixed(1);
}

function formatClinicalFieldValue(field: string, value: unknown, copy: OfflineCopy): string {
  if (value === null || value === undefined || value === "") {
    return copy.empty;
  }

  if (field === "profile_photo") {
    return typeof value === "string" && value.trim() ? copy.attachmentSummary(1) : copy.empty;
  }

  if (field === "photos" && Array.isArray(value)) {
    if (value.length === 0) return copy.empty;
    const names = value
      .map((entry) => {
        if (entry && typeof entry === "object" && "name" in entry && typeof entry.name === "string") {
          const datePart =
            "date" in entry && typeof entry.date === "string" && entry.date ? ` (${entry.date})` : "";
          return `${entry.name}${datePart}`;
        }
        return "";
      })
      .filter(Boolean);
    const header = copy.attachmentSummary(value.length);
    return names.length > 0 ? `${header}: ${names.join(", ")}` : header;
  }

  if (field === "followups" && Array.isArray(value)) {
    if (value.length === 0) return copy.empty;
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const rec = item as Record<string, unknown>;
        const parts = [rec.date, rec.time, rec.title, rec.status, rec.notes]
          .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
          .map((part) => part.trim());
        return parts.join(" — ");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (field === "treatment_plan" && Array.isArray(value)) {
    if (value.length === 0) return copy.empty;
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return String(item ?? "");
        const rec = item as Record<string, unknown>;
        const parts = [
          rec.title ?? rec.medication ?? rec.name,
          rec.dosage ?? rec.frequency,
          rec.instructions ?? rec.description ?? rec.notes,
        ]
          .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
          .map((part) => part.trim());
        return parts.join(" — ");
      })
      .filter(Boolean)
      .join("\n");
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return copy.empty;
    return value
      .map((entry) => formatClinicalFieldValue("", entry, copy))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([key, val]) =>
        key !== "data_url" &&
        key !== "profile_photo" &&
        val !== null &&
        val !== undefined &&
        String(val).trim() !== "",
    );
    if (entries.length === 0) return copy.empty;
    return entries
      .map(([key, val]) => {
        const label = copy.fieldLabels[key] ?? key.replace(/_/g, " ");
        const formatted =
          typeof val === "object" ? formatClinicalFieldValue(key, val, copy) : String(val);
        return `${label}: ${formatted}`;
      })
      .join("\n");
  }

  return String(value).slice(0, 4000) || copy.empty;
}

export function OfflineWorkspace() {
  const { lang } = useLanguage();
  const copy = offlineCopy[lang] ?? offlineCopy.en;
  const errors = copy.errors;
  const detailsPanelId = useId();

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
  const [vaultDetailsOpen, setVaultDetailsOpen] = useState(false);
  const [idleCountdownSec, setIdleCountdownSec] = useState<number | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{
    usageBytes: number;
    quotaBytes: number;
  } | null>(null);

  const release = useRef<(() => void) | null>(null);
  const current = useRef<OfflineStore | null>(null);
  const syncing = useRef(false);
  const opening = useRef(false);
  const alive = useRef(true);
  const lastActivityRef = useRef<number>(Date.now());
  const [review, setReview] = useState<{ op: OfflineOperation; snapshot: OfflineSnapshot } | null>(
    null,
  );

  const refreshStorageEstimate = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) return;
    try {
      const est = await navigator.storage.estimate();
      if (!alive.current) return;
      if (typeof est.usage === "number" && typeof est.quota === "number" && est.quota > 0) {
        setStorageEstimate({ usageBytes: est.usage, quotaBytes: est.quota });
      }
    } catch {
      // Ignore unsupported storage estimate contexts.
    }
  }, []);

  const lock = useCallback(() => {
    const active = current.current;
    if (active) active.locked = true;
    const held = release.current;
    current.current = null;
    setStore(null);
    setPassphrase("");
    setReview(null);
    setIdleCountdownSec(null);
    setVaultDetailsOpen(false);
    if (!opening.current) release.current = null;
    if (active)
      void active.exclusive(async () => {
        held?.();
      });
    else if (!opening.current) held?.();
  }, []);

  const stayUnlocked = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleCountdownSec(null);
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
    void refreshStorageEstimate();

    readOfflineEnvelope()
      .then((envelope) => {
        if (!alive.current) return;
        setLegacy(Boolean(envelope && !envelope.key));
        setExists(Boolean(envelope));
      })
      .catch((cause) => setError(String(cause.message)));

    window.addEventListener("popstate", readPath);
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (current.current?.data.queue.length) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      alive.current = false;
      const active = current.current;
      if (active) active.locked = true;
      const held = release.current;
      current.current = null;
      if (!opening.current) release.current = null;
      if (active)
        void active.exclusive(async () => {
          held?.();
        });
      else if (!opening.current) held?.();
      window.removeEventListener("popstate", readPath);
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [refreshStorageEstimate]);

  useEffect(() => {
    if (exists && !legacy) void openVault();
    // Automatically open a prepared device only on initial storage detection, not after pausing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exists, legacy]);

  useEffect(() => {
    if (!store) return;
    lastActivityRef.current = Date.now();
    setIdleCountdownSec(null);

    const touch = () => {
      lastActivityRef.current = Date.now();
      setIdleCountdownSec((prev) => (prev !== null ? null : prev));
    };

    const timer = window.setInterval(() => {
      const now = Date.now();
      const idleRemainingMs = IDLE_TIMEOUT_MS - (now - lastActivityRef.current);
      const expiryRemainingMs = store.data.expiresAt - now;
      const remainingMs = Math.min(idleRemainingMs, expiryRemainingMs);

      if (remainingMs <= 0) {
        lock();
        return;
      }

      const remainingSec = Math.ceil(remainingMs / 1000);
      if (remainingSec <= IDLE_WARNING_SECONDS) {
        setIdleCountdownSec(remainingSec);
      } else {
        setIdleCountdownSec((prev) => (prev !== null ? null : prev));
      }
    }, 1000);

    window.addEventListener("pointerdown", touch);
    window.addEventListener("keydown", touch);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pointerdown", touch);
      window.removeEventListener("keydown", touch);
    };
  }, [store, lock]);

  async function acquireDeviceLock() {
    if (!navigator.locks) throw new Error(errors.noLocks);
    await new Promise<void>((resolve, reject) => {
      void navigator.locks
        .request("redihealth-offline-vault", { ifAvailable: true }, async (held) => {
          if (!held) {
            reject(new Error(errors.otherTab));
            return;
          }
          await new Promise<void>((done) => {
            release.current = done;
            resolve();
          });
        })
        .catch(reject);
    });
  }

  async function openVault() {
    if (busy || opening.current || current.current) return;
    opening.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if ((!exists || legacy) && !trustedDevice) throw new Error(errors.confirmTrusted);
      await acquireDeviceLock();
      let data: OfflineData;
      let key: CryptoKey;
      let salt: string;
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
        if (
          snapshot.identity.email !== data.identity.email ||
          snapshot.identity.workerId !== data.identity.workerId ||
          snapshot.identity.country !== data.identity.country
        ) {
          throw new Error(errors.renewMismatch);
        }
        renewal = snapshot;
      }
      if (!alive.current) throw new Error(errors.workspaceClosed);
      const next = new OfflineStore(
        data,
        (value) => saveOfflineVault(value, key, salt),
        () => {
          setNotice("");
          setRevision((value) => value + 1);
          void refreshStorageEstimate();
        },
      );
      if (renewal) await next.refresh(renewal);
      else if (legacy) await saveOfflineVault(data, key, salt);
      if (!alive.current) throw new Error(errors.workspaceClosed);
      current.current = next;
      setStore(next);
      setExists(true);
      setLegacy(false);
      setPassphrase("");
      void refreshStorageEstimate();
    } catch (cause) {
      release.current?.();
      release.current = null;
      setError(cause instanceof Error ? cause.message : errors.openFailed);
    } finally {
      opening.current = false;
      setBusy(false);
    }
  }

  async function sync() {
    const active = current.current;
    if (!active || syncing.current) return;
    syncing.current = true;
    setBusy(true);
    setError("");
    try {
      const mappings = await active.sync();
      const snapshot = await getSnapshot(errors);
      await active.exclusive(() => active.refresh(snapshot));
      await prepareShell(lang, errors);
      const match = /\/patients\/(-\d+)$/.exec(location.pathname);
      if (match && mappings[match[1]]) {
        navigate(withLangPrefix(`/offline/patients/${mappings[match[1]]}`, lang), true);
      }
      setNotice(active.data.queue.length ? errors.needsReview : errors.synced);
      void refreshStorageEstimate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors.syncFailed);
    } finally {
      syncing.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (store && online) void sync();
    // Sync only on unlock/reconnect, not after every local state notification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, online]);

  useEffect(() => {
    if (!store || !online || busy || error || !store.data.queue.some((op) => !op.error)) return;
    const timer = setTimeout(() => {
      void sync();
    }, 1500);
    return () => clearTimeout(timer);
    // Queue notifications debounce synchronization while connected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, online, busy, revision, error]);

  async function logout(discard = false) {
    const active = current.current;
    if (busy) return;
    if (discard && !window.confirm(errors.discardConfirm)) return;
    setBusy(true);
    setError("");
    setNotice("");
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
      lock();
      setExists(false);
      setLegacy(false);
      setTrustedDevice(false);
      void refreshStorageEstimate();
      if (navigator.onLine) {
        await signOut({ redirect: false });
        location.assign(withLangPrefix("/sign-in", lang));
      } else {
        setNotice(errors.deviceDataRemoved);
      }
    } catch (cause) {
      if (!active) {
        release.current?.();
        release.current = null;
      }
      setError(cause instanceof Error ? cause.message : errors.removeFailed);
    } finally {
      setBusy(false);
    }
  }

  function navigate(href: string, replace = false) {
    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;
    const bare = stripLangFromPathname(url.pathname);
    if (!bare.startsWith("/offline")) {
      location.assign(href);
      return;
    }
    history[replace ? "replaceState" : "pushState"](null, "", href);
    window.scrollTo(0, 0);
    setPath(bare.slice("/offline".length) || "/");
    setScreenRevision((value) => value + 1);
  }

  const runtime = useMemo(
    () =>
      store
        ? {
            request: store.request,
            demo: false,
            offline: true,
            pathname: `/panel${path === "/" ? "" : path}`,
            navigate,
            signOut: () => {
              void logout();
            },
            // Navigation and sign-out read current refs; revision ensures current busy state is respected.
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, path, busy],
  );

  const title = copy.title;
  const storageRatio = storageEstimate
    ? Math.min(100, Math.max(2, (storageEstimate.usageBytes / storageEstimate.quotaBytes) * 100))
    : 0;

  if (!store || !runtime) {
    return (
      <main id="main-content" className="flex-1 py-10 sm:py-16">
        <Container>
          <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-sapphire">
              {copy.encryptionBadge}
            </span>
            <span aria-hidden="true" className="h-3 w-px bg-border" />
            <span className="font-medium text-foreground">
              {online ? copy.online : copy.offline}
            </span>
          </div>

          <h1 className="text-balance text-page text-foreground">
            {title}
          </h1>

          <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            <p>{copy.intro}</p>
            <p className="tabular-nums">{copy.limits(OFFLINE_CACHE_LIMIT)}</p>
          </div>

          {storageEstimate ? (
            <div className="mt-5 rounded-xl border border-border bg-muted/35 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-foreground">{copy.storageMeterLabel}</span>
                <span className="tabular-nums text-muted-foreground">
                  {copy.storageQuotaSummary(
                    formatMegabytes(storageEstimate.usageBytes),
                    formatMegabytes(storageEstimate.quotaBytes),
                  )}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-xs bg-muted">
                <div
                  className="h-full w-full origin-left bg-sapphire transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-calm)] motion-reduce:transition-none"
                  style={{ transform: `scaleX(${(storageRatio / 100).toFixed(3)})` }}
                />
              </div>
            </div>
          ) : null}

          {exists === null ? (
            <p role="status" className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
              {copy.checkingStorage}
            </p>
          ) : (
            <form
              className="mt-6 space-y-5 border-t border-border pt-5"
              onSubmit={(event) => {
                event.preventDefault();
                void openVault();
              }}
            >
              {legacy ? (
                <div>
                  <label
                    htmlFor="offline-passphrase"
                    className="mb-1.5 block text-sm font-semibold text-foreground"
                  >
                    {copy.legacyPassphrase}
                  </label>
                  <input
                    id="offline-passphrase"
                    className="min-h-[44px] w-full rounded-lg border border-border-control bg-background px-3 py-2 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                    type="password"
                    autoComplete="off"
                    required
                    value={passphrase}
                    onChange={(event) => setPassphrase(event.target.value)}
                    disabled={busy}
                  />
                </div>
              ) : null}

              {!exists || legacy ? (
                <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-border-control accent-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                    checked={trustedDevice}
                    onChange={(event) => setTrustedDevice(event.target.checked)}
                    disabled={busy}
                  />
                  <span>{copy.trustedDevice}</span>
                </label>
              ) : null}

              <Button
                type="submit"
                variant="action"
                disabled={busy}
                className="min-h-[44px] whitespace-nowrap rounded-lg disabled:bg-muted disabled:text-muted-foreground"
              >
                {busy ? copy.wait : legacy ? copy.migrate : exists ? copy.reopen : copy.enable}
              </Button>
            </form>
          )}

          {error ? (
            <p
              role="alert"
              className="fhs-fade motion-reduce:animate-none mt-5 rounded-lg border border-primary/20 bg-primary-soft px-3.5 py-2.5 text-sm text-foreground"
            >
              {error}
            </p>
          ) : null}
          {notice ? (
            <p
              role="status"
              className="fhs-fade motion-reduce:animate-none mt-5 rounded-lg border border-border bg-muted/60 px-3.5 py-2.5 text-sm text-foreground"
            >
              {notice}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border pt-5 text-sm">
            <a
              className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-1 font-medium text-sapphire underline decoration-sapphire/40 underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire-light hover:decoration-sapphire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={withLangPrefix("/panel", lang)}
            >
              {copy.backToPanel}
            </a>
            {exists ? (
              <button
                type="button"
                className="press-row inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none disabled:cursor-not-allowed"
                disabled={busy}
                onClick={() => void logout(true)}
              >
                {copy.discardAndRemove}
              </button>
            ) : null}
          </div>
        </div>
        </Container>
      </main>
    );
  }

  const data = store.data;
  const pending = data.queue.length;
  const props = {
    userEmail: data.identity.email,
    userRole: data.identity.role,
    isAdmin: false,
    databaseAvailable: true,
  };
  const isRomania = data.identity.country === "RO";
  const patientMatch = /^\/patients\/(-?\d+)$/.exec(path);
  const patient = data.patients.find((p) => p.id === patientMatch?.[1]);
  const pendingRequestsCount = data.requests.filter((r) => r.status === "pending").length;

  let content;
  if (path === "/") {
    content = (
      <WorkerDashboard
        {...props}
        isRomania={isRomania}
        initialInbox={filterLocalInbox(data.requests)}
      />
    );
  } else if (path === "/patients") {
    content = (
      <PatientsDashboard
        {...props}
        isRomania={isRomania}
        initialPatients={data.patients}
        pendingRequestsCount={pendingRequestsCount}
      />
    );
  } else if (patient) {
    content = (
      <AdminShell
        {...props}
        pendingCount={pendingRequestsCount}
        mobilePatientCreation={{ isRomania }}
      >
        <main id="main-content" className="crm-page">
          <PatientProfileView initialPatient={patient} isRomania={isRomania} />
        </main>
      </AdminShell>
    );
  } else if (path === "/calendar" && data.identity.role.toLowerCase() === "doctor") {
    content = (
      <CalendarDashboard
        {...props}
        initialPatients={data.patients}
        pendingRequestsCount={pendingRequestsCount}
      />
    );
  } else {
    content = (
      <main id="main-content" className="crm-page">
        <p role="alert">{copy.onlineOnlyPage}</p>
      </main>
    );
  }

  const failedOps = data.queue.filter((op) => op.error);

  return (
    <PanelRuntimeProvider value={runtime}>
      <PersistentPanelShell {...props}>
        <section
          className="space-y-3 border-b border-border bg-card py-3 text-foreground"
          aria-label={title}
        >
          <Container className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span className="font-semibold text-foreground">
                {online ? copy.online : copy.offline}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span className="font-semibold text-sapphire">
                {copy.encryptionBadge}
              </span>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <span
                className={`tabular-nums ${
                  pending > 0
                    ? "font-semibold text-amber-care"
                    : "text-muted-foreground"
                }`}
              >
                {copy.pendingChanges(pending)}
              </span>

              <span className="hidden text-muted-foreground md:inline">
                {data.identity.workerName}, {data.identity.country} — {copy.expires}{" "}
                <span className="tabular-nums font-medium text-foreground">
                  {new Date(data.expiresAt).toLocaleDateString(offlineDateLocale[lang])}
                </span>
              </span>

              {idleCountdownSec !== null && idleCountdownSec <= IDLE_WARNING_SECONDS ? (
                <div
                  role="status"
                  className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground"
                >
                  <span className="tabular-nums text-amber-care">
                    {copy.idlePauseIn(formatIdleClock(idleCountdownSec))}
                  </span>
                  <button
                    type="button"
                    onClick={stayUnlocked}
                    className="press-row inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg border border-border-control bg-card px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  >
                    {copy.stayUnlocked}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                disabled={busy || !online}
                onClick={() => void sync()}
              >
                {busy ? copy.syncing : copy.syncNow}
              </button>

              <button
                type="button"
                className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                disabled={busy}
                onClick={lock}
              >
                {copy.pause}
              </button>

              <button
                type="button"
                className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                disabled={busy}
                onClick={() => void logout()}
              >
                {copy.signOut}
              </button>

              {online ? (
                <a
                  className="press-row inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg border border-sapphire/25 bg-sapphire-soft px-3 py-2 text-xs font-semibold text-sapphire transition-colors hover:bg-sapphire hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                  href={withLangPrefix("/panel", lang)}
                >
                  {copy.openPanel}
                </a>
              ) : null}

              <button
                type="button"
                aria-expanded={vaultDetailsOpen}
                aria-controls={detailsPanelId}
                onClick={() => setVaultDetailsOpen((prev) => !prev)}
                className="press-row inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg border border-border-control bg-muted/50 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                {copy.vaultDetailsToggle}
              </button>
            </div>
          </Container>

          {vaultDetailsOpen ? (
            <Container>
              <div
                id={detailsPanelId}
                className="space-y-2 rounded-xl border border-border bg-muted/35 p-3.5 text-xs text-muted-foreground"
              >
                <p>{copy.editsNote}</p>
                <p>{copy.autoAccessNote}</p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {storageEstimate ? (
                    <span className="tabular-nums font-medium text-foreground">
                      {copy.storageMeterLabel}:{" "}
                      {copy.storageQuotaSummary(
                        formatMegabytes(storageEstimate.usageBytes),
                        formatMegabytes(storageEstimate.quotaBytes),
                      )}
                    </span>
                  ) : null}
                  {pending > 0 ? (
                    <button
                      type="button"
                      className="press-row inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-2 text-xs font-semibold text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-primary motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={busy}
                      onClick={() => void logout(true)}
                    >
                      {copy.discardAndRemove}
                    </button>
                  ) : null}
                </div>
              </div>
            </Container>
          ) : null}

          {error ? (
            <Container>
              <p role="alert" className="crm-error">
                {error}
              </p>
            </Container>
          ) : null}

          {notice ? (
            <Container>
              <p
                role="status"
                className="rounded-lg border border-border bg-muted/60 px-3.5 py-2 text-xs font-medium text-foreground"
              >
                {notice}
              </p>
            </Container>
          ) : null}

          {failedOps.length > 0 ? (
            <Container className="space-y-2.5">
              {failedOps.map((op) => {
                const entityName = copy.entityLabels[op.entity] ?? op.entity;
                return (
                  <div
                    key={op.operationId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-care/40 bg-amber-care/10 p-3.5 text-sm text-foreground"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <p className="tabular-nums font-semibold">
                        {entityName} #{op.id}
                      </p>
                      <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
                        {op.error}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                      disabled={!online || busy}
                      onClick={() => {
                        void getSnapshot(errors)
                          .then((snapshot) => {
                            if (
                              snapshot.identity.email !== data.identity.email ||
                              snapshot.identity.country !== data.identity.country ||
                              snapshot.identity.workerId !== data.identity.workerId
                            ) {
                              throw new Error(errors.sameAccount);
                            }
                            setReview({ op, snapshot });
                          })
                          .catch((cause) => setError(cause.message));
                      }}
                    >
                      {copy.compareResolve}
                    </button>
                  </div>
                );
              })}
            </Container>
          ) : null}

          {review ? (
            <Container>
              <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                <div className="space-y-1">
                  <h2 className="text-balance tabular-nums text-base font-semibold text-foreground">
                    {copy.reviewTitle} — {copy.entityLabels[review.op.entity] ?? review.op.entity} #
                    {review.op.id}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{copy.reviewBody}</p>
                </div>

                <div className="max-h-96 overflow-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-muted text-foreground">
                      <tr>
                        <th className="w-1/4 border-b border-border px-3.5 py-2.5 font-semibold">
                          {copy.diffFieldHeader}
                        </th>
                        <th className="w-[37.5%] border-b border-l border-border px-3.5 py-2.5 font-semibold text-sapphire">
                          {copy.deviceValue}
                        </th>
                        <th className="w-[37.5%] border-b border-l border-border px-3.5 py-2.5 font-semibold">
                          {copy.onlineValue}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {Object.entries(review.op.changes).map(([field, local]) => {
                        const remote =
                          review.op.entity === "patient"
                            ? review.snapshot.patients.find((p) => p.id === review.op.id)
                            : review.snapshot.requests.find((r) => r.id === review.op.id);
                        const label = copy.fieldLabels[field] ?? field.replace(/_/g, " ");
                        const localFormatted = formatClinicalFieldValue(field, local, copy);
                        const remoteFormatted = remote
                          ? formatClinicalFieldValue(field, Reflect.get(remote, field), copy)
                          : copy.notInSnapshot;

                        return (
                          <tr key={field} className="align-top">
                            <th
                              scope="row"
                              className="bg-muted/25 px-3.5 py-3 font-semibold text-foreground [overflow-wrap:anywhere]"
                            >
                              {label}
                            </th>
                            <td className="whitespace-pre-wrap border-l border-border bg-sapphire-soft/35 px-3.5 py-3 text-foreground [overflow-wrap:anywhere]">
                              {localFormatted}
                            </td>
                            <td className="whitespace-pre-wrap border-l border-border bg-background px-3.5 py-3 text-foreground [overflow-wrap:anywhere]">
                              {remoteFormatted}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                    onClick={() => void resolveConflict(false)}
                  >
                    {copy.useOnline}
                  </button>
                  <button
                    type="button"
                    className="crm-button crm-primary press-solid min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                    disabled={
                      !review.op.create &&
                      !review.snapshot.revisions[`${review.op.entity}:${review.op.id}`]
                    }
                    onClick={() => void resolveConflict(true)}
                  >
                    {review.op.create ? copy.retryCreate : copy.keepMine}
                  </button>
                  <button
                    type="button"
                    className="crm-button press-row min-h-[44px] whitespace-nowrap rounded-lg text-xs motion-reduce:transition-none"
                    onClick={() => setReview(null)}
                  >
                    {copy.cancel}
                  </button>
                </div>
              </section>
            </Container>
          ) : null}
        </section>

        <div
          key={`${path}:${screenRevision}`}
          onClickCapture={(event) => {
            if (event.target instanceof Element) {
              const href = event.target.closest("a")?.getAttribute("href") || "";
              if (/^(tel:|mailto:|https?:)/.test(href) && !online) {
                event.preventDefault();
                setError(errors.needsConnection);
              }
            }
          }}
        >
          {content}
        </div>
      </PersistentPanelShell>
    </PanelRuntimeProvider>
  );

  async function resolveConflict(keepLocal: boolean) {
    if (!review || !current.current || busy) return;
    if (keepLocal && !window.confirm(errors.retryConfirm)) return;
    setBusy(true);
    setError("");
    try {
      const { op, snapshot } = review;
      await current.current.exclusive(async () => {
        const draft = structuredClone(current.current!.data);
        const pendingOp = draft.queue.find((item) => item.operationId === op.operationId);
        if (!pendingOp) throw new Error(errors.alreadyProcessed);
        if (keepLocal) {
          pendingOp.revision = op.create ? null : snapshot.revisions[`${op.entity}:${op.id}`];
          pendingOp.operationId = crypto.randomUUID();
          delete pendingOp.error;
          delete pendingOp.submitted;
        } else {
          draft.queue = draft.queue.filter((item) => item.operationId !== op.operationId);
          if (op.entity === "patient") {
            draft.patients = [
              ...draft.patients.filter((p) => p.id !== op.id),
              ...snapshot.patients.filter((p) => p.id === op.id),
            ];
          } else {
            draft.requests = [
              ...draft.requests.filter((r) => r.id !== op.id),
              ...snapshot.requests.filter((r) => r.id === op.id),
            ];
          }
          if (op.create) {
            draft.requests.forEach((request) => {
              if (request.patient_id === op.id) request.patient_id = null;
            });
          }
          draft.revisions = { ...draft.revisions, ...snapshot.revisions };
        }
        await current.current!.commit(draft);
      });
      setReview(null);
      setScreenRevision((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errors.conflictFailed);
    } finally {
      setBusy(false);
    }
  }
}

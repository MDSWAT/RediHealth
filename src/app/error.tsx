"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { reportClientError } from "@/lib/client-error-report";
import { errorTranslations } from "@/lib/i18n/error-translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

/**
 * The 404's route motif, told for a fault: the line sets out, breaks for a moment, and carries
 * on to where it was going. Drawn once (stroke-draw); simply drawn under reduced motion.
 * Replaces a generic alert icon, which read as an alarm on a page that should feel recoverable.
 */
function PausedRoute() {
  return (
    <svg
      viewBox="0 0 200 40"
      className="h-10 w-[200px] text-muted-foreground/60"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="14" cy="20" r="4.5" className="fill-sapphire dark:fill-sapphire-border" />
      <path className="stroke-draw" pathLength={1} d="M14 20 H 84" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        className="stroke-draw"
        style={{ animationDelay: "520ms" }}
        pathLength={1}
        d="M116 20 H 180"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="186" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function subscribeToConnection(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

const CHUNK_RELOAD_STORAGE_KEY = "redihealth:chunk-reload:v1";
const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; message?: unknown };
  if (candidate.name === "ChunkLoadError") return true;
  const message = typeof candidate.message === "string" ? candidate.message : "";
  return /Failed to load chunk|Loading chunk [\w-]+ failed|Importing a module script failed/i.test(message);
}

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { lang } = useLanguage();
  const copy = errorTranslations[lang];
  // With no connection "come back in a few minutes" is the wrong advice: say what the matter is.
  const offline = useSyncExternalStore(
    subscribeToConnection,
    () => !navigator.onLine,
    () => false,
  );
  const chunkError = isChunkLoadError(error);

  useEffect(() => {
    console.error(error);
    reportClientError(error, "render");
  }, [error]);

  useEffect(() => {
    if (!chunkError || offline || typeof window === "undefined") return;
    try {
      const now = Date.now();
      const last = Number(window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY) || 0);
      if (Number.isFinite(last) && now - last < CHUNK_RELOAD_COOLDOWN_MS) return;
      window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
      window.location.reload();
    } catch {
      // Ignore storage access errors in restricted browsing contexts.
    }
  }, [chunkError, offline]);

  return (
    <main id="main-content" className="flex flex-1 items-center pb-16 sm:pb-24">
      <Container>
        <section role="alert" className="fhs-enter max-w-xl">
          <PageHeader
            align="start"
            above={<PausedRoute />}
            title={copy.title}
            lead={offline ? copy.offlineBody : copy.body}
            actions={
              <>
                <Button
                  size="lg"
                  variant="action"
                  onClick={() => {
                    if (chunkError && !offline) {
                      window.location.reload();
                      return;
                    }
                    retry();
                  }}
                >
                  {copy.retry}
                </Button>
                <Button
                  href={withLangPrefix("/", lang)}
                  size="lg"
                  variant="outline"
                >
                  {copy.home}
                </Button>
              </>
            }
          />
        </section>
      </Container>
    </main>
  );
}

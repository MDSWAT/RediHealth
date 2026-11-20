"use client";

import { useEffect, useSyncExternalStore } from "react";
import { reportClientError } from "@/lib/client-error-report";
import { errorTranslations } from "@/lib/i18n/error-translations";
import type { Lang } from "@/lib/i18n/translations";

// Values mirror the site tokens (ink, paper, sapphire) since globals.css is not loaded here.
// The retry button is sapphire (#1d3557, hover #2a4d7c; on the dark ground #a9c6f2, hover #cfe0fa): red is kept for 112.
const GLOBAL_ERROR_CSS = `
.ge-body-root { color: #1f2933; background: #ffffff; }
.ge-body { color: #52606d; }
.ge-retry { background: #1d3557; color: #ffffff; transition: background-color 160ms cubic-bezier(0.25, 1, 0.5, 1); }
.ge-retry:hover { background: #2a4d7c; }
.ge-retry:active { background: #2a4d7c; transition-duration: 0ms; }
.ge-retry:focus-visible, .ge-home:focus-visible { outline: 2px solid #1d3557; outline-offset: 3px; }
.ge-home { color: #1d3557; }
@media (prefers-color-scheme: dark) {
  .ge-body-root { color: #fbfaf6; background: #101a33; }
  .ge-body { color: #cbd5e1; }
  .ge-retry { background: #a9c6f2; color: #0a1226; }
  .ge-retry:hover, .ge-retry:active { background: #cfe0fa; }
  .ge-retry:focus-visible, .ge-home:focus-visible { outline-color: #bfdbfe; }
  .ge-home { color: #bfdbfe; }
}
@media (prefers-reduced-motion: no-preference) {
  .ge-main { animation: ge-settle 420ms cubic-bezier(0.25, 1, 0.5, 1) both; }
}
@keyframes ge-settle { from { opacity: 0; transform: translateY(8px); } }
`;

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const noSubscribe = () => () => {};

function langFromUrl(): Lang {
  const prefix = window.location.pathname.split("/")[1] as Lang;
  return LANGS.includes(prefix) ? prefix : "ro";
}

// Replaces the root layout, so it carries its own document and cannot rely on the app's providers or styles.
// The language comes from the URL prefix (/ro, /en, /sq, /it); the server snapshot stays "ro" so hydration matches.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const lang = useSyncExternalStore(noSubscribe, langFromUrl, () => "ro" as Lang);

  useEffect(() => {
    console.error(error);
    reportClientError(error, "render");
  }, [error]);

  const copy = errorTranslations[lang];

  return (
    <html lang={lang}>
      <body
        className="ge-body-root"
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        {/* No app stylesheet is loaded here, so the few states this page needs are written inline:
            the system's dark theme, a calm hover, a visible keyboard focus ring, and a short settle
            on arrival that is skipped under reduced motion. */}
        <style>{GLOBAL_ERROR_CSS}</style>
        <main role="alert" className="ge-main" style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.25, margin: "0 0 0.75rem" }}>{copy.title}</h1>
          <p className="ge-body" style={{ lineHeight: 1.6, margin: "0 0 1.5rem" }}>{copy.body}</p>
          {/* Whole buttons that wrap as a row; the home link is a full page load, the way out if retry keeps failing. */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "0.5rem 1rem" }}>
            <button
              type="button"
              className="ge-retry"
              onClick={() => retry()}
              style={{
                border: 0,
                borderRadius: "0.5rem",
                minHeight: "2.75rem",
                maxWidth: "100%",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {copy.retry}
            </button>
            <a
              className="ge-home"
              href={`/${lang}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "2.75rem",
                maxWidth: "100%",
                padding: "0 0.5rem",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textUnderlineOffset: "4px",
              }}
            >
              {copy.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

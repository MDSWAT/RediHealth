"use client";

import { useEffect, useSyncExternalStore } from "react";
import { errorTranslations } from "@/lib/i18n/error-translations";
import type { Lang } from "@/lib/i18n/translations";

const LANGS: Lang[] = ["ro", "en", "sq", "it"];
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
  }, [error]);

  const copy = errorTranslations[lang];

  return (
    <html lang={lang}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
          color: "#1f2933",
          background: "#ffffff",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <main role="alert" style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.75rem", lineHeight: 1.25, margin: "0 0 0.75rem" }}>{copy.title}</h1>
          <p style={{ lineHeight: 1.6, margin: "0 0 1.5rem", color: "#52606d" }}>{copy.body}</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#cc3846",
              color: "#ffffff",
              border: 0,
              borderRadius: "0.5rem",
              minHeight: "2.75rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copy.retry}
          </button>
        </main>
      </body>
    </html>
  );
}

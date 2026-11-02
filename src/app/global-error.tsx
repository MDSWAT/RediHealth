"use client";

import { useEffect } from "react";

// Replaces the root layout, so it carries its own document and cannot rely on the app's providers or styles.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
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
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.6, marginBottom: "1.5rem" }}>
            RediHealth could not load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#cc3846",
              color: "#ffffff",
              border: 0,
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

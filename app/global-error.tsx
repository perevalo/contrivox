"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0d0d0d", color: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#888", marginBottom: "1.5rem" }}>An unexpected error occurred. Our team has been notified.</p>
          <button
            onClick={reset}
            style={{ padding: "0.6rem 1.4rem", background: "#6c63ff", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.95rem" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

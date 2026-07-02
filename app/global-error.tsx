"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger";

const BRAND = "#078a92";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch {
      /* noop */
    }
    logger.error("[SSR] app/global-error boundary triggered", {
      event: "global_error",
      message: error.message,
      name: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#f8fafb",
          fontFamily: "Open Sans, sans-serif",
          color: "#0f172a",
        }}
      >
        <main
          role="alert"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <section
            style={{
              maxWidth: 520,
              width: "100%",
              background: "#fff",
              borderRadius: 20,
              padding: "44px 34px",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
              border: "1px solid #fecaca",
            }}
          >
            <h2
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#991b1b",
                marginBottom: 10,
              }}
            >
              Algo salió mal
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 22 }}>
              No pudimos completar esta acción. Intenta nuevamente.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  padding: "12px 28px",
                  fontSize: 15,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  color: "#fff",
                  background: BRAND,
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 18px",
                  fontSize: 15,
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 600,
                  color: "#0f172a",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Recargar
              </button>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}

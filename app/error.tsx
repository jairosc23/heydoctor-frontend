"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/lib/logger";

const BRAND = "#078a92";

export default function Error({
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
    // Production-safe: `logger` is dev-only; Sentry is the production sink.
    logger.error("[SSR] app/error boundary triggered", {
      event: "app_error",
      message: error.message,
      name: error.name,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafb",
        fontFamily: "Open Sans, sans-serif",
        padding: 24,
      }}
    >
      <ErrorBoundary
        name="root"
        showDiagnosticsInDev
        fallback={({ error: e, reset: localReset, errorId, digest }) => (
          <div
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
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#fef2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
              }}
            >
              !
            </div>
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
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 10 }}>
              {e.message || "Ocurrió un error inesperado."}
            </p>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 22 }}>
              ID del error: <code>{errorId}</code>
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={() => {
                  localReset();
                  reset();
                }}
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
            {process.env.NODE_ENV !== "production" && (
              <details style={{ marginTop: 18, textAlign: "left" }}>
                <summary style={{ cursor: "pointer", color: "#334155" }}>
                  Diagnóstico (solo dev)
                </summary>
                <pre
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 12,
                    background: "#0b1220",
                    color: "#e2e8f0",
                    fontSize: 12,
                    overflowX: "auto",
                  }}
                >
                  {JSON.stringify(
                    {
                      message: e.message,
                      name: e.name,
                      digest: digest ?? error.digest,
                      stack: e.stack,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>
            )}
          </div>
        )}
      >
        {/* Si este componente llega a renderizar sin error, mostramos UI mínima. */}
        <div />
      </ErrorBoundary>
    </div>
  );
}

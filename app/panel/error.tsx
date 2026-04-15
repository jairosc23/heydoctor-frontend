"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function PanelError({
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
    <div
      style={{
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #fecaca",
        }}
      >
        <h2
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#991b1b",
            marginBottom: 8,
          }}
        >
          Error en el panel
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>
          {error.message || "Ocurrió un error inesperado."}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 24px",
            fontSize: 14,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            color: "#fff",
            background: "#078a92",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

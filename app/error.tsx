"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

const BRAND = "#078a92";

export default function Error({
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafb",
        fontFamily: "Open Sans, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          borderRadius: 20,
          padding: "48px 36px",
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
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          {error.message || "Ocurrió un error inesperado."}
        </p>
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
      </div>
    </div>
  );
}

"use client";

import React from "react";

export type ConsultationConsentCardProps = {
  consentGivenAt: string | null | undefined;
  consentVersion: string | null | undefined;
};

function formatConsentDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Bloque de solo lectura: consentimiento de telemedicina asociado a la consulta (datos del backend).
 */
export function ConsultationConsentCard({
  consentGivenAt,
  consentVersion,
}: ConsultationConsentCardProps) {
  const dateLabel = formatConsentDate(consentGivenAt ?? undefined);
  const versionLabel =
    consentVersion != null && String(consentVersion).trim() !== ""
      ? String(consentVersion).trim()
      : null;

  const hasAny = dateLabel != null || versionLabel != null;

  return (
    <section
      aria-label="Información de consentimiento"
      style={{
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 0,
      }}
    >
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: 13,
          fontWeight: 600,
          color: "#64748b",
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}
      >
        Información de consentimiento
      </h3>
      {!hasAny ? (
        <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
          No hay datos de consentimiento registrados para esta consulta.
        </p>
      ) : (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {dateLabel ? (
            <li
              style={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.45,
              }}
            >
              <span aria-hidden style={{ marginRight: 6 }}>
                ✔
              </span>
              Consentimiento aceptado:{" "}
              <time dateTime={consentGivenAt ?? undefined}>{dateLabel}</time>
            </li>
          ) : null}
          {versionLabel ? (
            <li
              style={{
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.45,
              }}
            >
              <span aria-hidden style={{ marginRight: 6 }}>
                ✔
              </span>
              Versión: {versionLabel}
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}

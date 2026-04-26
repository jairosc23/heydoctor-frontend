"use client";

import React, { useState } from "react";

export type ConsentModalProps = {
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
  /** Mientras se registra el consentimiento en el backend */
  isSubmitting?: boolean;
  errorMessage?: string | null;
};

/**
 * Modal de consentimiento informado antes de iniciar videoconsulta.
 * La videollamada no debe montarse hasta que el usuario acepte.
 */
export function ConsentModal({
  onAccept,
  onDecline,
  isSubmitting = false,
  errorMessage = null,
}: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(15, 23, 42, 0.72)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflow: "auto",
          background: "#f8fafc",
          borderRadius: 16,
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(148, 163, 184, 0.2)",
        }}
      >
        <div style={{ padding: "28px 28px 20px" }}>
          <h2
            id="consent-modal-title"
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            Consentimiento para telemedicina
          </h2>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            Al continuar, accedes a una consulta a distancia por videollamada. El
            profesional evaluará tu caso con la información que aportes; la
            calidad del servicio depende de la conexión, del dispositivo y de la
            información veraz que proporciones.
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            Esta modalidad no sustituye la atención presencial cuando sea
            necesaria (urgencias, signos de alarma). Si tu situación lo requiere,
            acude a un centro de salud o servicios de urgencias.
          </p>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 13,
              lineHeight: 1.55,
              color: "#64748b",
            }}
          >
            El tratamiento de tus datos se realiza conforme a la normativa
            aplicable en materia de protección de datos y salud. Puedes retirar
            tu consentimiento en cualquier momento desde la configuración de tu
            cuenta cuando esté disponible.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              margin: "0 28px 12px",
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            margin: "0 28px",
            padding: "16px 14px",
            cursor: "pointer",
            borderRadius: 10,
            background: "#e2e8f0",
            border: "1px solid #cbd5e1",
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{
              marginTop: 3,
              width: 18,
              height: 18,
              accentColor: "#078a92",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
            Acepto el{" "}
            <a
              href="/telemedicine-consent"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#078a92", textDecoration: "underline" }}
            >
              consentimiento informado de telemedicina
            </a>
          </span>
        </label>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "flex-end",
            padding: "20px 28px 28px",
          }}
        >
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onDecline}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#475569",
              fontSize: 14,
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!checked || isSubmitting}
            onClick={() => {
              void onAccept();
            }}
            style={{
              padding: "12px 22px",
              borderRadius: 10,
              border: "none",
              background: checked && !isSubmitting ? "#078a92" : "#94a3b8",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor:
                checked && !isSubmitting ? "pointer" : "not-allowed",
              boxShadow:
                checked && !isSubmitting
                  ? "0 4px 14px rgba(7, 138, 146, 0.35)"
                  : "none",
            }}
          >
            {isSubmitting
              ? "Registrando consentimiento…"
              : "Continuar a la videollamada"}
          </button>
        </div>
      </div>
    </div>
  );
}

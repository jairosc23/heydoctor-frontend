"use client";

import React, { useEffect, useRef, useState } from "react";

export type TelemedicineConsentModalProps = {
  /** Renderiza el modal cuando `true`. */
  open: boolean;
  /** Versión vigente del consentimiento (la dicta el backend). */
  version?: string | null;
  /** Submit del consentimiento; debe resolver tras `POST /api/consents/telemedicine`. */
  onAccept: () => Promise<void>;
  /** Cancelación desde el usuario; deshabilita el flujo de creación de consulta. */
  onCancel: () => void;
};

/**
 * Modal de aceptación del consentimiento informado de telemedicina (médico tratante).
 * Responsabilidad única: capturar el "Aceptar y firmar" y delegar el POST al padre.
 */
export function TelemedicineConsentModal({
  open,
  version,
  onAccept,
  onCancel,
}: TelemedicineConsentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setSubmitting(false);
      setErrorMsg(null);
      setAgreed(false);
      const t = setTimeout(() => acceptBtnRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const handleAccept = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onAccept();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "No se pudo registrar el consentimiento";
      setErrorMsg(msg);
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="telemed-consent-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 14,
          maxWidth: 640,
          width: "100%",
          maxHeight: "min(86vh, 760px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
        }}
      >
        <header
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h2
            id="telemed-consent-title"
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Consentimiento informado de telemedicina
          </h2>
          {version ? (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Versión vigente: <strong>{version}</strong>
            </p>
          ) : null}
        </header>

        <div
          style={{
            padding: "16px 22px",
            overflowY: "auto",
            color: "#334155",
            fontSize: 14,
            lineHeight: 1.55,
          }}
        >
          <p>
            Como profesional de la salud que utiliza la plataforma{" "}
            <strong>HeyDoctor</strong> declaro y acepto, de manera informada y
            voluntaria, lo siguiente:
          </p>
          <ol style={{ paddingLeft: 20, margin: "8px 0" }}>
            <li>
              He leído los <em>Términos de uso</em> y la{" "}
              <em>Política de privacidad</em> de HeyDoctor, en especial las
              secciones relativas al tratamiento de datos clínicos sensibles
              (Ley 19.628, Ley 21.541 de Telemedicina – Chile).
            </li>
            <li>
              Acepto que las atenciones realizadas a través de la plataforma
              quedarán registradas con marca temporal del servidor, IP y
              <em> user-agent</em> del dispositivo, exclusivamente para fines de
              auditoría clínica y trazabilidad legal.
            </li>
            <li>
              Me comprometo a respetar el secreto profesional y a usar la
              plataforma únicamente para los fines clínicos para los cuales fue
              diseñada, conforme a la <em>lex artis</em> de mi especialidad.
            </li>
            <li>
              Entiendo que la prescripción electrónica realizada queda firmada
              digitalmente bajo mi responsabilidad y conforme a la normativa
              vigente.
            </li>
            <li>
              Reconozco que sin esta aceptación NO podré crear nuevas consultas
              ni utilizar las funciones clínicas de la plataforma.
            </li>
          </ol>
          <p style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>
            Al aceptar se registrará la marca temporal del servidor, junto con
            los datos técnicos de la conexión, para constituir prueba legal del
            consentimiento.
          </p>
        </div>

        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              fontSize: 13,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={submitting}
              style={{ marginTop: 3 }}
            />
            <span>
              He leído y acepto el consentimiento informado de telemedicina y
              autorizo su registro como prueba legal.
            </span>
          </label>

          {errorMsg ? (
            <p
              role="alert"
              style={{
                margin: 0,
                fontSize: 13,
                color: "#b91c1c",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              {errorMsg}
            </p>
          ) : null}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                padding: "10px 16px",
                background: "transparent",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              Cancelar
            </button>
            <button
              ref={acceptBtnRef}
              type="button"
              onClick={handleAccept}
              disabled={!agreed || submitting}
              style={{
                padding: "10px 18px",
                background: !agreed || submitting ? "#94d3d8" : "#078a92",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: !agreed || submitting ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {submitting ? "Registrando…" : "Aceptar y firmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  approveAiOutput,
  getAiProvenance,
  requestConsultationAssist,
  rejectAiOutput,
  type AiProvenance,
  type ConsultationAssistResponse,
} from "@/lib/services/consultation-assist";
import { FALLBACK_CONSULTATION_ASSIST } from "@/lib/clinical-fallbacks";

export type ConsultationAssistPanelProps = {
  initialChiefComplaint?: string;
  initialSymptoms?: string;
  initialNotes?: string;
  className?: string;
};

const FRIENDLY_ASSIST_NOTICE =
  "Ahora mismo no podemos conectar con el asistente inteligente. Te mostramos ideas generales de apoyo; en consulta siempre confirma con tu criterio clínico.";

/**
 * Panel opcional: sugerencias asistivas (no sustituye juicio clínico).
 */
export function ConsultationAssistPanel({
  initialChiefComplaint = "",
  initialSymptoms = "",
  initialNotes = "",
  className = "",
}: ConsultationAssistPanelProps) {
  const [chief, setChief] = useState(initialChiefComplaint);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setChief(initialChiefComplaint);
    setSymptoms(initialSymptoms);
    setNotes(initialNotes);
  }, [initialChiefComplaint, initialSymptoms, initialNotes]);
  const [assistNotice, setAssistNotice] = useState<string | null>(null);
  const [result, setResult] = useState<ConsultationAssistResponse | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [provenance, setProvenance] = useState<AiProvenance | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setAssistNotice(null);
    setResult(null);
    setUsedFallback(false);
    setProvenance(null);
    setReviewError(null);
    try {
      const data = await requestConsultationAssist({
        chiefComplaint: chief.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(data);
    } catch {
      setAssistNotice(FRIENDLY_ASSIST_NOTICE);
      setResult({ ...FALLBACK_CONSULTATION_ASSIST });
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const refreshProvenance = async (aiRunId: string) => {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const data = await getAiProvenance(aiRunId);
      setProvenance(data);
      setResult((current) =>
        current
          ? { ...current, approvalState: data.approvalState }
          : current
      );
    } catch {
      setReviewError("No se pudo cargar la trazabilidad del resultado IA.");
    } finally {
      setReviewLoading(false);
    }
  };

  const approve = async (aiRunId: string) => {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const data = await approveAiOutput(aiRunId, "Clinician reviewed output");
      setProvenance(data);
      setResult((current) =>
        current
          ? { ...current, approvalState: data.approvalState }
          : current
      );
    } catch {
      setReviewError("No se pudo aprobar el resultado IA.");
    } finally {
      setReviewLoading(false);
    }
  };

  const reject = async (aiRunId: string) => {
    const reason =
      typeof window !== "undefined"
        ? window.prompt("Motivo de rechazo (sin PHI):")?.trim()
        : null;
    if (!reason) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      const data = await rejectAiOutput(aiRunId, reason);
      setProvenance(data);
      setResult((current) =>
        current
          ? { ...current, approvalState: data.approvalState }
          : current
      );
    } catch {
      setReviewError("No se pudo rechazar el resultado IA.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div
      className={className}
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>
        Asistencia clínica (IA)
      </h3>
      <p
        style={{
          margin: "0 0 14px",
          fontSize: 12,
          color: "#64748b",
          lineHeight: 1.45,
        }}
      >
        Solo apoyo informativo. No decisiones automáticas ni diagnósticos
        definitivos. Verificar siempre en consulta.
      </p>
      {loading && (
        <div className="ia-live-strip" role="status" aria-live="polite">
          <span className="ia-live-strip__dot" aria-hidden />
          Generando sugerencias en vivo…
        </div>
      )}
      <label style={{ display: "block", fontSize: 12, color: "#475569" }}>
        Motivo / queja principal
        <textarea
          value={chief}
          onChange={(e) => setChief(e.target.value)}
          rows={2}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
      </label>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "#475569",
          marginTop: 10,
        }}
      >
        Síntomas
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={2}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
      </label>
      <label
        style={{
          display: "block",
          fontSize: 12,
          color: "#475569",
          marginTop: 10,
        }}
      >
        Notas
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          style={{
            display: "block",
            width: "100%",
            marginTop: 4,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            fontSize: 13,
          }}
        />
      </label>
      <button
        type="button"
        className="premium-tap"
        onClick={() => void run()}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 8,
          border: "none",
          background: loading ? "#94a3b8" : "#078a92",
          color: "#fff",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 13,
        }}
      >
        {loading ? "Generando…" : "Obtener sugerencias"}
      </button>
      {assistNotice && (
        <p
          role="status"
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#1e40af",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 8,
            padding: "10px 12px",
            lineHeight: 1.45,
          }}
        >
          {assistNotice}
        </p>
      )}
      {usedFallback && (
        <p
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "#92400e",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "8px 10px",
          }}
        >
          Modo guía: sugerencias generales mientras restablecemos la conexión.
        </p>
      )}
      {result && (
        <div
          className="assist-result-enter"
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
            fontSize: 13,
            color: "#334155",
          }}
        >
          <p
            style={{
              fontSize: 12,
              background: "#f8fafc",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
            }}
          >
            {result.assistiveOnlyNotice}
          </p>
          {result.generatedByAi && result.aiRunId && (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #dbeafe",
                background: "#eff6ff",
                color: "#1e3a8a",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  Generado por IA · {formatApprovalState(result.approvalState)}
                </span>
                <span style={{ fontSize: 11, color: "#475569" }}>
                  Run {result.aiRunId.slice(0, 8)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => void approve(result.aiRunId!)}
                  disabled={
                    reviewLoading || result.approvalState === "APPROVED"
                  }
                  style={reviewButtonStyle("#047857")}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => void reject(result.aiRunId!)}
                  disabled={
                    reviewLoading || result.approvalState === "REJECTED"
                  }
                  style={reviewButtonStyle("#b91c1c")}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => void refreshProvenance(result.aiRunId!)}
                  disabled={reviewLoading}
                  style={reviewButtonStyle("#334155")}
                >
                  Trazabilidad
                </button>
              </div>
              {provenance?.aiRunId === result.aiRunId && (
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 11,
                    color: "#334155",
                    lineHeight: 1.45,
                  }}
                >
                  Proveedor {provenance.provider} · Modelo{" "}
                  {provenance.modelName} · Prompt{" "}
                  {provenance.promptVersion ?? provenance.promptVersionId}
                  {provenance.reviewerId
                    ? ` · Revisado por ${provenance.reviewerId.slice(0, 8)}`
                    : ""}
                </p>
              )}
              {reviewError && (
                <p style={{ margin: "10px 0 0", fontSize: 11, color: "#991b1b" }}>
                  {reviewError}
                </p>
              )}
            </div>
          )}
          <Section title="Posibles diagnósticos (diferenciales)" items={result.possibleDiagnoses} />
          <Section title="Recomendaciones generales" items={result.recommendations} />
          <Section title="Educación / contexto" items={result.generalEducation} />
        </div>
      )}
    </div>
  );
}

function formatApprovalState(state?: string) {
  if (state === "APPROVED") return "aprobado";
  if (state === "REJECTED") return "rechazado";
  return "pendiente de revisión";
}

function reviewButtonStyle(background: string): React.CSSProperties {
  return {
    border: "none",
    borderRadius: 8,
    background,
    color: "white",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    padding: "7px 10px",
  };
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 12 }}>
      <strong style={{ display: "block", marginBottom: 6 }}>{title}</strong>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((x, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

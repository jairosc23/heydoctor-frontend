"use client";

import React, { useEffect, useState } from "react";
import {
  getConsultationAssist,
  type ConsultationAssistResponse,
} from "@/lib/clinical-ai-facade";
import { CopilotHubCta } from "@/components/clinical/CopilotHubCta";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

export type ConsultationAssistPanelProps = {
  initialChiefComplaint?: string;
  initialSymptoms?: string;
  initialNotes?: string;
  className?: string;
};

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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConsultationAssistResponse | null>(null);

  useEffect(() => {
    setChief(initialChiefComplaint);
    setSymptoms(initialSymptoms);
    setNotes(initialNotes);
  }, [initialChiefComplaint, initialSymptoms, initialNotes]);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await getConsultationAssist({
        chiefComplaint: chief.trim() || undefined,
        symptoms: symptoms.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(data);
    } catch (e) {
      setError(
        getApiErrorMessage(
          e,
          "No se pudo conectar con el asistente clínico. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setLoading(false);
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
      <CopilotHubCta className="mb-3" />
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
      {error && (
        <p
          role="alert"
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#991b1b",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "10px 12px",
            lineHeight: 1.45,
          }}
        >
          {error}
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
          {result.aiRunId && (
            <p
              style={{
                fontSize: 11,
                color: "#64748b",
                marginBottom: 10,
                fontFamily: "monospace",
              }}
            >
              Trazabilidad AI: {result.aiRunId.slice(0, 8)}…
              {result.approvalState ? ` · ${result.approvalState}` : ""}
            </p>
          )}
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
          <Section title="Posibles diagnósticos (diferenciales)" items={result.possibleDiagnoses} />
          <Section title="Recomendaciones generales" items={result.recommendations} />
          <Section title="Educación / contexto" items={result.generalEducation} />
        </div>
      )}
    </div>
  );
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
